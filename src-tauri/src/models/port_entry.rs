use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct PortEntry {
    pub id: String,
    pub port: u16,
    pub protocol: String,
    pub host: String,
    pub is_listening: bool,
    pub suggested_url: Option<String>,
    pub pid: Option<u32>,
    pub process_name: Option<String>,
    pub executable_path: Option<String>,
    pub working_directory: Option<String>,
    pub command_line: Option<String>,
    pub classification: Option<String>,
    pub is_accessible: bool,
    pub requires_elevation: bool,
}

