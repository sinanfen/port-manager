use std::collections::HashSet;
use std::ffi::OsString;
use std::path::Path;

use log::{debug, info};
use netstat2::{
    get_sockets_info, AddressFamilyFlags, ProtocolFlags, ProtocolSocketInfo, SocketInfo,
    TcpState,
};
use sysinfo::{Pid, ProcessesToUpdate, System};

use crate::errors::{AppError, AppResult};
use crate::models::{AppSettings, PortEntry};

#[derive(Debug, Clone)]
struct SocketSnapshot {
    port: u16,
    host: String,
    is_listening: bool,
    pid: Option<u32>,
}

#[derive(Debug, Clone)]
struct ProcessMetadata {
    process_name: Option<String>,
    executable_path: Option<String>,
    working_directory: Option<String>,
    command_line: Option<String>,
    classification: Option<String>,
    is_accessible: bool,
    requires_elevation: bool,
}

pub fn scan_ports(settings: &AppSettings) -> AppResult<Vec<PortEntry>> {
    if !settings.scan_tcp {
        return Ok(Vec::new());
    }

    let mut system = System::new();
    system.refresh_processes(ProcessesToUpdate::All, true);

    let sockets = get_sockets_info(
        AddressFamilyFlags::IPV4 | AddressFamilyFlags::IPV6,
        ProtocolFlags::TCP,
    )
    .map_err(|error| AppError::ScanFailed(error.to_string()))?;

    let mut seen = HashSet::new();
    let mut entries = Vec::new();

    for socket in sockets {
        let Some(snapshot) = socket_to_snapshot(&socket) else {
            continue;
        };

        let entry_id = format!(
            "tcp-{}-{}-{}",
            snapshot.host,
            snapshot.port,
            snapshot.pid.unwrap_or_default()
        );

        if !seen.insert(entry_id.clone()) {
            continue;
        }

        let metadata = snapshot
            .pid
            .and_then(|pid| resolve_process_metadata(pid, &system));

        let entry = build_port_entry(entry_id, snapshot, metadata, settings);

        if settings.hide_inaccessible_processes && !entry.is_accessible {
            continue;
        }

        entries.push(entry);
    }

    entries.sort_by_key(|entry| entry.port);
    info!("Completed TCP scan with {} entries", entries.len());

    Ok(entries)
}

fn socket_to_snapshot(socket: &SocketInfo) -> Option<SocketSnapshot> {
    match &socket.protocol_socket_info {
        ProtocolSocketInfo::Tcp(tcp_socket) => Some(SocketSnapshot {
            port: tcp_socket.local_port,
            host: tcp_socket.local_addr.to_string(),
            is_listening: tcp_socket.state == TcpState::Listen,
            pid: socket.associated_pids.first().copied(),
        }),
        ProtocolSocketInfo::Udp(_) => None,
    }
}

fn resolve_process_metadata(pid: u32, system: &System) -> Option<ProcessMetadata> {
    let process = system.process(Pid::from_u32(pid))?;

    let process_name = sanitize_process_name(process.name().to_string_lossy().to_string());
    let executable_path = process.exe().map(path_to_string).filter(|value| !value.is_empty());
    let working_directory = process
        .cwd()
        .map(path_to_string)
        .filter(|value| !value.is_empty());
    let command_line = join_command_line(process.cmd());
    let classification = classify_process(process_name.as_deref(), executable_path.as_deref());

    let is_accessible = process_name.is_some()
        || executable_path.is_some()
        || working_directory.is_some()
        || command_line.is_some();
    let requires_elevation = !is_accessible;

    debug!(
        "Resolved process metadata for pid {} accessible={}",
        pid, is_accessible
    );

    Some(ProcessMetadata {
        process_name,
        executable_path,
        working_directory,
        command_line,
        classification,
        is_accessible,
        requires_elevation,
    })
}

fn build_port_entry(
    id: String,
    snapshot: SocketSnapshot,
    metadata: Option<ProcessMetadata>,
    settings: &AppSettings,
) -> PortEntry {
    let suggested_url = if snapshot.is_listening {
        Some(format!(
            "{}://{}:{}",
            settings.default_protocol, settings.default_url_host, snapshot.port
        ))
    } else {
        None
    };

    let process_name = metadata.as_ref().and_then(|value| value.process_name.clone());
    let executable_path = metadata
        .as_ref()
        .and_then(|value| value.executable_path.clone());
    let working_directory = metadata
        .as_ref()
        .and_then(|value| value.working_directory.clone());
    let command_line = metadata.as_ref().and_then(|value| value.command_line.clone());
    let classification = metadata.as_ref().and_then(|value| value.classification.clone());
    let is_accessible = metadata.as_ref().is_some_and(|value| value.is_accessible);
    let requires_elevation = metadata
        .as_ref()
        .is_some_and(|value| value.requires_elevation)
        || (snapshot.pid.is_some() && !is_accessible);

    PortEntry {
        id,
        port: snapshot.port,
        protocol: "tcp".to_string(),
        host: snapshot.host,
        is_listening: snapshot.is_listening,
        suggested_url,
        pid: snapshot.pid,
        process_name,
        executable_path,
        working_directory,
        command_line,
        classification: Some(classification.unwrap_or_else(|| "unknown".to_string())),
        is_accessible,
        requires_elevation,
    }
}

fn join_command_line(command_line: &[OsString]) -> Option<String> {
    let joined = command_line
        .iter()
        .map(|value| value.to_string_lossy().trim().to_string())
        .filter(|value| !value.is_empty())
        .collect::<Vec<_>>()
        .join(" ");

    if joined.is_empty() {
        None
    } else {
        Some(joined)
    }
}

fn sanitize_process_name(value: String) -> Option<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}

fn path_to_string(path: &Path) -> String {
    path.to_string_lossy().to_string()
}

fn classify_process(process_name: Option<&str>, executable_path: Option<&str>) -> Option<String> {
    let composite = format!(
        "{} {}",
        process_name.unwrap_or_default().to_lowercase(),
        executable_path.unwrap_or_default().to_lowercase()
    );

    let classification = if composite.contains("node") {
        "node"
    } else if composite.contains("python") {
        "python"
    } else if composite.contains("postgres")
        || composite.contains("redis")
        || composite.contains("mysql")
        || composite.contains("mongo")
    {
        "database"
    } else if composite.trim().is_empty() {
        "unknown"
    } else {
        "native"
    };

    Some(classification.to_string())
}

#[cfg(test)]
mod tests {
    use super::{build_port_entry, classify_process, SocketSnapshot};
    use crate::models::AppSettings;

    #[test]
    fn builds_a_suggested_url_for_listening_ports() {
        let entry = build_port_entry(
            "tcp-127.0.0.1-3000-42".into(),
            SocketSnapshot {
                port: 3000,
                host: "127.0.0.1".into(),
                is_listening: true,
                pid: Some(42),
            },
            None,
            &AppSettings::default(),
        );

        assert_eq!(entry.suggested_url.as_deref(), Some("http://127.0.0.1:3000"));
        assert_eq!(entry.classification.as_deref(), Some("unknown"));
    }

    #[test]
    fn marks_missing_metadata_as_inaccessible() {
        let entry = build_port_entry(
            "tcp-127.0.0.1-8080-0".into(),
            SocketSnapshot {
                port: 8080,
                host: "127.0.0.1".into(),
                is_listening: false,
                pid: None,
            },
            None,
            &AppSettings::default(),
        );

        assert!(!entry.is_accessible);
        assert!(!entry.requires_elevation);
    }

    #[test]
    fn flags_unresolved_process_metadata_when_pid_exists() {
        let entry = build_port_entry(
            "tcp-127.0.0.1-5000-42".into(),
            SocketSnapshot {
                port: 5000,
                host: "127.0.0.1".into(),
                is_listening: true,
                pid: Some(42),
            },
            None,
            &AppSettings::default(),
        );

        assert!(entry.requires_elevation);
    }

    #[test]
    fn classifies_common_process_families() {
        assert_eq!(
            classify_process(Some("node.exe"), Some("C:\\Program Files\\node.exe")).as_deref(),
            Some("node")
        );
        assert_eq!(
            classify_process(Some("python.exe"), Some("C:\\Python\\python.exe")).as_deref(),
            Some("python")
        );
    }
}
