mod logger;
mod commands;

use logger::{init_logger, write_log, read_logs, get_log_dates, log, LogLevel};
use commands::{read_file, save_file, read_directory, export_html, search_in_files, create_file, create_directory, rename_path, delete_path};
use std::fs;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{Manager, Emitter};
use tauri::menu::{Menu, MenuItem, Submenu};

/// Holds the active file system watcher thread's stop flag.
struct WatcherState {
    stop_flag: Option<Arc<AtomicBool>>,
}

impl WatcherState {
    fn new() -> Self {
        WatcherState { stop_flag: None }
    }

    /// Stop the current watcher thread if running.
    fn stop(&mut self) {
        if let Some(flag) = self.stop_flag.take() {
            flag.store(true, Ordering::Relaxed);
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    tauri::Builder::default()
        .manage(Arc::new(Mutex::new(WatcherState::new())))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            save_file,
            open_folder,
            read_directory,
            get_store_path,
            write_log,
            read_logs,
            get_log_dates,
            export_html,
            search_in_files,
            create_file,
            create_directory,
            rename_path,
            delete_path,
            start_fs_watch,
            stop_fs_watch
        ])
        .setup(|app| {
            // Initialize logger
            let app_handle = app.handle();
            let log_dir = app_handle.path().app_data_dir()
                .expect("Failed to get app data dir")
                .join("logs");
            
            init_logger(log_dir).expect("Failed to initialize logger");
            
            // Create menu items
            let open = MenuItem::with_id(app, "open", "Open...", true, Some("CmdOrCtrl+O"))?;
            let open_folder = MenuItem::with_id(app, "open_folder", "Open Folder", true, None::<&str>)?;
            let close_folder = MenuItem::with_id(app, "close_folder", "Close Folder", true, None::<&str>)?;
            let save = MenuItem::with_id(app, "save", "Save", true, Some("CmdOrCtrl+S"))?;
            let save_as = MenuItem::with_id(app, "save_as", "Save As...", true, Some("CmdOrCtrl+Shift+S"))?;
            let export_pdf = MenuItem::with_id(app, "export_pdf", "Export as PDF", true, Some("CmdOrCtrl+Shift+P"))?;
            let export_html_item = MenuItem::with_id(app, "export_html", "Export as HTML", true, Some("CmdOrCtrl+Shift+E"))?;
            let export_submenu = Submenu::with_items(app, "Export", true, &[
                &export_pdf,
                &export_html_item,
            ])?;
            let quit = MenuItem::with_id(app, "quit", "Quit Seven MD", true, Some("CmdOrCtrl+Q"))?;
            
            let copy = MenuItem::with_id(app, "copy", "Copy", true, Some("CmdOrCtrl+C"))?;
            let cut = MenuItem::with_id(app, "cut", "Cut", true, Some("CmdOrCtrl+X"))?;
            let paste = MenuItem::with_id(app, "paste", "Paste", true, Some("CmdOrCtrl+V"))?;
            let select_all = MenuItem::with_id(app, "select_all", "Select All", true, Some("CmdOrCtrl+A"))?;
            
            let toggle_sidebar = MenuItem::with_id(app, "toggle_sidebar", "Toggle Sidebar", true, Some("CmdOrCtrl+B"))?;
            let zoom_in = MenuItem::with_id(app, "zoom_in", "Zoom In", true, Some("CmdOrCtrl+="))?;
            let zoom_out = MenuItem::with_id(app, "zoom_out", "Zoom Out", true, Some("CmdOrCtrl+-"))?;
            let reset_zoom = MenuItem::with_id(app, "reset_zoom", "Reset Zoom", true, Some("CmdOrCtrl+0"))?;
            
            let about = MenuItem::with_id(app, "about", "About Seven MD", true, None::<&str>)?;
            
            // Build File menu
            let file_menu = Submenu::with_items(app, "File", true, &[
                &open,
                &open_folder,
                &close_folder,
                &save,
                &save_as,
                &export_submenu,
                &quit,
            ])?;
            
            // Build Edit menu
            let edit_menu = Submenu::with_items(app, "Edit", true, &[
                &copy,
                &cut,
                &paste,
                &select_all,
            ])?;
            
            // Build View menu
            let view_menu = Submenu::with_items(app, "View", true, &[
                &toggle_sidebar,
                &zoom_in,
                &zoom_out,
                &reset_zoom,
            ])?;
            
            // Build Help menu
            let help_menu = Submenu::with_items(app, "Help", true, &[
                &about,
            ])?;
            
            // Build the main menu
            let menu = Menu::with_items(app, &[
                &file_menu,
                &edit_menu,
                &view_menu,
                &help_menu,
            ])?;
            
            // Set the menu for the app
            app.set_menu(menu)?;
            
            // Handle menu events
            let app_handle = app.handle().clone();
            app.on_menu_event(move |_window, event| {
                match event.id().as_ref() {
                    "open" => {
                        let _ = app_handle.emit("menu-open", ());
                    }
                    "open_folder" => {
                        let _ = app_handle.emit("menu-open-folder", ());
                    }
                    "close_folder" => {
                        let _ = app_handle.emit("menu-close-folder", ());
                    }
                    "save" => {
                        let _ = app_handle.emit("menu-save", ());
                    }
                    "save_as" => {
                        let _ = app_handle.emit("menu-save-as", ());
                    }
                    "quit" => {
                        let _ = app_handle.emit("menu-quit", ());
                    }
                    "copy" => {
                        let _ = app_handle.emit("menu-copy", ());
                    }
                    "cut" => {
                        let _ = app_handle.emit("menu-cut", ());
                    }
                    "paste" => {
                        let _ = app_handle.emit("menu-paste", ());
                    }
                    "select_all" => {
                        let _ = app_handle.emit("menu-select-all", ());
                    }
                    "toggle_sidebar" => {
                        let _ = app_handle.emit("menu-toggle-sidebar", ());
                    }
                    "zoom_in" => {
                        let _ = app_handle.emit("menu-zoom-in", ());
                    }
                    "zoom_out" => {
                        let _ = app_handle.emit("menu-zoom-out", ());
                    }
                    "reset_zoom" => {
                        let _ = app_handle.emit("menu-reset-zoom", ());
                    }
                    "about" => {
                        let _ = app_handle.emit("menu-about", ());
                    }
                    "export_pdf" => {
                        let _ = log(LogLevel::Debug, "export_pdf menu clicked".to_string(), None, Some("menu".to_string()));
                        let _ = app_handle.emit("menu-export-pdf", ());
                    }
                    "export_html" => {
                        let _ = log(LogLevel::Debug, "export_html menu clicked".to_string(), None, Some("menu".to_string()));
                        let _ = app_handle.emit("menu-export-html", ());
                    }
                    _ => {}
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn open_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let _ = log(LogLevel::Debug, "Opening folder dialog".to_string(), None, Some("open_folder".to_string()));
    
    use tauri_plugin_dialog::DialogExt;
    
    let folder_path = app.dialog()
        .file()
        .blocking_pick_folder();
    
    match &folder_path {
        Some(path) => {
            let _ = log(LogLevel::Info, "Folder selected".to_string(), 
                Some(serde_json::json!({"path": path.to_string()})), 
                Some("open_folder".to_string()));
        }
        None => {
            let _ = log(LogLevel::Debug, "Folder selection cancelled".to_string(), None, Some("open_folder".to_string()));
        }
    }
    
    Ok(folder_path.map(|p| p.to_string()))
}

#[tauri::command]
fn get_store_path(app: tauri::AppHandle) -> Result<String, String> {
    let _ = log(LogLevel::Debug, "Getting store path".to_string(), None, Some("get_store_path".to_string()));
    
    match app.path().app_data_dir() {
        Ok(app_dir) => {
            if let Err(e) = fs::create_dir_all(&app_dir) {
                let _ = log(LogLevel::Error, format!("Failed to create app data dir: {}", e), 
                    Some(serde_json::json!({"error": e.to_string()})), 
                    Some("get_store_path".to_string()));
                return Err(format!("Failed to create app data dir: {}", e));
            }
            
            let path = app_dir.to_string_lossy().to_string();
            let _ = log(LogLevel::Debug, "Store path retrieved".to_string(), 
                Some(serde_json::json!({"path": path})), 
                Some("get_store_path".to_string()));
            Ok(path)
        }
        Err(e) => {
            let _ = log(LogLevel::Error, format!("Failed to get app data dir: {}", e), 
                Some(serde_json::json!({"error": e.to_string()})), 
                Some("get_store_path".to_string()));
            Err(format!("Failed to get app data dir: {}", e))
        }
    }
}

/// Start watching a folder for file system changes using a polling thread.
/// If a watcher is already running, it is stopped first (restart semantics).
/// Emits `fs-watch:changed` to the frontend window on any change.
#[tauri::command]
fn start_fs_watch(
    app: tauri::AppHandle,
    folder_path: String,
    watcher_state: tauri::State<Arc<Mutex<WatcherState>>>,
) -> Result<(), String> {
    let _ = log(LogLevel::Info, format!("Starting fs watch on: {}", folder_path), None, Some("start_fs_watch".to_string()));

    let path = std::path::PathBuf::from(&folder_path);
    if !path.is_dir() {
        return Err(format!("Not a directory: {}", folder_path));
    }

    let mut state = watcher_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    // Stop any existing watcher
    state.stop();

    let stop_flag = Arc::new(AtomicBool::new(false));
    let stop_flag_clone = stop_flag.clone();
    let app_handle = app.clone();

    std::thread::spawn(move || {
        use std::time::{Duration, SystemTime};
        use std::collections::HashMap;

        // Collect initial mtimes
        let mut last_mtimes: HashMap<std::path::PathBuf, SystemTime> = HashMap::new();
        collect_mtimes(&path, &mut last_mtimes);

        loop {
            if stop_flag_clone.load(Ordering::Relaxed) {
                break;
            }
            std::thread::sleep(Duration::from_millis(800));
            if stop_flag_clone.load(Ordering::Relaxed) {
                break;
            }

            let mut current_mtimes: HashMap<std::path::PathBuf, SystemTime> = HashMap::new();
            collect_mtimes(&path, &mut current_mtimes);

            if current_mtimes != last_mtimes {
                last_mtimes = current_mtimes;
                let _ = app_handle.emit("fs-watch:changed", ());
            }
        }
    });

    state.stop_flag = Some(stop_flag);

    let _ = log(LogLevel::Info, "fs watch started".to_string(),
        Some(serde_json::json!({"folder_path": folder_path})),
        Some("start_fs_watch".to_string()));

    Ok(())
}

/// Recursively collect (path, mtime) pairs for all entries under a directory.
fn collect_mtimes(dir: &std::path::Path, map: &mut std::collections::HashMap<std::path::PathBuf, std::time::SystemTime>) {
    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if let Ok(meta) = path.metadata() {
            if let Ok(mtime) = meta.modified() {
                map.insert(path.clone(), mtime);
            }
            if meta.is_dir() {
                collect_mtimes(&path, map);
            }
        }
    }
}

/// Stop the active file system watcher.
#[tauri::command]
fn stop_fs_watch(
    watcher_state: tauri::State<Arc<Mutex<WatcherState>>>,
) -> Result<(), String> {
    let _ = log(LogLevel::Info, "Stopping fs watch".to_string(), None, Some("stop_fs_watch".to_string()));

    let mut state = watcher_state.lock().map_err(|e| format!("Lock error: {}", e))?;
    state.stop();

    let _ = log(LogLevel::Info, "fs watch stopped".to_string(), None, Some("stop_fs_watch".to_string()));
    Ok(())
}