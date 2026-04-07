use std::sync::atomic::Ordering;

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, AppHandle, Emitter, Manager, WebviewWindow, WindowEvent,
};

use crate::AppState;

const TRAY_SHOW_ID: &str = "tray_show";
const TRAY_HIDE_ID: &str = "tray_hide";
const TRAY_REFRESH_ID: &str = "tray_refresh";
const TRAY_QUIT_ID: &str = "tray_quit";
const TRAY_REFRESH_EVENT: &str = "tray://refresh-ports";

pub fn setup_system_tray(app: &App) -> tauri::Result<()> {
    let show_item = MenuItem::with_id(app, TRAY_SHOW_ID, "Show PortManager", true, None::<&str>)?;
    let hide_item = MenuItem::with_id(app, TRAY_HIDE_ID, "Hide Window", true, None::<&str>)?;
    let refresh_item =
        MenuItem::with_id(app, TRAY_REFRESH_ID, "Refresh Ports", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit_item = MenuItem::with_id(app, TRAY_QUIT_ID, "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[&show_item, &refresh_item, &hide_item, &separator, &quit_item],
    )?;

    let app_handle = app.handle().clone();
    if let Some(main_window) = app.get_webview_window("main") {
        register_close_to_tray(main_window, app_handle.clone());
    }

    TrayIconBuilder::with_id("port-manager-tray")
        .icon(tauri::include_image!("icons/tray-icon.png"))
        .tooltip("PortManager")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id().as_ref() {
            TRAY_SHOW_ID => {
                let _ = show_main_window(app);
            }
            TRAY_HIDE_ID => {
                let _ = hide_main_window(app);
            }
            TRAY_REFRESH_ID => {
                let _ = app.emit(TRAY_REFRESH_EVENT, ());
                let _ = show_main_window(app);
            }
            TRAY_QUIT_ID => {
                app.state::<AppState>()
                    .is_quitting
                    .store(true, Ordering::SeqCst);
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let _ = show_main_window(&tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

fn register_close_to_tray(main_window: WebviewWindow, app_handle: AppHandle) {
    let window_handle = main_window.clone();

    main_window.on_window_event(move |event| {
        if let WindowEvent::CloseRequested { api, .. } = event {
            if app_handle
                .state::<AppState>()
                .is_quitting
                .load(Ordering::SeqCst)
            {
                return;
            }

            api.prevent_close();
            let _ = window_handle.hide();
        }
    });
}

fn show_main_window(app: &AppHandle) -> tauri::Result<()> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }

    Ok(())
}

fn hide_main_window(app: &AppHandle) -> tauri::Result<()> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }

    Ok(())
}
