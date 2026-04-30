mod logger;
mod commands;

use logger::{init_logger, write_log, read_logs, get_log_dates, log, LogLevel};
use commands::{read_file, save_file, read_directory, export_html, search_in_files, create_file, create_directory, rename_path, delete_path, get_git_branch, open_in_terminal, reveal_in_finder};
use std::fs;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{Manager, Emitter};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};

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
            get_git_branch,
            add_recent_document,
            clear_recent_documents,
            get_recent_documents,
            open_in_terminal,
            reveal_in_finder,
            create_new_window,
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
            let new_file = MenuItem::with_id(app, "new_file", "新建文件", true, Some("CmdOrCtrl+N"))?;
            let new_window = MenuItem::with_id(app, "new_window", "新建窗口", true, Some("CmdOrCtrl+Shift+N"))?;
            let open_file = MenuItem::with_id(app, "open_file", "打开文件...", true, Some("CmdOrCtrl+O"))?;
            let open_folder = MenuItem::with_id(app, "open_folder", "打开文件夹", true, None::<&str>)?;
            let close_folder = MenuItem::with_id(app, "close_folder", "关闭文件夹", true, None::<&str>)?;

            // Recent documents submenu
            let clear_recent = MenuItem::with_id(app, "clear_recent", "清除菜单", true, None::<&str>)?;
            let recent_submenu = Submenu::with_items(app, "最近文档", true, &[&clear_recent])?;

            let save = MenuItem::with_id(app, "save", "保存", true, Some("CmdOrCtrl+S"))?;
            let save_all = MenuItem::with_id(app, "save_all", "全部保存", true, Some("CmdOrCtrl+Alt+S"))?;
            let save_as = MenuItem::with_id(app, "save_as", "另存为...", true, Some("CmdOrCtrl+Shift+S"))?;
            let export_pdf = MenuItem::with_id(app, "export_pdf", "导出为 PDF", true, None::<&str>)?;
            let export_html_item = MenuItem::with_id(app, "export_html", "导出为 HTML", true, None::<&str>)?;
            let export_submenu = Submenu::with_items(app, "导出", true, &[
                &export_pdf,
                &export_html_item,
            ])?;
            let close_tab = MenuItem::with_id(app, "close_tab", "关闭标签", true, Some("CmdOrCtrl+W"))?;
            let quit = MenuItem::with_id(app, "quit", "退出", true, Some("CmdOrCtrl+Q"))?;

            // --- Edit menu items ---
            let undo = MenuItem::with_id(app, "undo", "撤销", true, Some("CmdOrCtrl+Z"))?;
            let redo = MenuItem::with_id(app, "redo", "重做", true, Some("CmdOrCtrl+Shift+Z"))?;
            let cut = MenuItem::with_id(app, "cut", "剪切", true, Some("CmdOrCtrl+X"))?;
            let copy = MenuItem::with_id(app, "copy", "复制", true, Some("CmdOrCtrl+C"))?;
            let paste = MenuItem::with_id(app, "paste", "粘贴", true, Some("CmdOrCtrl+V"))?;
            let paste_match_style = MenuItem::with_id(app, "paste_match_style", "粘贴并匹配样式", true, Some("CmdOrCtrl+Shift+V"))?;
            let select_all = MenuItem::with_id(app, "select_all", "全选", true, Some("CmdOrCtrl+A"))?;
            let find = MenuItem::with_id(app, "find", "查找...", true, Some("CmdOrCtrl+F"))?;
            let replace = MenuItem::with_id(app, "replace", "替换...", true, Some("CmdOrCtrl+H"))?;
            let find_next = MenuItem::with_id(app, "find_next", "查找下一个", true, Some("Cmd+G"))?;
            let find_previous = MenuItem::with_id(app, "find_previous", "查找上一个", true, Some("Cmd+Shift+G"))?;
            let clear_format = MenuItem::with_id(app, "clear_format", "清除格式", true, Some("CmdOrCtrl+\\"))?;

            // --- View menu items ---
            let command_palette = MenuItem::with_id(app, "command_palette", "命令面板...", true, Some("CmdOrCtrl+Shift+P"))?;
            let toggle_ai_panel = MenuItem::with_id(app, "toggle_ai_panel", "切换 AI 助手面板", true, Some("CmdOrCtrl+Shift+A"))?;
            let toggle_sidebar = MenuItem::with_id(app, "toggle_sidebar", "切换侧边栏", true, Some("CmdOrCtrl+B"))?;
            let toggle_outline = MenuItem::with_id(app, "toggle_outline", "切换大纲面板", true, Some("CmdOrCtrl+Shift+O"))?;
            let toggle_explorer = MenuItem::with_id(app, "toggle_explorer", "切换资源管理器", true, Some("CmdOrCtrl+Shift+E"))?;

            // Display options submenu
            let show_line_numbers = MenuItem::with_id(app, "show_line_numbers", "显示行号", true, None::<&str>)?;
            let show_minimap = MenuItem::with_id(app, "show_minimap", "显示迷你地图", true, None::<&str>)?;
            let word_wrap = MenuItem::with_id(app, "word_wrap", "自动换行", true, None::<&str>)?;
            let display_options_submenu = Submenu::with_items(app, "显示选项", true, &[
                &show_line_numbers,
                &show_minimap,
                &word_wrap,
            ])?;

            let zoom_in = MenuItem::with_id(app, "zoom_in", "放大", true, Some("CmdOrCtrl+="))?;
            let zoom_out = MenuItem::with_id(app, "zoom_out", "缩小", true, Some("CmdOrCtrl+-"))?;
            let reset_zoom = MenuItem::with_id(app, "reset_zoom", "重置缩放", true, Some("CmdOrCtrl+0"))?;

            // Editor view submenu
            let view_editor_only = MenuItem::with_id(app, "view_editor_only", "仅编辑器", true, Some("CmdOrCtrl+Alt+1"))?;
            let view_preview_only = MenuItem::with_id(app, "view_preview_only", "仅预览", true, Some("CmdOrCtrl+Alt+2"))?;
            let view_split = MenuItem::with_id(app, "view_split", "分栏", true, Some("CmdOrCtrl+Alt+3"))?;
            let editor_view_submenu = Submenu::with_items(app, "编辑器视图", true, &[
                &view_editor_only,
                &view_preview_only,
                &view_split,
            ])?;

            let toggle_fullscreen = MenuItem::with_id(app, "toggle_fullscreen", "全屏", true, Some("F11"))?;
            let next_tab = MenuItem::with_id(app, "next_tab", "下一个标签页", true, Some("Ctrl+Tab"))?;
            let prev_tab = MenuItem::with_id(app, "prev_tab", "上一个标签页", true, Some("Ctrl+Shift+Tab"))?;

            // --- Insert menu items ---
            // Heading submenu
            let insert_h1 = MenuItem::with_id(app, "insert_h1", "标题 1", true, Some("Cmd+1"))?;
            let insert_h2 = MenuItem::with_id(app, "insert_h2", "标题 2", true, Some("Cmd+2"))?;
            let insert_h3 = MenuItem::with_id(app, "insert_h3", "标题 3", true, Some("Cmd+3"))?;
            let insert_h4 = MenuItem::with_id(app, "insert_h4", "标题 4", true, Some("Cmd+4"))?;
            let insert_h5 = MenuItem::with_id(app, "insert_h5", "标题 5", true, Some("Cmd+5"))?;
            let insert_h6 = MenuItem::with_id(app, "insert_h6", "标题 6", true, Some("Cmd+6"))?;
            let heading_submenu = Submenu::with_items(app, "标题", true, &[
                &insert_h1,
                &insert_h2,
                &insert_h3,
                &insert_h4,
                &insert_h5,
                &insert_h6,
            ])?;

            let insert_bold = MenuItem::with_id(app, "insert_bold", "加粗", true, Some("CmdOrCtrl+B"))?;
            let insert_italic = MenuItem::with_id(app, "insert_italic", "斜体", true, Some("CmdOrCtrl+I"))?;
            let insert_strikethrough = MenuItem::with_id(app, "insert_strikethrough", "删除线", true, Some("CmdOrCtrl+Shift+X"))?;
            let insert_inline_code = MenuItem::with_id(app, "insert_inline_code", "行内代码", true, Some("CmdOrCtrl+E"))?;
            let insert_code_block = MenuItem::with_id(app, "insert_code_block", "代码块", true, Some("CmdOrCtrl+Alt+C"))?;
            let insert_link = MenuItem::with_id(app, "insert_link", "链接", true, Some("CmdOrCtrl+K"))?;
            let insert_image = MenuItem::with_id(app, "insert_image", "图片", true, Some("CmdOrCtrl+Shift+I"))?;
            let insert_table = MenuItem::with_id(app, "insert_table", "表格", true, None::<&str>)?;
            let insert_hr = MenuItem::with_id(app, "insert_hr", "水平线", true, Some("CmdOrCtrl+Shift+H"))?;
            let insert_ul = MenuItem::with_id(app, "insert_ul", "无序列表", true, None::<&str>)?;
            let insert_ol = MenuItem::with_id(app, "insert_ol", "有序列表", true, None::<&str>)?;
            let insert_task = MenuItem::with_id(app, "insert_task", "任务列表", true, None::<&str>)?;
            let insert_quote = MenuItem::with_id(app, "insert_quote", "引用", true, None::<&str>)?;
            let insert_footnote = MenuItem::with_id(app, "insert_footnote", "脚注", true, Some("CmdOrCtrl+Shift+7"))?;
            let insert_details = MenuItem::with_id(app, "insert_details", "折叠区块", true, Some("CmdOrCtrl+Shift+."))?;

            // --- Format menu items ---
            let format_bold = MenuItem::with_id(app, "format_bold", "加粗", true, Some("CmdOrCtrl+B"))?;
            let format_italic = MenuItem::with_id(app, "format_italic", "斜体", true, Some("CmdOrCtrl+I"))?;
            let format_strikethrough = MenuItem::with_id(app, "format_strikethrough", "删除线", true, Some("CmdOrCtrl+Shift+X"))?;

            // Format heading submenu
            let format_h1 = MenuItem::with_id(app, "format_h1", "标题 1", true, Some("Cmd+1"))?;
            let format_h2 = MenuItem::with_id(app, "format_h2", "标题 2", true, Some("Cmd+2"))?;
            let format_h3 = MenuItem::with_id(app, "format_h3", "标题 3", true, Some("Cmd+3"))?;
            let format_h4 = MenuItem::with_id(app, "format_h4", "标题 4", true, Some("Cmd+4"))?;
            let format_h5 = MenuItem::with_id(app, "format_h5", "标题 5", true, Some("Cmd+5"))?;
            let format_h6 = MenuItem::with_id(app, "format_h6", "标题 6", true, Some("Cmd+6"))?;
            let format_heading_submenu = Submenu::with_items(app, "标题", true, &[
                &format_h1,
                &format_h2,
                &format_h3,
                &format_h4,
                &format_h5,
                &format_h6,
            ])?;

            let format_code = MenuItem::with_id(app, "format_code", "代码", true, None::<&str>)?;
            let format_link = MenuItem::with_id(app, "format_link", "链接", true, None::<&str>)?;
            let fmt_clear = MenuItem::with_id(app, "clear_format", "清除格式", true, Some("CmdOrCtrl+\\"))?;

            // --- Theme menu items ---
            let theme_dark = MenuItem::with_id(app, "theme_dark", "深色模式", true, None::<&str>)?;
            let theme_light = MenuItem::with_id(app, "theme_light", "浅色模式", true, None::<&str>)?;
            let theme_monokai = MenuItem::with_id(app, "theme_monokai", "Monokai", true, None::<&str>)?;
            let theme_solarized = MenuItem::with_id(app, "theme_solarized", "Solarized", true, None::<&str>)?;
            let theme_nord = MenuItem::with_id(app, "theme_nord", "Nord", true, None::<&str>)?;
            let theme_dracula = MenuItem::with_id(app, "theme_dracula", "Dracula", true, None::<&str>)?;
            let theme_github = MenuItem::with_id(app, "theme_github", "GitHub", true, None::<&str>)?;

            // --- Help menu items ---
            let welcome = MenuItem::with_id(app, "welcome", "欢迎页", true, None::<&str>)?;
            let markdown_guide = MenuItem::with_id(app, "markdown_guide", "Markdown 指南", true, None::<&str>)?;
            let keyboard_shortcuts = MenuItem::with_id(app, "keyboard_shortcuts", "快捷键参考", true, None::<&str>)?;
            let about = MenuItem::with_id(app, "about", "关于 Seven Markdown", true, None::<&str>)?;
            let check_update = MenuItem::with_id(app, "check_update", "检查更新", true, None::<&str>)?;

            // ==========================================
            // Build submenus
            // ==========================================

            let file_menu = Submenu::with_items(app, "文件", true, &[
                &new_file,
                &new_window,
                &PredefinedMenuItem::separator(app)?,
                &open_file,
                &open_folder,
                &close_folder,
                &PredefinedMenuItem::separator(app)?,
                &recent_submenu,
                &PredefinedMenuItem::separator(app)?,
                &save,
                &save_all,
                &save_as,
                &PredefinedMenuItem::separator(app)?,
                &export_submenu,
                &PredefinedMenuItem::separator(app)?,
                &close_tab,
                &PredefinedMenuItem::separator(app)?,
                &quit,
            ])?;

            let edit_menu = Submenu::with_items(app, "编辑", true, &[
                &undo,
                &redo,
                &PredefinedMenuItem::separator(app)?,
                &cut,
                &copy,
                &paste,
                &paste_match_style,
                &PredefinedMenuItem::separator(app)?,
                &select_all,
                &PredefinedMenuItem::separator(app)?,
                &find,
                &replace,
                &find_next,
                &find_previous,
                &PredefinedMenuItem::separator(app)?,
                &clear_format,
            ])?;

            let view_menu = Submenu::with_items(app, "视图", true, &[
                &command_palette,
                &toggle_ai_panel,
                &PredefinedMenuItem::separator(app)?,
                &toggle_sidebar,
                &toggle_outline,
                &toggle_explorer,
                &PredefinedMenuItem::separator(app)?,
                &display_options_submenu,
                &PredefinedMenuItem::separator(app)?,
                &zoom_in,
                &zoom_out,
                &reset_zoom,
                &PredefinedMenuItem::separator(app)?,
                &editor_view_submenu,
                &PredefinedMenuItem::separator(app)?,
                &toggle_fullscreen,
                &PredefinedMenuItem::separator(app)?,
                &next_tab,
                &prev_tab,
            ])?;

            let insert_menu = Submenu::with_items(app, "插入", true, &[
                &heading_submenu,
                &PredefinedMenuItem::separator(app)?,
                &insert_bold,
                &insert_italic,
                &insert_strikethrough,
                &PredefinedMenuItem::separator(app)?,
                &insert_inline_code,
                &insert_code_block,
                &PredefinedMenuItem::separator(app)?,
                &insert_link,
                &insert_image,
                &PredefinedMenuItem::separator(app)?,
                &insert_table,
                &insert_hr,
                &PredefinedMenuItem::separator(app)?,
                &insert_ul,
                &insert_ol,
                &insert_task,
                &PredefinedMenuItem::separator(app)?,
                &insert_quote,
                &PredefinedMenuItem::separator(app)?,
                &insert_footnote,
                &insert_details,
            ])?;

            let format_menu = Submenu::with_items(app, "格式", true, &[
                &format_bold,
                &format_italic,
                &format_strikethrough,
                &PredefinedMenuItem::separator(app)?,
                &format_heading_submenu,
                &PredefinedMenuItem::separator(app)?,
                &format_code,
                &format_link,
                &PredefinedMenuItem::separator(app)?,
                &fmt_clear,
            ])?;

            let theme_menu = Submenu::with_items(app, "主题", true, &[
                &theme_dark,
                &theme_light,
                &theme_monokai,
                &theme_solarized,
                &theme_nord,
                &theme_dracula,
                &theme_github,
            ])?;

            let help_menu = Submenu::with_items(app, "帮助", true, &[
                &welcome,
                &markdown_guide,
                &keyboard_shortcuts,
                &PredefinedMenuItem::separator(app)?,
                &about,
                &check_update,
            ])?;

            // ==========================================
            // Build the main menu bar
            // ==========================================

            #[cfg(target_os = "macos")]
            {
                // macOS Apple menu
                let about_item = PredefinedMenuItem::about(app, Some("Seven Markdown"), None)?;
                let hide = PredefinedMenuItem::hide(app, Some("隐藏"))?;
                let hide_others = PredefinedMenuItem::hide_others(app, Some("隐藏其他"))?;
                let show_all = PredefinedMenuItem::show_all(app, Some("显示全部"))?;
                let quit_mac = PredefinedMenuItem::quit(app, Some("退出 Seven Markdown"))?;

                let apple_menu = Submenu::with_items(app, "Seven Markdown", true, &[
                    &about_item,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::services(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &hide,
                    &hide_others,
                    &show_all,
                    &PredefinedMenuItem::separator(app)?,
                    &quit_mac,
                ])?;

                let window_minimize = MenuItem::with_id(app, "window_minimize", "最小化", true, Some("Cmd+M"))?;
                let window_zoom = MenuItem::with_id(app, "window_zoom", "缩放", true, None::<&str>)?;
                let window_front = MenuItem::with_id(app, "window_front", "全部置于前面", true, None::<&str>)?;

                let window_menu = Submenu::with_items(app, "窗口", true, &[
                    &window_minimize,
                    &window_zoom,
                    &PredefinedMenuItem::separator(app)?,
                    &window_front,
                ])?;

                let menu = Menu::with_items(app, &[
                    &apple_menu,
                    &file_menu,
                    &edit_menu,
                    &view_menu,
                    &insert_menu,
                    &format_menu,
                    &theme_menu,
                    &window_menu,
                    &help_menu,
                ])?;

                app.set_menu(menu)?;
            }

            #[cfg(not(target_os = "macos"))]
            {
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
            }

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
                    "clear_recent" => { let _ = app_handle.emit("menu-clear-recent", ()); }
                    "save" => { let _ = app_handle.emit("menu-save", ()); }
                    "save_all" => { let _ = app_handle.emit("menu-save-all", ()); }
                    "save_as" => { let _ = app_handle.emit("menu-save-as", ()); }
                    "export_pdf" => { let _ = app_handle.emit("menu-export-pdf", ()); }
                    "export_html" => { let _ = app_handle.emit("menu-export-html", ()); }
                    "close_tab" => { let _ = app_handle.emit("menu-close-tab", ()); }
                    "quit" => { let _ = app_handle.emit("menu-quit", ()); }

                    // Edit menu
                    "undo" => { let _ = app_handle.emit("menu-undo", ()); }
                    "redo" => { let _ = app_handle.emit("menu-redo", ()); }
                    "cut" => { let _ = app_handle.emit("menu-cut", ()); }
                    "copy" => { let _ = app_handle.emit("menu-copy", ()); }
                    "paste" => { let _ = app_handle.emit("menu-paste", ()); }
                    "paste_match_style" => { let _ = app_handle.emit("menu-paste-match-style", ()); }
                    "select_all" => { let _ = app_handle.emit("menu-select-all", ()); }
                    "find" => { let _ = app_handle.emit("menu-find", ()); }
                    "replace" => { let _ = app_handle.emit("menu-replace", ()); }
                    "find_next" => { let _ = app_handle.emit("menu-find-next", ()); }
                    "find_previous" => { let _ = app_handle.emit("menu-find-previous", ()); }
                    "clear_format" => { let _ = app_handle.emit("menu-clear-format", ()); }

                    // View menu
                    "command_palette" => { let _ = app_handle.emit("menu-command-palette", ()); }
                    "toggle_ai_panel" => { let _ = app_handle.emit("menu-toggle-ai-panel", ()); }
                    "toggle_sidebar" => { let _ = app_handle.emit("menu-toggle-sidebar", ()); }
                    "toggle_outline" => { let _ = app_handle.emit("menu-toggle-outline", ()); }
                    "toggle_explorer" => { let _ = app_handle.emit("menu-toggle-explorer", ()); }
                    "show_line_numbers" => { let _ = app_handle.emit("menu-show-line-numbers", ()); }
                    "show_minimap" => { let _ = app_handle.emit("menu-show-minimap", ()); }
                    "word_wrap" => { let _ = app_handle.emit("menu-word-wrap", ()); }
                    "zoom_in" => { let _ = app_handle.emit("menu-zoom-in", ()); }
                    "zoom_out" => { let _ = app_handle.emit("menu-zoom-out", ()); }
                    "reset_zoom" => { let _ = app_handle.emit("menu-reset-zoom", ()); }
                    "view_editor_only" => { let _ = app_handle.emit("menu-view-editor-only", ()); }
                    "view_preview_only" => { let _ = app_handle.emit("menu-view-preview-only", ()); }
                    "view_split" => { let _ = app_handle.emit("menu-view-split", ()); }
                    "toggle_fullscreen" => { let _ = app_handle.emit("menu-toggle-fullscreen", ()); }
                    "next_tab" => { let _ = app_handle.emit("menu-next-tab", ()); }
                    "prev_tab" => { let _ = app_handle.emit("menu-prev-tab", ()); }

                    // Insert menu
                    "insert_h1" => { let _ = app_handle.emit("menu-insert-h1", ()); }
                    "insert_h2" => { let _ = app_handle.emit("menu-insert-h2", ()); }
                    "insert_h3" => { let _ = app_handle.emit("menu-insert-h3", ()); }
                    "insert_h4" => { let _ = app_handle.emit("menu-insert-h4", ()); }
                    "insert_h5" => { let _ = app_handle.emit("menu-insert-h5", ()); }
                    "insert_h6" => { let _ = app_handle.emit("menu-insert-h6", ()); }
                    "insert_bold" => { let _ = app_handle.emit("menu-insert-bold", ()); }
                    "insert_italic" => { let _ = app_handle.emit("menu-insert-italic", ()); }
                    "insert_strikethrough" => { let _ = app_handle.emit("menu-insert-strikethrough", ()); }
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
                    "insert_footnote" => { let _ = app_handle.emit("menu-insert-footnote", ()); }
                    "insert_details" => { let _ = app_handle.emit("menu-insert-details", ()); }

                    // Format menu
                    "format_bold" => { let _ = app_handle.emit("menu-format-bold", ()); }
                    "format_italic" => { let _ = app_handle.emit("menu-format-italic", ()); }
                    "format_strikethrough" => { let _ = app_handle.emit("menu-format-strikethrough", ()); }
                    "format_h1" => { let _ = app_handle.emit("menu-format-h1", ()); }
                    "format_h2" => { let _ = app_handle.emit("menu-format-h2", ()); }
                    "format_h3" => { let _ = app_handle.emit("menu-format-h3", ()); }
                    "format_h4" => { let _ = app_handle.emit("menu-format-h4", ()); }
                    "format_h5" => { let _ = app_handle.emit("menu-format-h5", ()); }
                    "format_h6" => { let _ = app_handle.emit("menu-format-h6", ()); }
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
async fn open_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let _ = log(LogLevel::Debug, "Opening folder dialog".to_string(), None, Some("open_folder".to_string()));

    use tauri_plugin_dialog::DialogExt;
    use tokio::sync::oneshot;

    // Create a one-shot channel to receive the dialog result
    let (tx, rx) = oneshot::channel();

    // Use callback-based pick_folder
    app.dialog()
        .file()
        .pick_folder(move |result| {
            let _ = tx.send(result);
        });

    // Wait for the result asynchronously
    let folder_path = rx.await.map_err(|e| format!("Receive error: {}", e))?;

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

/// Add a file path to the recent documents list
#[tauri::command]
fn add_recent_document(_app: tauri::AppHandle, path: String) -> Result<(), String> {
    let _ = log(LogLevel::Debug, "Adding recent document".to_string(),
        Some(serde_json::json!({"path": path.clone()})),
        Some("add_recent_document".to_string()));

    // Recent documents are managed by the frontend using localStorage
    // This command is a placeholder for potential future backend storage
    Ok(())
}

/// Clear all recent documents
#[tauri::command]
fn clear_recent_documents() -> Result<(), String> {
    let _ = log(LogLevel::Debug, "Clearing recent documents".to_string(), None, Some("clear_recent_documents".to_string()));
    Ok(())
}

/// Get the list of recent documents
#[tauri::command]
fn get_recent_documents() -> Result<Vec<String>, String> {
    // Recent documents are managed by the frontend using localStorage
    // This command is a placeholder for potential future backend storage
    Ok(vec![])
}

/// Create a new application window
#[tauri::command]
async fn create_new_window(app: tauri::AppHandle) -> Result<String, String> {
    let _ = log(LogLevel::Info, "Creating new window".to_string(), None, Some("create_new_window".to_string()));

    let label = format!("window-{}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis());

    let webview_url = tauri::WebviewUrl::App("index.html".into());

    match tauri::WebviewWindowBuilder::new(&app, &label, webview_url)
        .title("Seven Markdown")
        .inner_size(1200.0, 800.0)
        .center()
        .resizable(true)
        .decorations(true)
        .build()
    {
        Ok(_) => {
            let _ = log(LogLevel::Info, format!("Window created: {}", label), None, Some("create_new_window".to_string()));
            Ok(label)
        }
        Err(e) => {
            let _ = log(LogLevel::Error, format!("Failed to create window: {}", e), None, Some("create_new_window".to_string()));
            Err(format!("创建窗口失败: {}", e))
        }
    }
}
