// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod logger;
mod menu;
mod commands;

use logger::{init_logger, write_log, read_logs, get_log_dates};
use commands::{
    read_file, save_file, open_folder, read_directory, get_store_path,
    export_html, search_in_files,
    create_file, create_directory, rename_path, delete_path,
    start_fs_watch, stop_fs_watch,
    get_git_branch, update_recent_menu, open_in_terminal,
    create_new_window, open_external_url,
    WatcherState, AppHandleState,
};
#[cfg(target_os = "macos")]
use commands::reveal_in_finder;
#[cfg(target_os = "windows")]
use commands::reveal_in_explorer;

use std::sync::{Arc, Mutex};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    tauri::Builder::default()
        .manage(Arc::new(Mutex::new(WatcherState::new())))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            read_file, save_file, open_folder, read_directory, get_store_path,
            write_log, read_logs, get_log_dates,
            export_html, search_in_files,
            create_file, create_directory, rename_path, delete_path,
            start_fs_watch, stop_fs_watch,
            get_git_branch, update_recent_menu, open_in_terminal,
            #[cfg(target_os = "macos")]
            reveal_in_finder,
            #[cfg(target_os = "windows")]
            reveal_in_explorer,
            create_new_window, open_external_url,
        ])
        .setup(|app| {
            let app_handle = app.handle();
            let log_dir = app_handle.path().app_data_dir()
                .expect("Failed to get app data dir")
                .join("logs");
            init_logger(log_dir).expect("Failed to initialize logger");

            menu::build(app)?;

            app.manage(AppHandleState { handle: app.handle().clone() });

            let app_handle = app.handle().clone();
            app.on_menu_event(move |_window, event| {
                menu::handle_event(&app_handle, event);
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
