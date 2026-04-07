use std::path::{Path, PathBuf};
use std::process::Command;

use crate::errors::{AppError, AppResult};

pub fn kill_process(pid: u32, force: bool) -> AppResult<()> {
    if pid == std::process::id() {
        return Err(AppError::ActionFailed(
            "PortManager will not terminate its own process.".into(),
        ));
    }

    let mut command = Command::new("taskkill");
    command.arg("/PID").arg(pid.to_string());

    if force {
        command.arg("/F");
    }

    let output = command.output().map_err(|error| {
        AppError::ActionFailed(format!("Unable to launch taskkill for PID {pid}: {error}"))
    })?;

    if output.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let details = if !stderr.is_empty() {
        stderr
    } else if !stdout.is_empty() {
        stdout
    } else {
        "taskkill exited with an unknown error".to_string()
    };

    Err(AppError::ActionFailed(details))
}

pub fn open_in_browser(url: &str) -> AppResult<()> {
    if url.trim().is_empty() {
        return Err(AppError::ActionFailed(
            "No URL was provided for the browser action.".into(),
        ));
    }

    run_command(
        Command::new("cmd")
            .args(["/C", "start", "", url]),
        "Unable to open the browser",
    )
}

pub fn open_folder(working_directory: Option<String>, executable_path: Option<String>) -> AppResult<()> {
    let directory = resolve_directory(working_directory, executable_path)?;

    run_command(
        Command::new("explorer.exe").arg(directory),
        "Unable to open the folder",
    )
}

pub fn open_terminal(
    working_directory: Option<String>,
    executable_path: Option<String>,
) -> AppResult<()> {
    let directory = resolve_directory(working_directory, executable_path)?;

    let mut windows_terminal = Command::new("wt.exe");
    windows_terminal.arg("-d").arg(&directory);

    match windows_terminal.spawn() {
        Ok(_) => Ok(()),
        Err(_) => {
            let mut powershell = Command::new("powershell.exe");
            powershell
                .arg("-NoExit")
                .arg("-NoLogo")
                .current_dir(&directory);

            run_command(&mut powershell, "Unable to open a terminal")
        }
    }
}

fn resolve_directory(
    working_directory: Option<String>,
    executable_path: Option<String>,
) -> AppResult<PathBuf> {
    if let Some(path) = first_existing_directory(working_directory.as_deref()) {
        return Ok(path);
    }

    if let Some(path) = resolve_from_executable(executable_path.as_deref()) {
        return Ok(path);
    }

    Err(AppError::ActionFailed(
        "No accessible working directory or executable folder is available for this process."
            .into(),
    ))
}

fn first_existing_directory(path: Option<&str>) -> Option<PathBuf> {
    let candidate = PathBuf::from(path?.trim());
    if candidate.is_dir() {
        Some(candidate)
    } else {
        None
    }
}

fn resolve_from_executable(path: Option<&str>) -> Option<PathBuf> {
    let candidate = PathBuf::from(path?.trim());

    if candidate.is_dir() {
        return Some(candidate);
    }

    candidate.parent().filter(|parent| parent.is_dir()).map(Path::to_path_buf)
}

fn run_command(command: &mut Command, message: &str) -> AppResult<()> {
    command.spawn().map(|_| ()).map_err(|error| {
        AppError::ActionFailed(format!("{message}: {error}"))
    })
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use crate::errors::AppError;

    use super::{kill_process, resolve_from_executable};

    #[test]
    fn prevents_self_kill() {
        let result = kill_process(std::process::id(), false);

        match result {
            Err(AppError::ActionFailed(message)) => {
                assert!(message.contains("will not terminate its own process"));
            }
            other => panic!("unexpected result: {other:?}"),
        }
    }

    #[test]
    fn resolves_executable_parent_directory() {
        let current_executable = std::env::current_exe().expect("current executable should exist");
        let current_executable_string = current_executable.to_string_lossy().to_string();
        let expected_parent = current_executable
            .parent()
            .expect("current executable should have a parent")
            .to_path_buf();
        let path = resolve_from_executable(Some(&current_executable_string));

        assert_eq!(path, Some(PathBuf::from(expected_parent)));
    }
}
