use std::fs;
use std::path::PathBuf;

use directories::ProjectDirs;

use crate::errors::{AppError, AppResult};
use crate::models::AppSettings;

#[derive(Debug, Clone)]
pub struct SettingsService {
    path: PathBuf,
}

impl SettingsService {
    pub fn new() -> AppResult<Self> {
        let project_dirs = ProjectDirs::from("com", "PortManager", "PortManager")
            .ok_or_else(|| AppError::SettingsFailed("Unable to resolve a config directory".into()))?;

        let config_dir = project_dirs.config_dir();
        fs::create_dir_all(config_dir).map_err(|error| {
            AppError::SettingsFailed(format!("Unable to create config directory: {error}"))
        })?;

        Ok(Self {
            path: config_dir.join("settings.json"),
        })
    }

    pub fn load_or_create(&self) -> AppResult<AppSettings> {
        if !self.path.exists() {
            let defaults = AppSettings::default();
            self.save(&defaults)?;
            return Ok(defaults);
        }

        let contents = fs::read_to_string(&self.path).map_err(|error| {
            AppError::SettingsFailed(format!("Unable to read settings file: {error}"))
        })?;

        serde_json::from_str::<AppSettings>(&contents).map_err(|error| {
            AppError::SettingsFailed(format!("Unable to parse settings file: {error}"))
        })
    }

    pub fn save(&self, settings: &AppSettings) -> AppResult<()> {
        let contents = serde_json::to_string_pretty(settings).map_err(|error| {
            AppError::SettingsFailed(format!("Unable to serialize settings: {error}"))
        })?;

        fs::write(&self.path, contents).map_err(|error| {
            AppError::SettingsFailed(format!("Unable to write settings file: {error}"))
        })
    }
}

