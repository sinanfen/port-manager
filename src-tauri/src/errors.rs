use serde::ser::{SerializeStruct, Serializer};
use serde::Serialize;
use thiserror::Error;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Failed to scan system ports: {0}")]
    ScanFailed(String),
    #[error("Failed to execute process action: {0}")]
    ActionFailed(String),
    #[error("Failed to load or persist settings: {0}")]
    SettingsFailed(String),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("AppError", 2)?;
        state.serialize_field("message", &self.to_string())?;
        state.serialize_field(
            "code",
            match self {
                Self::ScanFailed(_) => "scan_failed",
                Self::ActionFailed(_) => "action_failed",
                Self::SettingsFailed(_) => "settings_failed",
            },
        )?;
        state.end()
    }
}
