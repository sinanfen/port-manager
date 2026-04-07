mod commands;
mod errors;
mod models;
mod services;
mod tray;

use log::info;
use services::settings_service::SettingsService;
use std::sync::atomic::AtomicBool;
use tauri::Manager;

pub struct AppState {
    pub is_quitting: AtomicBool,
    pub settings_service: SettingsService,
}

pub fn run() {
    let settings_service = SettingsService::new().expect("settings service should initialize");
    let current_settings = settings_service
        .load_or_create()
        .expect("settings should load or be created");

    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .manage(AppState {
            is_quitting: AtomicBool::new(false),
            settings_service,
        })
        .invoke_handler(tauri::generate_handler![
            commands::ports::get_ports,
            commands::ports::refresh_ports,
            commands::ports::kill_process,
            commands::ports::open_in_browser,
            commands::ports::open_folder,
            commands::ports::open_terminal
        ])
        .setup(move |app| {
            tray::setup_system_tray(app)?;
            info!(
                "PortManager initialized for window count {} with host {}",
                app.webview_windows().len(),
                current_settings.default_url_host
            );
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
