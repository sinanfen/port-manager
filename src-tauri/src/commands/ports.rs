use tauri::State;

use crate::errors::AppResult;
use crate::models::PortEntry;
use crate::services::actions::{
    kill_process as kill_process_by_pid, open_folder as open_folder_for_process,
    open_in_browser as open_url_in_browser, open_terminal as open_terminal_for_process,
};
use crate::services::discovery::scan_ports;
use crate::AppState;

#[tauri::command]
pub fn get_ports(state: State<'_, AppState>) -> AppResult<Vec<PortEntry>> {
    let settings = state.settings_service.load_or_create()?;
    scan_ports(&settings)
}

#[tauri::command]
pub fn refresh_ports(state: State<'_, AppState>) -> AppResult<Vec<PortEntry>> {
    let settings = state.settings_service.load_or_create()?;
    scan_ports(&settings)
}

#[tauri::command]
pub fn kill_process(pid: u32, force: bool) -> AppResult<()> {
    kill_process_by_pid(pid, force)
}

#[tauri::command]
pub fn open_in_browser(url: String) -> AppResult<()> {
    open_url_in_browser(&url)
}

#[tauri::command]
pub fn open_folder(working_directory: Option<String>, executable_path: Option<String>) -> AppResult<()> {
    open_folder_for_process(working_directory, executable_path)
}

#[tauri::command]
pub fn open_terminal(
    working_directory: Option<String>,
    executable_path: Option<String>,
) -> AppResult<()> {
    open_terminal_for_process(working_directory, executable_path)
}
