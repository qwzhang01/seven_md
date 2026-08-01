use std::fs;
use tauri::{AppHandle, Emitter, Manager};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};

/// Build and install the native menu bar.
/// Menu events are forwarded to the frontend via Tauri events.
pub fn build(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let file_menu = build_file_menu(app)?;
    let edit_menu = build_edit_menu(app)?;
    let view_menu = build_view_menu(app)?;
    let insert_menu = build_insert_menu(app)?;
    let format_menu = build_format_menu(app)?;
    let theme_menu = build_theme_menu(app)?;
    let help_menu = build_help_menu(app)?;

    #[cfg(target_os = "macos")]
    {
        let apple_menu = build_apple_menu(app)?;
        let window_menu = build_window_menu(app)?;
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

    Ok(())
}

// ─── Menu builders ──────────────────────────────────────────────────

fn build_file_menu(app: &tauri::App) -> Result<Submenu<tauri::Wry>, Box<dyn std::error::Error>> {
    let new_file = MenuItem::with_id(app, "new_file", "新建文件", true, Some("CmdOrCtrl+N"))?;
    let new_window = MenuItem::with_id(app, "new_window", "新建窗口", true, Some("CmdOrCtrl+Shift+N"))?;
    let open_folder_new_window = MenuItem::with_id(app, "open_folder_new_window", "在新窗口中打开文件夹...", true, None::<&str>)?;
    let open_file = MenuItem::with_id(app, "open_file", "打开文件...", true, Some("CmdOrCtrl+O"))?;
    let open_folder = MenuItem::with_id(app, "open_folder", "打开文件夹", true, None::<&str>)?;
    let close_folder = MenuItem::with_id(app, "close_folder", "关闭文件夹", true, None::<&str>)?;
    let recent_submenu = build_recent_submenu(app)?;
    let save = MenuItem::with_id(app, "save", "保存", true, Some("CmdOrCtrl+S"))?;
    let save_all = MenuItem::with_id(app, "save_all", "全部保存", true, Some("CmdOrCtrl+Alt+S"))?;
    let save_as = MenuItem::with_id(app, "save_as", "另存为...", true, Some("CmdOrCtrl+Shift+S"))?;
    let export_pdf = MenuItem::with_id(app, "export_pdf", "导出为 PDF", true, None::<&str>)?;
    let export_html_item = MenuItem::with_id(app, "export_html", "导出为 HTML", true, None::<&str>)?;
    let export_submenu = Submenu::with_items(app, "导出", true, &[&export_pdf, &export_html_item])?;
    let close_tab = MenuItem::with_id(app, "close_tab", "关闭标签", true, Some("CmdOrCtrl+W"))?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, Some("CmdOrCtrl+Q"))?;

    Ok(Submenu::with_items(app, "文件", true, &[
        &new_file, &new_window, &PredefinedMenuItem::separator(app)?,
        &open_file, &open_folder, &open_folder_new_window, &close_folder,
        &PredefinedMenuItem::separator(app)?,
        &recent_submenu, &PredefinedMenuItem::separator(app)?,
        &save, &save_all, &save_as, &PredefinedMenuItem::separator(app)?,
        &export_submenu, &PredefinedMenuItem::separator(app)?,
        &close_tab, &PredefinedMenuItem::separator(app)?,
        &quit,
    ])?)
}

fn build_recent_submenu(app: &tauri::App) -> Result<Submenu<tauri::Wry>, Box<dyn std::error::Error>> {
    let clear_recent = MenuItem::with_id(app, "clear_recent", "清除菜单", true, None::<&str>)?;
    let recent_paths: Vec<String> = {
        let data_dir = app.handle().path().app_data_dir().unwrap_or_default();
        let file_path = data_dir.join("recent_documents.json");
        fs::read_to_string(&file_path).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
    };
    let mut recent_items: Vec<Box<dyn tauri::menu::IsMenuItem<tauri::Wry>>> = Vec::new();
    for path in recent_paths.iter().take(10) {
        let name = path.split(['/', '\\']).next_back().unwrap_or(path.as_str()).to_string();
        let id = format!("recent_doc_{}", path);
        if let Ok(item) = MenuItem::with_id(app, id, name, true, None::<&str>) {
            recent_items.push(Box::new(item));
        }
    }
    let sep = PredefinedMenuItem::separator(app)?;
    let mut all_refs: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> = recent_items
        .iter().map(|b| b.as_ref() as &dyn tauri::menu::IsMenuItem<tauri::Wry>).collect();
    if !recent_paths.is_empty() { all_refs.push(&sep); }
    all_refs.push(&clear_recent);
    Ok(Submenu::with_items(app, "最近文档", true, &all_refs)?)
}

fn build_edit_menu(app: &tauri::App) -> Result<Submenu<tauri::Wry>, Box<dyn std::error::Error>> {
    let undo = MenuItem::with_id(app, "undo", "撤销", true, Some("CmdOrCtrl+Z"))?;
    let redo = MenuItem::with_id(app, "redo", "重做", true, Some("CmdOrCtrl+Shift+Z"))?;
    let cut = PredefinedMenuItem::cut(app, Some("剪切"))?;
    let copy = PredefinedMenuItem::copy(app, Some("复制"))?;
    let paste = PredefinedMenuItem::paste(app, Some("粘贴"))?;
    let paste_match_style = MenuItem::with_id(app, "paste_match_style", "粘贴并匹配样式", true, Some("CmdOrCtrl+Shift+V"))?;
    let select_all = PredefinedMenuItem::select_all(app, Some("全选"))?;
    let find = MenuItem::with_id(app, "find", "查找...", true, Some("CmdOrCtrl+F"))?;
    let replace = MenuItem::with_id(app, "replace", "替换...", true, Some("CmdOrCtrl+H"))?;
    let find_next = MenuItem::with_id(app, "find_next", "查找下一个", true, Some("Cmd+G"))?;
    let find_previous = MenuItem::with_id(app, "find_previous", "查找上一个", true, Some("Cmd+Shift+G"))?;
    let clear_format = MenuItem::with_id(app, "clear_format", "清除格式", true, Some("CmdOrCtrl+\\"))?;
    Ok(Submenu::with_items(app, "编辑", true, &[
        &undo, &redo, &PredefinedMenuItem::separator(app)?,
        &cut, &copy, &paste, &paste_match_style, &PredefinedMenuItem::separator(app)?,
        &select_all, &PredefinedMenuItem::separator(app)?,
        &find, &replace, &find_next, &find_previous, &PredefinedMenuItem::separator(app)?,
        &clear_format,
    ])?)
}

fn build_view_menu(app: &tauri::App) -> Result<Submenu<tauri::Wry>, Box<dyn std::error::Error>> {
    let command_palette = MenuItem::with_id(app, "command_palette", "命令面板...", true, Some("CmdOrCtrl+Shift+P"))?;
    let toggle_ai_panel = MenuItem::with_id(app, "toggle_ai_panel", "切换 AI 助手面板", true, Some("CmdOrCtrl+Shift+A"))?;
    let toggle_sidebar = MenuItem::with_id(app, "toggle_sidebar", "切换侧边栏", true, Some("CmdOrCtrl+B"))?;
    let toggle_outline = MenuItem::with_id(app, "toggle_outline", "切换大纲面板", true, Some("CmdOrCtrl+Shift+O"))?;
    let toggle_explorer = MenuItem::with_id(app, "toggle_explorer", "切换资源管理器", true, Some("CmdOrCtrl+Shift+E"))?;
    let show_line_numbers = MenuItem::with_id(app, "show_line_numbers", "显示行号", true, None::<&str>)?;
    let show_minimap = MenuItem::with_id(app, "show_minimap", "显示迷你地图", true, None::<&str>)?;
    let word_wrap = MenuItem::with_id(app, "word_wrap", "自动换行", true, None::<&str>)?;
    let display_options_submenu = Submenu::with_items(app, "显示选项", true, &[&show_line_numbers, &show_minimap, &word_wrap])?;
    let zoom_in = MenuItem::with_id(app, "zoom_in", "放大", true, Some("CmdOrCtrl+="))?;
    let zoom_out = MenuItem::with_id(app, "zoom_out", "缩小", true, Some("CmdOrCtrl+-"))?;
    let reset_zoom = MenuItem::with_id(app, "reset_zoom", "重置缩放", true, Some("CmdOrCtrl+0"))?;
    let view_editor_only = MenuItem::with_id(app, "view_editor_only", "仅编辑器", true, Some("CmdOrCtrl+Alt+1"))?;
    let view_preview_only = MenuItem::with_id(app, "view_preview_only", "仅预览", true, Some("CmdOrCtrl+Alt+2"))?;
    let view_split = MenuItem::with_id(app, "view_split", "分栏", true, Some("CmdOrCtrl+Alt+3"))?;
    let editor_view_submenu = Submenu::with_items(app, "编辑器视图", true, &[&view_editor_only, &view_preview_only, &view_split])?;
    let toggle_fullscreen = MenuItem::with_id(app, "toggle_fullscreen", "全屏", true, Some("F11"))?;
    let next_tab = MenuItem::with_id(app, "next_tab", "下一个标签页", true, Some("Ctrl+Tab"))?;
    let prev_tab = MenuItem::with_id(app, "prev_tab", "上一个标签页", true, Some("Ctrl+Shift+Tab"))?;
    Ok(Submenu::with_items(app, "视图", true, &[
        &command_palette, &toggle_ai_panel, &PredefinedMenuItem::separator(app)?,
        &toggle_sidebar, &toggle_outline, &toggle_explorer, &PredefinedMenuItem::separator(app)?,
        &display_options_submenu, &PredefinedMenuItem::separator(app)?,
        &zoom_in, &zoom_out, &reset_zoom, &PredefinedMenuItem::separator(app)?,
        &editor_view_submenu, &PredefinedMenuItem::separator(app)?,
        &toggle_fullscreen, &PredefinedMenuItem::separator(app)?,
        &next_tab, &prev_tab,
    ])?)
}

fn build_insert_menu(app: &tauri::App) -> Result<Submenu<tauri::Wry>, Box<dyn std::error::Error>> {
    let insert_h1 = MenuItem::with_id(app, "insert_h1", "标题 1", true, Some("Cmd+1"))?;
    let insert_h2 = MenuItem::with_id(app, "insert_h2", "标题 2", true, Some("Cmd+2"))?;
    let insert_h3 = MenuItem::with_id(app, "insert_h3", "标题 3", true, Some("Cmd+3"))?;
    let insert_h4 = MenuItem::with_id(app, "insert_h4", "标题 4", true, Some("Cmd+4"))?;
    let insert_h5 = MenuItem::with_id(app, "insert_h5", "标题 5", true, Some("Cmd+5"))?;
    let insert_h6 = MenuItem::with_id(app, "insert_h6", "标题 6", true, Some("Cmd+6"))?;
    let heading_submenu = Submenu::with_items(app, "标题", true, &[&insert_h1, &insert_h2, &insert_h3, &insert_h4, &insert_h5, &insert_h6])?;
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
    Ok(Submenu::with_items(app, "插入", true, &[
        &heading_submenu, &PredefinedMenuItem::separator(app)?,
        &insert_bold, &insert_italic, &insert_strikethrough, &PredefinedMenuItem::separator(app)?,
        &insert_inline_code, &insert_code_block, &PredefinedMenuItem::separator(app)?,
        &insert_link, &insert_image, &PredefinedMenuItem::separator(app)?,
        &insert_table, &insert_hr, &PredefinedMenuItem::separator(app)?,
        &insert_ul, &insert_ol, &insert_task, &PredefinedMenuItem::separator(app)?,
        &insert_quote, &PredefinedMenuItem::separator(app)?,
        &insert_footnote, &insert_details,
    ])?)
}

fn build_format_menu(app: &tauri::App) -> Result<Submenu<tauri::Wry>, Box<dyn std::error::Error>> {
    let format_bold = MenuItem::with_id(app, "format_bold", "加粗", true, Some("CmdOrCtrl+B"))?;
    let format_italic = MenuItem::with_id(app, "format_italic", "斜体", true, Some("CmdOrCtrl+I"))?;
    let format_strikethrough = MenuItem::with_id(app, "format_strikethrough", "删除线", true, Some("CmdOrCtrl+Shift+X"))?;
    let format_h1 = MenuItem::with_id(app, "format_h1", "标题 1", true, Some("Cmd+1"))?;
    let format_h2 = MenuItem::with_id(app, "format_h2", "标题 2", true, Some("Cmd+2"))?;
    let format_h3 = MenuItem::with_id(app, "format_h3", "标题 3", true, Some("Cmd+3"))?;
    let format_h4 = MenuItem::with_id(app, "format_h4", "标题 4", true, Some("Cmd+4"))?;
    let format_h5 = MenuItem::with_id(app, "format_h5", "标题 5", true, Some("Cmd+5"))?;
    let format_h6 = MenuItem::with_id(app, "format_h6", "标题 6", true, Some("Cmd+6"))?;
    let format_heading_submenu = Submenu::with_items(app, "标题", true, &[&format_h1, &format_h2, &format_h3, &format_h4, &format_h5, &format_h6])?;
    let format_code = MenuItem::with_id(app, "format_code", "代码", true, None::<&str>)?;
    let format_link = MenuItem::with_id(app, "format_link", "链接", true, None::<&str>)?;
    let fmt_clear = MenuItem::with_id(app, "clear_format", "清除格式", true, Some("CmdOrCtrl+\\"))?;
    Ok(Submenu::with_items(app, "格式", true, &[
        &format_bold, &format_italic, &format_strikethrough, &PredefinedMenuItem::separator(app)?,
        &format_heading_submenu, &PredefinedMenuItem::separator(app)?,
        &format_code, &format_link, &PredefinedMenuItem::separator(app)?,
        &fmt_clear,
    ])?)
}

fn build_theme_menu(app: &tauri::App) -> Result<Submenu<tauri::Wry>, Box<dyn std::error::Error>> {
    let theme_dark = MenuItem::with_id(app, "theme_dark", "深色模式", true, None::<&str>)?;
    let theme_light = MenuItem::with_id(app, "theme_light", "浅色模式", true, None::<&str>)?;
    let theme_monokai = MenuItem::with_id(app, "theme_monokai", "Monokai", true, None::<&str>)?;
    let theme_solarized = MenuItem::with_id(app, "theme_solarized", "Solarized", true, None::<&str>)?;
    let theme_nord = MenuItem::with_id(app, "theme_nord", "Nord", true, None::<&str>)?;
    let theme_dracula = MenuItem::with_id(app, "theme_dracula", "Dracula", true, None::<&str>)?;
    let theme_github = MenuItem::with_id(app, "theme_github", "GitHub", true, None::<&str>)?;
    Ok(Submenu::with_items(app, "主题", true, &[
        &theme_dark, &theme_light, &theme_monokai, &theme_solarized, &theme_nord, &theme_dracula, &theme_github,
    ])?)
}

fn build_help_menu(app: &tauri::App) -> Result<Submenu<tauri::Wry>, Box<dyn std::error::Error>> {
    let welcome = MenuItem::with_id(app, "welcome", "欢迎页", true, None::<&str>)?;
    let markdown_guide = MenuItem::with_id(app, "markdown_guide", "Markdown 指南", true, None::<&str>)?;
    let keyboard_shortcuts = MenuItem::with_id(app, "keyboard_shortcuts", "快捷键参考", true, None::<&str>)?;
    let about = MenuItem::with_id(app, "about", "关于 Seven Markdown", true, None::<&str>)?;
    let check_update = MenuItem::with_id(app, "check_update", "检查更新", true, None::<&str>)?;
    Ok(Submenu::with_items(app, "帮助", true, &[
        &welcome, &markdown_guide, &keyboard_shortcuts, &PredefinedMenuItem::separator(app)?,
        &about, &check_update,
    ])?)
}

#[cfg(target_os = "macos")]
fn build_apple_menu(app: &tauri::App) -> Result<Submenu<tauri::Wry>, Box<dyn std::error::Error>> {
    let about_item = PredefinedMenuItem::about(app, Some("Seven Markdown"), None)?;
    let hide = PredefinedMenuItem::hide(app, Some("隐藏"))?;
    let hide_others = PredefinedMenuItem::hide_others(app, Some("隐藏其他"))?;
    let show_all = PredefinedMenuItem::show_all(app, Some("显示全部"))?;
    let quit_mac = PredefinedMenuItem::quit(app, Some("退出 Seven Markdown"))?;
    Ok(Submenu::with_items(app, "Seven Markdown", true, &[
        &about_item, &PredefinedMenuItem::separator(app)?,
        &PredefinedMenuItem::services(app, None)?, &PredefinedMenuItem::separator(app)?,
        &hide, &hide_others, &show_all, &PredefinedMenuItem::separator(app)?,
        &quit_mac,
    ])?)
}

#[cfg(target_os = "macos")]
fn build_window_menu(app: &tauri::App) -> Result<Submenu<tauri::Wry>, Box<dyn std::error::Error>> {
    let window_minimize = MenuItem::with_id(app, "window_minimize", "最小化", true, Some("Cmd+M"))?;
    let window_zoom = MenuItem::with_id(app, "window_zoom", "缩放", true, None::<&str>)?;
    let window_front = MenuItem::with_id(app, "window_front", "全部置于前面", true, None::<&str>)?;
    Ok(Submenu::with_items(app, "窗口", true, &[
        &window_minimize, &window_zoom, &PredefinedMenuItem::separator(app)?, &window_front,
    ])?)
}

// ─── Menu event dispatch (table-driven) ─────────────────────────────

/// Menu IDs that map 1:1 to a frontend event with no payload.
/// Format: (menu_item_id, frontend_event_name)
const SIMPLE_EVENTS: &[(&str, &str)] = &[
    // File
    ("new_file", "menu-new-file"),
    ("new_window", "menu-new-window"),
    ("open_file", "menu-open-file"),
    ("open_folder", "menu-open-folder"),
    ("open_folder_new_window", "menu-open-folder-new-window"),
    ("close_folder", "menu-close-folder"),
    ("clear_recent", "menu-clear-recent"),
    ("save", "menu-save"),
    ("save_all", "menu-save-all"),
    ("save_as", "menu-save-as"),
    ("export_pdf", "menu-export-pdf"),
    ("export_html", "menu-export-html"),
    ("close_tab", "menu-close-tab"),
    ("quit", "menu-quit"),
    // Edit
    ("undo", "menu-undo"),
    ("redo", "menu-redo"),
    ("cut", "menu-cut"),
    ("copy", "menu-copy"),
    ("paste", "menu-paste"),
    ("paste_match_style", "menu-paste-match-style"),
    ("select_all", "menu-select-all"),
    ("find", "menu-find"),
    ("replace", "menu-replace"),
    ("find_next", "menu-find-next"),
    ("find_previous", "menu-find-previous"),
    ("clear_format", "menu-clear-format"),
    // View
    ("command_palette", "menu-command-palette"),
    ("toggle_ai_panel", "menu-toggle-ai-panel"),
    ("toggle_sidebar", "menu-toggle-sidebar"),
    ("toggle_outline", "menu-toggle-outline"),
    ("toggle_explorer", "menu-toggle-explorer"),
    ("show_line_numbers", "menu-show-line-numbers"),
    ("show_minimap", "menu-show-minimap"),
    ("word_wrap", "menu-word-wrap"),
    ("zoom_in", "menu-zoom-in"),
    ("zoom_out", "menu-zoom-out"),
    ("reset_zoom", "menu-reset-zoom"),
    ("view_editor_only", "menu-view-editor-only"),
    ("view_preview_only", "menu-view-preview-only"),
    ("view_split", "menu-view-split"),
    ("toggle_fullscreen", "menu-toggle-fullscreen"),
    ("next_tab", "menu-next-tab"),
    ("prev_tab", "menu-prev-tab"),
    // Insert
    ("insert_h1", "menu-insert-h1"),
    ("insert_h2", "menu-insert-h2"),
    ("insert_h3", "menu-insert-h3"),
    ("insert_h4", "menu-insert-h4"),
    ("insert_h5", "menu-insert-h5"),
    ("insert_h6", "menu-insert-h6"),
    ("insert_bold", "menu-insert-bold"),
    ("insert_italic", "menu-insert-italic"),
    ("insert_strikethrough", "menu-insert-strikethrough"),
    ("insert_inline_code", "menu-insert-inline-code"),
    ("insert_code_block", "menu-insert-code-block"),
    ("insert_link", "menu-insert-link"),
    ("insert_image", "menu-insert-image"),
    ("insert_table", "menu-insert-table"),
    ("insert_hr", "menu-insert-hr"),
    ("insert_ul", "menu-insert-ul"),
    ("insert_ol", "menu-insert-ol"),
    ("insert_task", "menu-insert-task"),
    ("insert_quote", "menu-insert-quote"),
    ("insert_footnote", "menu-insert-footnote"),
    ("insert_details", "menu-insert-details"),
    // Format
    ("format_bold", "menu-format-bold"),
    ("format_italic", "menu-format-italic"),
    ("format_strikethrough", "menu-format-strikethrough"),
    ("format_h1", "menu-format-h1"),
    ("format_h2", "menu-format-h2"),
    ("format_h3", "menu-format-h3"),
    ("format_h4", "menu-format-h4"),
    ("format_h5", "menu-format-h5"),
    ("format_h6", "menu-format-h6"),
    ("format_code", "menu-format-code"),
    ("format_link", "menu-format-link"),
    // Help
    ("welcome", "menu-welcome"),
    ("markdown_guide", "menu-markdown-guide"),
    ("keyboard_shortcuts", "menu-keyboard-shortcuts"),
    ("about", "menu-about"),
    ("check_update", "menu-check-update"),
];

/// Menu IDs that emit a string payload (theme name).
const THEME_EVENTS: &[(&str, &str)] = &[
    ("theme_dark", "dark"),
    ("theme_light", "light"),
    ("theme_monokai", "monokai"),
    ("theme_solarized", "solarized"),
    ("theme_nord", "nord"),
    ("theme_dracula", "dracula"),
    ("theme_github", "github"),
];

/// Handle a native menu event by dispatching a Tauri event to the frontend.
pub fn handle_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
    let id = event.id().as_ref();

    // 1. Simple 1:1 events (no payload)
    if let Some(&(_, event_name)) = SIMPLE_EVENTS.iter().find(|(k, _)| *k == id) {
        let _ = app.emit(event_name, ());
        return;
    }

    // 2. Theme events (string payload)
    if let Some(&(_, theme)) = THEME_EVENTS.iter().find(|(k, _)| *k == id) {
        let _ = app.emit("menu-theme-change", theme);
        return;
    }

    // 3. Dynamic recent document items
    if let Some(path) = id.strip_prefix("recent_doc_") {
        let _ = app.emit("menu-open-recent-doc", path.to_string());
    }
}
