use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct AppSettings {
    pub scan_tcp: bool,
    pub default_url_host: String,
    pub default_protocol: String,
    pub refresh_interval_ms: u64,
    pub hide_inaccessible_processes: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            scan_tcp: true,
            default_url_host: "127.0.0.1".to_string(),
            default_protocol: "http".to_string(),
            refresh_interval_ms: 5_000,
            hide_inaccessible_processes: false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::AppSettings;

    #[test]
    fn serializes_and_deserializes_defaults() {
        let settings = AppSettings::default();
        let serialized = serde_json::to_string(&settings).expect("settings should serialize");
        let deserialized: AppSettings =
            serde_json::from_str(&serialized).expect("settings should deserialize");

        assert_eq!(settings, deserialized);
    }
}

