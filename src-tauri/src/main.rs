mod logger;
mod commands;

use logger::{init_logger, write_log, read_logs, get_log_dates, log, LogLevel};
use commands::{read_file, save_file, read_directory, export_html, search_in_files, create_file, create_directory, rename_path, delete_path, get_git_branch};
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
            stop_fs_watch,
            get_git_branch
        ])
        .setup(|app| {
            // Initialize logger
            let app_handle = app.handle();
            let log_dir = app_handle.path().app_data_dir()
                .expect("Failed to get app data dir")
                .join("logs");
            
            init_logger(log_dir).expect("Failed to initialize logger");
            
            // ==========================================
            // Menu items — 100% coverage of frontend menus
            // ==========================================

            // --- File menu items ---
            let new_file = MenuItem::with_id(app, "new_file", "New File", true, Some("CmdOrCtrl+N"))?;
            let new_window = MenuItem::with_id(app, "new_window", "New Window", true, Some("CmdOrCtrl+Shift+N"))?;
            let open_file = MenuItem::with_id(app, "open_file", "Open File...", true, Some("CmdOrCtrl+O"))?;
            let open_folder = MenuItem::with_id(app, "open_folder", "Open Folder", true, None::<&str>)?;
            let close_folder = MenuItem::with_id(app, "close_folder", "Close Folder", true, None::<&str>)?;
            let save = MenuItem::with_id(app, "save", "Save", true, Some("CmdOrCtrl+S"))?;
            let save_as = MenuItem::with_id(app, "save_as", "Save As...", true, Some("CmdOrCtrl+Shift+S"))?;
            let export_pdf = MenuItem::with_id(app, "export_pdf", "Export as PDF", true, None::<&str>)?;
            let export_html_item = MenuItem::with_id(app, "export_html", "Export as HTML", true, None::<&str>)?;
            let export_submenu = Submenu::with_items(app, "Export", true, &[
                &export_pdf,
                &export_html_item,
            ])?;
            let quit = MenuItem::with_id(app, "quit", "Quit Seven MD", true, Some("CmdOrCtrl+Q"))?;

            // --- Edit menu items ---
            let undo = MenuItem::with_id(app, "undo", "Undo", true, Some("CmdOrCtrl+Z"))?;
            let redo = MenuItem::with_id(app, "redo", "Redo", true, Some("CmdOrCtrl+Shift+Z"))?;
            let cut = MenuItem::with_id(app, "cut", "Cut", true, Some("CmdOrCtrl+X"))?;
            let copy = MenuItem::with_id(app, "copy", "Copy", true, Some("CmdOrCtrl+C"))?;
            let paste = MenuItem::with_id(app, "paste", "Paste", true, Some("CmdOrCtrl+V"))?;
            let select_all = MenuItem::with_id(app, "select_all", "Select All", true, Some("CmdOrCtrl+A"))?;
            let find = MenuItem::with_id(app, "find", "Find...", true, Some("CmdOrCtrl+F"))?;
            let replace = MenuItem::with_id(app, "replace", "Replace...", true, Some("CmdOrCtrl+H"))?;

            // --- View menu items ---
            let command_palette = MenuItem::with_id(app, "command_palette", "Command Palette...", true, Some("CmdOrCtrl+Shift+P"))?;
            let toggle_sidebar = MenuItem::with_id(app, "toggle_sidebar", "Toggle Sidebar", true, Some("CmdOrCtrl+\\"))?;
            let toggle_outline = MenuItem::with_id(app, "toggle_outline", "Toggle Outline", true, Some("CmdOrCtrl+Shift+O"))?;
            let zoom_in = MenuItem::with_id(app, "zoom_in", "Zoom In", true, Some("CmdOrCtrl+="))?;
            let zoom_out = MenuItem::with_id(app, "zoom_out", "Zoom Out", true, Some("CmdOrCtrl+-"))?;
            let reset_zoom = MenuItem::with_id(app, "reset_zoom", "Reset Zoom", true, Some("CmdOrCtrl+0"))?;
            let view_editor_only = MenuItem::with_id(app, "view_editor_only", "Editor Only", true, None::<&str>)?;
            let view_preview_only = MenuItem::with_id(app, "view_preview_only", "Preview Only", true, None::<&str>)?;
            let view_split = MenuItem::with_id(app, "view_split", "Split View", true, None::<&str>)?;

            // --- Insert menu items ---
            let insert_heading = MenuItem::with_id(app, "insert_heading", "Heading", true, None::<&str>)?;
            let insert_bold = MenuItem::with_id(app, "insert_bold", "Bold", true, None::<&str>)?;
            let insert_italic = MenuItem::with_id(app, "insert_italic", "Italic", true, None::<&str>)?;
            let insert_inline_code = MenuItem::with_id(app, "insert_inline_code", "Inline Code", true, None::<&str>)?;
            let insert_code_block = MenuItem::with_id(app, "insert_code_block", "Code Block", true, None::<&str>)?;
            let insert_link = MenuItem::with_id(app, "insert_link", "Link", true, Some("CmdOrCtrl+K"))?;
            let insert_image = MenuItem::with_id(app, "insert_image", "Image", true, None::<&str>)?;
            let insert_table = MenuItem::with_id(app, "insert_table", "Table", true, None::<&str>)?;
            let insert_hr = MenuItem::with_id(app, "insert_hr", "Horizontal Rule", true, None::<&str>)?;
            let insert_ul = MenuItem::with_id(app, "insert_ul", "Unordered List", true, None::<&str>)?;
            let insert_ol = MenuItem::with_id(app, "insert_ol", "Ordered List", true, None::<&str>)?;
            let insert_task = MenuItem::with_id(app, "insert_task", "Task List", true, None::<&str>)?;
            let insert_quote = MenuItem::with_id(app, "insert_quote", "Blockquote", true, None::<&str>)?;

            // --- Format menu items ---
            let format_bold = MenuItem::with_id(app, "format_bold", "Bold", true, Some("CmdOrCtrl+B"))?;
            let format_italic = MenuItem::with_id(app, "format_italic", "Italic", true, Some("CmdOrCtrl+I"))?;
            let format_strikethrough = MenuItem::with_id(app, "format_strikethrough", "Strikethrough", true, None::<&str>)?;
            let format_h1 = MenuItem::with_id(app, "format_h1", "Heading 1", true, None::<&str>)?;
            let format_h2 = MenuItem::with_id(app, "format_h2", "Heading 2", true, None::<&str>)?;
            let format_h3 = MenuItem::with_id(app, "format_h3", "Heading 3", true, None::<&str>)?;
            let format_code = MenuItem::with_id(app, "format_code", "Code", true, None::<&str>)?;
            let format_link = MenuItem::with_id(app, "format_link", "Link", true, None::<&str>)?;

            // --- Theme menu items (hardcoded to match src/themes/index.ts allThemes) ---
            let theme_dark = MenuItem::with_id(app, "theme_dark", "Dark Mode", true, None::<&str>)?;
            let theme_light = MenuItem::with_id(app, "theme_light", "Light Mode", true, None::<&str>)?;
            let theme_monokai = MenuItem::with_id(app, "theme_monokai", "Monokai", true, None::<&str>)?;
            let theme_solarized = MenuItem::with_id(app, "theme_solarized", "Solarized", true, None::<&str>)?;
            let theme_nord = MenuItem::with_id(app, "theme_nord", "Nord", true, None::<&str>)?;
            let theme_dracula = MenuItem::with_id(app, "theme_dracula", "Dracula", true, None::<&str>)?;
            let theme_github = MenuItem::with_id(app, "theme_github", "GitHub", true, None::<&str>)?;

            // --- Help menu items ---
            let welcome = MenuItem::with_id(app, "welcome", "Welcome", true, None::<&str>)?;
            let markdown_guide = MenuItem::with_id(app, "markdown_guide", "Markdown Guide", true, None::<&str>)?;
            let keyboard_shortcuts = MenuItem::with_id(app, "keyboard_shortcuts", "Keyboard Shortcuts", true, None::<&str>)?;
            let about = MenuItem::with_id(app, "about", "About Seven MD", true, None::<&str>)?;
            let check_update = MenuItem::with_id(app, "check_update", "Check for Updates", true, None::<&str>)?;

            // ==========================================
            // Build submenus
            // ==========================================

            let file_menu = Submenu::with_items(app, "File", true, &[
                &new_file,
                &new_window,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &open_file,
                &open_folder,
                &close_folder,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &save,
                &save_as,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &export_submenu,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &quit,
            ])?;

            let edit_menu = Submenu::with_items(app, "Edit", true, &[
                &undo,
                &redo,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &cut,
                &copy,
                &paste,
                &select_all,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &find,
                &replace,
            ])?;

            let view_menu = Submenu::with_items(app, "View", true, &[
                &command_palette,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &toggle_sidebar,
                &toggle_outline,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &zoom_in,
                &zoom_out,
                &reset_zoom,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &view_editor_only,
                &view_preview_only,
                &view_split,
            ])?;

            let insert_menu = Submenu::with_items(app, "Insert", true, &[
                &insert_heading,
                &insert_bold,
                &insert_italic,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &insert_inline_code,
                &insert_code_block,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &insert_link,
                &insert_image,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &insert_table,
                &insert_hr,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &insert_ul,
                &insert_ol,
                &insert_task,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &insert_quote,
            ])?;

            let format_menu = Submenu::with_items(app, "Format", true, &[
                &format_bold,
                &format_italic,
                &format_strikethrough,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &format_h1,
                &format_h2,
                &format_h3,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &format_code,
                &format_link,
            ])?;

            let theme_menu = Submenu::with_items(app, "Theme", true, &[
                &theme_dark,
                &theme_light,
                &theme_monokai,
                &theme_solarized,
                &theme_nord,
                &theme_dracula,
                &theme_github,
            ])?;

            let help_menu = Submenu::with_items(app, "Help", true, &[
                &welcome,
                &markdown_guide,
                &keyboard_shortcuts,
                &tauri::menu::PredefinedMenuItem::separator(app)?,
                &about,
                &check_update,
            ])?;

            // ==========================================
            // Build the main menu bar
            // ==========================================

            let menu = Menu::with_items(app, &[
                &file_menu,
                &edit_menu,
                &view_menu,
                &insert_menu,
                &format_menu,
                &theme_menu,
                &help_menu,
            ])?;

            app.set_menu(menu)?;

            // ==========================================
            // Handle menu events — emit Tauri events to frontend
            // ==========================================

            let app_handle = app.handle().clone();
            app.on_menu_event(move |_window, event| {
                let id = event.id().as_ref();
                match id {
                    // File menu
                    "new_file" => { let _ = app_handle.emit("menu-new-file", ()); }
                    "new_window" => { let _ = app_handle.emit("menu-new-window", ()); }
                    "open_file" => { let _ = app_handle.emit("menu-open-file", ()); }
                    "open_folder" => { let _ = app_handle.emit("menu-open-folder", ()); }
                    "close_folder" => { let _ = app_handle.emit("menu-close-folder", ()); }
                    "save" => { let _ = app_handle.emit("menu-save", ()); }
                    "save_as" => { let _ = app_handle.emit("menu-save-as", ()); }
                    "export_pdf" => { let _ = app_handle.emit("menu-export-pdf", ()); }
                    "export_html" => { let _ = app_handle.emit("menu-export-html", ()); }
                    "quit" => { let _ = app_handle.emit("menu-quit", ()); }

                    // Edit menu
                    "undo" => { let _ = app_handle.emit("menu-undo", ()); }
                    "redo" => { let _ = app_handle.emit("menu-redo", ()); }
                    "cut" => { let _ = app_handle.emit("menu-cut", ()); }
                    "copy" => { let _ = app_handle.emit("menu-copy", ()); }
                    "paste" => { let _ = app_handle.emit("menu-paste", ()); }
                    "select_all" => { let _ = app_handle.emit("menu-select-all", ()); }
                    "find" => { let _ = app_handle.emit("menu-find", ()); }
                    "replace" => { let _ = app_handle.emit("menu-replace", ()); }

                    // View menu
                    "command_palette" => { let _ = app_handle.emit("menu-command-palette", ()); }
                    "toggle_sidebar" => { let _ = app_handle.emit("menu-toggle-sidebar", ()); }
                    "toggle_outline" => { let _ = app_handle.emit("menu-toggle-outline", ()); }
                    "zoom_in" => { let _ = app_handle.emit("menu-zoom-in", ()); }
                    "zoom_out" => { let _ = app_handle.emit("menu-zoom-out", ()); }
                    "reset_zoom" => { let _ = app_handle.emit("menu-reset-zoom", ()); }
                    "view_editor_only" => { let _ = app_handle.emit("menu-view-editor-only", ()); }
                    "view_preview_only" => { let _ = app_handle.emit("menu-view-preview-only", ()); }
                    "view_split" => { let _ = app_handle.emit("menu-view-split", ()); }

                    // Insert menu
                    "insert_heading" => { let _ = app_handle.emit("menu-insert-heading", ()); }
                    "insert_bold" => { let _ = app_handle.emit("menu-insert-bold", ()); }
                    "insert_italic" => { let _ = app_handle.emit("menu-insert-italic", ()); }
                    "insert_inline_code" => { let _ = app_handle.emit("menu-insert-inline-code", ()); }
                    "insert_code_block" => { let _ = app_handle.emit("menu-insert-code-block", ()); }
                    "insert_link" => { let _ = app_handle.emit("menu-insert-link", ()); }
                    "insert_image" => { let _ = app_handle.emit("menu-insert-image", ()); }
                    "insert_table" => { let _ = app_handle.emit("menu-insert-table", ()); }
                    "insert_hr" => { let _ = app_handle.emit("menu-insert-hr", ()); }
                    "insert_ul" => { let _ = app_handle.emit("menu-insert-ul", ()); }
                    "insert_ol" => { let _ = app_handle.emit("menu-insert-ol", ()); }
                    "insert_task" => { let _ = app_handle.emit("menu-insert-task", ()); }
                    "insert_quote" => { let _ = app_handle.emit("menu-insert-quote", ()); }

                    // Format menu
                    "format_bold" => { let _ = app_handle.emit("menu-format-bold", ()); }
                    "format_italic" => { let _ = app_handle.emit("menu-format-italic", ()); }
                    "format_strikethrough" => { let _ = app_handle.emit("menu-format-strikethrough", ()); }
                    "format_h1" => { let _ = app_handle.emit("menu-format-h1", ()); }
                    "format_h2" => { let _ = app_handle.emit("menu-format-h2", ()); }
                    "format_h3" => { let _ = app_handle.emit("menu-format-h3", ()); }
                    "format_code" => { let _ = app_handle.emit("menu-format-code", ()); }
                    "format_link" => { let _ = app_handle.emit("menu-format-link", ()); }

                    // Theme menu — emit with theme ID payload
                    "theme_dark" => { let _ = app_handle.emit("menu-theme-change", "dark"); }
                    "theme_light" => { let _ = app_handle.emit("menu-theme-change", "light"); }
                    "theme_monokai" => { let _ = app_handle.emit("menu-theme-change", "monokai"); }
                    "theme_solarized" => { let _ = app_handle.emit("menu-theme-change", "solarized"); }
                    "theme_nord" => { let _ = app_handle.emit("menu-theme-change", "nord"); }
                    "theme_dracula" => { let _ = app_handle.emit("menu-theme-change", "dracula"); }
                    "theme_github" => { let _ = app_handle.emit("menu-theme-change", "github"); }

                    // Help menu
                    "welcome" => { let _ = app_handle.emit("menu-welcome", ()); }
                    "markdown_guide" => { let _ = app_handle.emit("menu-markdown-guide", ()); }
                    "keyboard_shortcuts" => { let _ = app_handle.emit("menu-keyboard-shortcuts", ()); }
                    "about" => { let _ = app_handle.emit("menu-about", ()); }
                    "check_update" => { let _ = app_handle.emit("menu-check-update", ()); }

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