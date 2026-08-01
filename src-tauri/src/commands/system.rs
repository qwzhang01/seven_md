use std::fs;
use std::path::Path;
use std::process::Command as StdCommand;
use tauri::{Emitter, Manager};
use crate::logger::{log, LogLevel};

// ─── State ──────────────────────────────────────────────────────────

/// Holds the app handle so commands can update the native menu.
pub struct AppHandleState {
    pub handle: tauri::AppHandle,
}

// ─── App data path ──────────────────────────────────────────────────

#[tauri::command]
pub fn get_store_path(app: tauri::AppHandle) -> Result<String, String> {
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

// ─── Recent documents persistence ───────────────────────────────────

/// Persist recent documents to app_data_dir/recent_documents.json
/// and emit an event so all windows stay in sync.
#[tauri::command]
pub fn update_recent_menu(
    state: tauri::State<AppHandleState>,
    paths: Vec<String>,
) -> Result<(), String> {
    let app = &state.handle;
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    let file_path = data_dir.join("recent_documents.json");
    let json = serde_json::to_string(&paths).map_err(|e| e.to_string())?;
    fs::write(&file_path, json).map_err(|e| e.to_string())?;
    let _ = app.emit("menu-recent-docs-updated", &paths);
    Ok(())
}

// ─── Window management ──────────────────────────────────────────────

/// Create a new application window.
/// Optionally accepts an initial_folder path to auto-open in the new window.
#[tauri::command]
pub async fn create_new_window(app: tauri::AppHandle, initial_folder: Option<String>) -> Result<String, String> {
    let _ = log(LogLevel::Info, "Creating new window".to_string(),
        Some(serde_json::json!({"initial_folder": initial_folder})),
        Some("create_new_window".to_string()));
    let label = format!("window-{}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis());
    let url_str = match &initial_folder {
        Some(folder) => {
            let encoded = urlencoding::encode(folder);
            format!("index.html?folder={}", encoded)
        }
        None => "index.html".to_string(),
    };
    let webview_url = tauri::WebviewUrl::App(url_str.into());
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

// ─── External URL ───────────────────────────────────────────────────

/// Open an external URL in the system default browser.
#[tauri::command]
pub fn open_external_url(url: String) -> Result<(), String> {
    let _ = log(LogLevel::Debug, format!("Opening external URL: {}", url), None, Some("open_external_url".to_string()));
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err("Only HTTP/HTTPS URLs are supported".to_string());
    }
    #[cfg(target_os = "macos")]
    {
        StdCommand::new("open").arg(&url).spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    #[cfg(target_os = "windows")]
    {
        StdCommand::new("cmd").args(["/C", "start", "", &url]).spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    #[cfg(target_os = "linux")]
    {
        StdCommand::new("xdg-open").arg(&url).spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    Ok(())
}

// ─── Git branch ─────────────────────────────────────────────────────

/// 获取指定目录的 Git 分支名
/// 执行 `git branch --show-current`，失败时返回空字符串
#[tauri::command]
pub fn get_git_branch(dir_path: String) -> String {
    let _ = log(LogLevel::Debug, format!("Getting git branch for: {}", dir_path), None, Some("get_git_branch".to_string()));
    let output = StdCommand::new("git")
        .args(["branch", "--show-current"])
        .current_dir(&dir_path)
        .output();
    match output {
        Ok(out) => {
            if out.status.success() {
                let branch = String::from_utf8_lossy(&out.stdout).trim().to_string();
                let _ = log(LogLevel::Debug, format!("Git branch: {}", branch), None, Some("get_git_branch".to_string()));
                branch
            } else {
                let _ = log(LogLevel::Debug, "Not a git repository or git command failed".to_string(), None, Some("get_git_branch".to_string()));
                String::new()
            }
        }
        Err(e) => {
            let _ = log(LogLevel::Warn, format!("Failed to execute git: {}", e), None, Some("get_git_branch".to_string()));
            String::new()
        }
    }
}

// ─── Open in terminal ───────────────────────────────────────────────

/// 在终端中打开指定路径（目录则直接在目录中打开，文件则打开其所在目录）
#[tauri::command]
pub fn open_in_terminal(path: String) -> Result<(), String> {
    let _ = log(LogLevel::Debug, format!("Opening in terminal: {}", path), None, Some("open_in_terminal".to_string()));
    let p = Path::new(&path);
    let dir = if p.is_file() { p.parent().map(|d| d.to_path_buf()) } else { Some(p.to_path_buf()) };
    match dir {
        Some(dir) => {
            #[cfg(target_os = "macos")]
            {
                match StdCommand::new("osascript")
                    .args(["-e", &format!("tell app \"Terminal\" to do script \"cd {} && clear\"", dir.to_string_lossy())])
                    .spawn()
                {
                    Ok(_) => {
                        let _ = log(LogLevel::Info, "Terminal opened successfully".to_string(), Some(serde_json::json!({"path": path})), Some("open_in_terminal".to_string()));
                        Ok(())
                    }
                    Err(e) => Err(format!("Failed to open Terminal: {}", e))
                }
            }
            #[cfg(target_os = "windows")]
            {
                match StdCommand::new("cmd")
                    .args(["/C", "start", "cmd", "/K", &format!("cd /d {}", dir.to_string_lossy())])
                    .spawn()
                {
                    Ok(_) => Ok(()),
                    Err(e) => Err(format!("Failed to open cmd: {}", e))
                }
            }
            #[cfg(target_os = "linux")]
            {
                let terminals = ["gnome-terminal", "konsole", "xterm"];
                for term in terminals {
                    if StdCommand::new("which").arg(term).output().map(|o| o.status.success()).unwrap_or(false) {
                        let result = match term {
                            "gnome-terminal" => StdCommand::new(term).arg("--").arg(format!("cd {} && $SHELL", dir.to_string_lossy())).spawn(),
                            "konsole" => StdCommand::new(term).arg("-e").arg("bash").arg("-c").arg(format!("cd {} && $SHELL", dir.to_string_lossy())).spawn(),
                            _ => StdCommand::new(term).spawn(),
                        };
                        if result.is_ok() { return Ok(()); }
                    }
                }
                Err("No terminal emulator found".to_string())
            }
        }
        None => Err("Invalid path".to_string())
    }
}

// ─── Reveal in Finder/Explorer ──────────────────────────────────────

/// 在 Finder 中显示文件或文件夹（macOS 专用）
#[cfg(target_os = "macos")]
#[tauri::command]
pub fn reveal_in_finder(path: String) -> Result<(), String> {
    let _ = log(LogLevel::Debug, format!("Revealing in Finder: {}", path), None, Some("reveal_in_finder".to_string()));
    match StdCommand::new("osascript")
        .args(["-e", &format!("tell app \"Finder\" to reveal POSIX file \"{}\"", path)])
        .spawn()
    {
        Ok(_) => {
            let _ = log(LogLevel::Info, "Revealed in Finder".to_string(), Some(serde_json::json!({"path": path})), Some("reveal_in_finder".to_string()));
            Ok(())
        }
        Err(e) => Err(format!("Failed to reveal in Finder: {}", e))
    }
}

/// 在资源管理器中显示文件或文件夹（Windows 专用）
#[cfg(target_os = "windows")]
#[tauri::command]
pub fn reveal_in_explorer(path: String) -> Result<(), String> {
    let _ = log(LogLevel::Debug, format!("Revealing in Explorer: {}", path), None, Some("reveal_in_explorer".to_string()));
    match StdCommand::new("explorer").args(["/select,", &path]).spawn() {
        Ok(_) => {
            let _ = log(LogLevel::Info, "Revealed in Explorer".to_string(), Some(serde_json::json!({"path": path})), Some("reveal_in_explorer".to_string()));
            Ok(())
        }
        Err(e) => Err(format!("Failed to reveal in Explorer: {}", e))
    }
}
