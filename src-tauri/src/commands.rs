use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use crate::logger::{log, LogLevel};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileTreeNode {
    name: String,
    path: String,
    #[serde(rename = "type")]
    node_type: String, // "file" or "directory"
    extension: Option<String>,
    children: Option<Vec<FileTreeNode>>,
    #[serde(rename = "isLoaded")]
    is_loaded: Option<bool>,
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    let _ = log(LogLevel::Debug, format!("Reading file: {}", path), None, Some("read_file".to_string()));
    
    match std::fs::read_to_string(&path) {
        Ok(content) => {
            let _ = log(LogLevel::Info, "File read successfully".to_string(), 
                Some(serde_json::json!({"path": path, "size": content.len()})), 
                Some("read_file".to_string()));
            Ok(content)
        }
        Err(e) => {
            let _ = log(LogLevel::Error, format!("Failed to read file: {}", e), 
                Some(serde_json::json!({"path": path, "error": e.to_string()})), 
                Some("read_file".to_string()));
            Err(format!("Failed to read file: {}", e))
        }
    }
}

#[tauri::command]
pub fn save_file(path: String, content: String) -> Result<(), String> {
    let _ = log(LogLevel::Debug, format!("Saving file: {}", path), None, Some("save_file".to_string()));
    
    match std::fs::write(&path, content) {
        Ok(()) => {
            let _ = log(LogLevel::Info, "File saved successfully".to_string(), 
                Some(serde_json::json!({"path": path})), 
                Some("save_file".to_string()));
            Ok(())
        }
        Err(e) => {
            let _ = log(LogLevel::Error, format!("Failed to save file: {}", e), 
                Some(serde_json::json!({"path": path, "error": e.to_string()})), 
                Some("save_file".to_string()));
            Err(format!("Failed to save file: {}", e))
        }
    }
}

#[tauri::command]
pub fn read_directory(path: String) -> Result<Vec<FileTreeNode>, String> {
    let _ = log(LogLevel::Debug, format!("Reading directory: {}", path), None, Some("read_directory".to_string()));
    
    let dir_path = Path::new(&path);
    
    if !dir_path.is_dir() {
        let _ = log(LogLevel::Error, format!("Path is not a directory: {}", path), None, Some("read_directory".to_string()));
        return Err(format!("Path is not a directory: {}", path));
    }
    
    let mut nodes: Vec<FileTreeNode> = Vec::new();
    
    let entries = match fs::read_dir(dir_path) {
        Ok(e) => e,
        Err(e) => {
            let _ = log(LogLevel::Error, format!("Failed to read directory: {}", e), 
                Some(serde_json::json!({"path": path, "error": e.to_string()})), 
                Some("read_directory".to_string()));
            return Err(format!("Failed to read directory: {}", e));
        }
    };
    
    for entry in entries {
        let entry = match entry {
            Ok(e) => e,
            Err(e) => {
                let _ = log(LogLevel::Warn, format!("Failed to read entry: {}", e), None, Some("read_directory".to_string()));
                continue;
            }
        };
        let path = entry.path();
        
        // Skip hidden files and directories (starting with .)
        let file_name = path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("");
        
        if file_name.starts_with('.') {
            continue;
        }
        
        let node_type = if path.is_dir() {
            "directory"
        } else {
            "file"
        };
        
        // Only show .md files for files
        if path.is_file() {
            let ext = path.extension()
                .and_then(|e| e.to_str())
                .unwrap_or("");
            
            if ext != "md" && ext != "markdown" {
                continue;
            }
        }
        
        let extension = path.extension()
            .and_then(|e| e.to_str())
            .map(|s| s.to_string());
        
        let node = FileTreeNode {
            name: file_name.to_string(),
            path: path.to_string_lossy().to_string(),
            node_type: node_type.to_string(),
            extension,
            children: if path.is_dir() { Some(vec![]) } else { None },
            is_loaded: Some(false),
        };
        
        nodes.push(node);
    }
    
    // Sort: directories first, then files, alphabetically within each group
    nodes.sort_by(|a, b| {
        let a_is_dir = a.node_type == "directory";
        let b_is_dir = b.node_type == "directory";
        
        if a_is_dir && !b_is_dir {
            std::cmp::Ordering::Less
        } else if !a_is_dir && b_is_dir {
            std::cmp::Ordering::Greater
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });
    
    let _ = log(LogLevel::Info, "Directory read successfully".to_string(), 
        Some(serde_json::json!({"path": path, "node_count": nodes.len()})), 
        Some("read_directory".to_string()));
    
    Ok(nodes)
}

#[tauri::command]
pub async fn export_html(app: tauri::AppHandle, html: String, suggested_name: String) -> Result<Option<String>, String> {
    let _ = log(LogLevel::Debug, format!("Exporting HTML: {}", suggested_name), None, Some("export_html".to_string()));

    use tauri_plugin_dialog::DialogExt;

    let save_path = app.dialog()
        .file()
        .set_file_name(&suggested_name)
        .add_filter("HTML Files", &["html", "htm"])
        .blocking_save_file();

    match save_path {
        Some(path) => {
            let path_str = path.to_string();
            match std::fs::write(&path_str, html.as_bytes()) {
                Ok(()) => {
                    let _ = log(LogLevel::Info, "HTML exported successfully".to_string(),
                        Some(serde_json::json!({"path": path_str})),
                        Some("export_html".to_string()));
                    Ok(Some(path_str))
                }
                Err(e) => {
                    let _ = log(LogLevel::Error, format!("Failed to write HTML file: {}", e),
                        Some(serde_json::json!({"path": path_str, "error": e.to_string()})),
                        Some("export_html".to_string()));
                    Err(format!("Failed to write HTML file: {}", e))
                }
            }
        }
        None => {
            let _ = log(LogLevel::Debug, "HTML export cancelled by user".to_string(), None, Some("export_html".to_string()));
            Ok(None) // User cancelled — not an error
        }
    }
}

/// Result item for filename search
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchResult {
    pub path: String,
    #[serde(rename = "relativePath")]
    pub relative_path: String,
    pub name: String,
}

/// Result item for full-text search
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TextSearchResult {
    pub path: String,
    #[serde(rename = "relativePath")]
    pub relative_path: String,
    pub name: String,
    #[serde(rename = "lineNumber")]
    pub line_number: usize,
    pub snippet: String,
}

/// Combined search response
#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResponse {
    #[serde(rename = "fileResults")]
    pub file_results: Vec<SearchResult>,
    #[serde(rename = "textResults")]
    pub text_results: Vec<TextSearchResult>,
    pub truncated: bool,
}

const MAX_RESULTS: usize = 200;

/// Recursively collect all .md files under a directory
fn collect_md_files(dir: &Path, results: &mut Vec<std::path::PathBuf>) {
    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let path = entry.path();
        let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
        if name.starts_with('.') {
            continue;
        }
        if path.is_dir() {
            collect_md_files(&path, results);
        } else if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
            if ext == "md" || ext == "markdown" {
                results.push(path);
            }
        }
    }
}

/// Simple fuzzy match: every character in `query` appears in `text` in order (case-insensitive)
fn fuzzy_match(text: &str, query: &str) -> bool {
    if query.is_empty() {
        return true;
    }
    let text_lower = text.to_lowercase();
    let query_lower = query.to_lowercase();
    let mut text_chars = text_lower.chars();
    'outer: for qc in query_lower.chars() {
        loop {
            match text_chars.next() {
                Some(tc) if tc == qc => continue 'outer,
                Some(_) => continue,
                None => return false,
            }
        }
    }
    true
}

#[tauri::command]
pub fn search_in_files(
    folder_path: String,
    query: String,
    search_type: String,
) -> Result<SearchResponse, String> {
    let _ = log(
        LogLevel::Debug,
        format!("search_in_files: type={} query={}", search_type, query),
        None,
        Some("search_in_files".to_string()),
    );

    if query.trim().is_empty() {
        return Ok(SearchResponse {
            file_results: vec![],
            text_results: vec![],
            truncated: false,
        });
    }

    let folder = Path::new(&folder_path);
    if !folder.is_dir() {
        return Err(format!("Not a directory: {}", folder_path));
    }

    let mut md_files: Vec<std::path::PathBuf> = Vec::new();
    collect_md_files(folder, &mut md_files);

    let mut file_results: Vec<SearchResult> = Vec::new();
    let mut text_results: Vec<TextSearchResult> = Vec::new();
    let mut truncated = false;

    if search_type == "filename" {
        for path in &md_files {
            if file_results.len() >= MAX_RESULTS {
                truncated = true;
                break;
            }
            let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
            if fuzzy_match(name, &query) {
                let relative_path = path
                    .strip_prefix(folder)
                    .map(|p| p.to_string_lossy().to_string())
                    .unwrap_or_else(|_| path.to_string_lossy().to_string());
                file_results.push(SearchResult {
                    path: path.to_string_lossy().to_string(),
                    relative_path,
                    name: name.to_string(),
                });
            }
        }
    } else {
        // full-text search
        let query_lower = query.to_lowercase();
        'file_loop: for path in &md_files {
            let content = match std::fs::read_to_string(path) {
                Ok(c) => c,
                Err(e) => {
                    let _ = log(
                        LogLevel::Warn,
                        format!("search_in_files: skipping unreadable file: {}", e),
                        Some(serde_json::json!({"path": path.to_string_lossy()})),
                        Some("search_in_files".to_string()),
                    );
                    continue;
                }
            };
            let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
            let relative_path = path
                .strip_prefix(folder)
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|_| path.to_string_lossy().to_string());

            for (idx, line) in content.lines().enumerate() {
                if text_results.len() >= MAX_RESULTS {
                    truncated = true;
                    break 'file_loop;
                }
                if line.to_lowercase().contains(&query_lower) {
                    text_results.push(TextSearchResult {
                        path: path.to_string_lossy().to_string(),
                        relative_path: relative_path.clone(),
                        name: name.to_string(),
                        line_number: idx + 1,
                        snippet: line.trim().to_string(),
                    });
                }
            }
        }
    }

    let _ = log(
        LogLevel::Info,
        "search_in_files completed".to_string(),
        Some(serde_json::json!({
            "file_results": file_results.len(),
            "text_results": text_results.len(),
            "truncated": truncated
        })),
        Some("search_in_files".to_string()),
    );

    Ok(SearchResponse {
        file_results,
        text_results,
        truncated,
    })
}

// ─── File System Mutation Commands ──────────────────────────────────────────

#[tauri::command]
pub fn create_file(path: String) -> Result<(), String> {
    let _ = log(LogLevel::Debug, format!("Creating file: {}", path), None, Some("create_file".to_string()));

    let p = Path::new(&path);

    // Check parent directory exists
    if let Some(parent) = p.parent() {
        if !parent.exists() {
            let msg = format!("Parent directory does not exist: {}", parent.display());
            let _ = log(LogLevel::Error, msg.clone(), Some(serde_json::json!({"path": path})), Some("create_file".to_string()));
            return Err(msg);
        }
    }

    // Reject if file already exists
    if p.exists() {
        let msg = format!("File already exists: {}", path);
        let _ = log(LogLevel::Error, msg.clone(), Some(serde_json::json!({"path": path})), Some("create_file".to_string()));
        return Err(msg);
    }

    match fs::File::create(&path) {
        Ok(_) => {
            let _ = log(LogLevel::Info, "File created successfully".to_string(),
                Some(serde_json::json!({"path": path})),
                Some("create_file".to_string()));
            Ok(())
        }
        Err(e) => {
            let msg = format!("Failed to create file: {}", e);
            let _ = log(LogLevel::Error, msg.clone(), Some(serde_json::json!({"path": path, "error": e.to_string()})), Some("create_file".to_string()));
            Err(msg)
        }
    }
}

#[tauri::command]
pub fn create_directory(path: String) -> Result<(), String> {
    let _ = log(LogLevel::Debug, format!("Creating directory: {}", path), None, Some("create_directory".to_string()));

    let p = Path::new(&path);

    if p.exists() {
        let msg = format!("Directory already exists: {}", path);
        let _ = log(LogLevel::Error, msg.clone(), Some(serde_json::json!({"path": path})), Some("create_directory".to_string()));
        return Err(msg);
    }

    match fs::create_dir(&path) {
        Ok(()) => {
            let _ = log(LogLevel::Info, "Directory created successfully".to_string(),
                Some(serde_json::json!({"path": path})),
                Some("create_directory".to_string()));
            Ok(())
        }
        Err(e) => {
            let msg = format!("Failed to create directory: {}", e);
            let _ = log(LogLevel::Error, msg.clone(), Some(serde_json::json!({"path": path, "error": e.to_string()})), Some("create_directory".to_string()));
            Err(msg)
        }
    }
}

#[tauri::command]
pub fn rename_path(old_path: String, new_path: String) -> Result<(), String> {
    let _ = log(LogLevel::Debug, format!("Renaming: {} -> {}", old_path, new_path), None, Some("rename_path".to_string()));

    if !Path::new(&old_path).exists() {
        let msg = format!("Source path does not exist: {}", old_path);
        let _ = log(LogLevel::Error, msg.clone(), Some(serde_json::json!({"old_path": old_path, "new_path": new_path})), Some("rename_path".to_string()));
        return Err(msg);
    }

    if Path::new(&new_path).exists() {
        let msg = format!("Destination already exists: {}", new_path);
        let _ = log(LogLevel::Error, msg.clone(), Some(serde_json::json!({"old_path": old_path, "new_path": new_path})), Some("rename_path".to_string()));
        return Err(msg);
    }

    match fs::rename(&old_path, &new_path) {
        Ok(()) => {
            let _ = log(LogLevel::Info, "Path renamed successfully".to_string(),
                Some(serde_json::json!({"old_path": old_path, "new_path": new_path})),
                Some("rename_path".to_string()));
            Ok(())
        }
        Err(e) => {
            let msg = format!("Failed to rename path: {}", e);
            let _ = log(LogLevel::Error, msg.clone(), Some(serde_json::json!({"old_path": old_path, "new_path": new_path, "error": e.to_string()})), Some("rename_path".to_string()));
            Err(msg)
        }
    }
}

#[tauri::command]
pub fn delete_path(path: String) -> Result<(), String> {
    let _ = log(LogLevel::Debug, format!("Deleting path: {}", path), None, Some("delete_path".to_string()));

    let p = Path::new(&path);

    if !p.exists() {
        let msg = format!("Path does not exist: {}", path);
        let _ = log(LogLevel::Error, msg.clone(), Some(serde_json::json!({"path": path})), Some("delete_path".to_string()));
        return Err(msg);
    }

    let result = if p.is_dir() {
        fs::remove_dir_all(&path)
    } else {
        fs::remove_file(&path)
    };

    match result {
        Ok(()) => {
            let _ = log(LogLevel::Info, "Path deleted successfully".to_string(),
                Some(serde_json::json!({"path": path})),
                Some("delete_path".to_string()));
            Ok(())
        }
        Err(e) => {
            let msg = format!("Failed to delete path: {}", e);
            let _ = log(LogLevel::Error, msg.clone(), Some(serde_json::json!({"path": path, "error": e.to_string()})), Some("delete_path".to_string()));
            Err(msg)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use std::io::Write;

    #[test]
    fn test_read_file_success() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("test.md");
        
        let mut file = std::fs::File::create(&file_path).expect("Failed to create file");
        file.write_all(b"Hello, World!").expect("Failed to write");
        
        let result = read_file(file_path.to_string_lossy().to_string());
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "Hello, World!");
    }

    #[test]
    fn test_read_file_not_found() {
        let result = read_file("/nonexistent/path/file.md".to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Failed to read file"));
    }

    #[test]
    fn test_save_file_success() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("output.md");
        
        let result = save_file(file_path.to_string_lossy().to_string(), "Test content".to_string());
        assert!(result.is_ok());
        
        // Verify content was written
        let content = std::fs::read_to_string(&file_path).expect("Failed to read");
        assert_eq!(content, "Test content");
    }

    #[test]
    fn test_save_file_invalid_path() {
        let result = save_file("/nonexistent/path/file.md".to_string(), "content".to_string());
        assert!(result.is_err());
    }

    #[test]
    fn test_read_directory_success() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // Create test files and directories
        std::fs::create_dir(temp_dir.path().join("subdir")).expect("Failed to create dir");
        std::fs::File::create(temp_dir.path().join("test1.md")).expect("Failed to create file");
        std::fs::File::create(temp_dir.path().join("test2.md")).expect("Failed to create file");
        std::fs::File::create(temp_dir.path().join("ignore.txt")).expect("Failed to create file"); // Should be ignored
        
        let result = read_directory(temp_dir.path().to_string_lossy().to_string());
        assert!(result.is_ok());
        
        let nodes = result.unwrap();
        // Should have: subdir (directory), test1.md, test2.md (ignore.txt filtered out)
        assert_eq!(nodes.len(), 3);
        
        // Directories should come first
        assert_eq!(nodes[0].node_type, "directory");
        assert_eq!(nodes[0].name, "subdir");
    }

    #[test]
    fn test_read_directory_not_a_directory() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("file.md");
        std::fs::File::create(&file_path).expect("Failed to create file");
        
        let result = read_directory(file_path.to_string_lossy().to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not a directory"));
    }

    #[test]
    fn test_read_directory_hidden_files_ignored() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // Create hidden files
        std::fs::File::create(temp_dir.path().join(".hidden.md")).expect("Failed to create file");
        std::fs::File::create(temp_dir.path().join("visible.md")).expect("Failed to create file");
        
        let result = read_directory(temp_dir.path().to_string_lossy().to_string());
        assert!(result.is_ok());
        
        let nodes = result.unwrap();
        assert_eq!(nodes.len(), 1);
        assert_eq!(nodes[0].name, "visible.md");
    }

    #[test]
    fn test_read_directory_sorting() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // Create files and directories with specific names
        std::fs::create_dir(temp_dir.path().join("ZDir")).expect("Failed to create dir");
        std::fs::create_dir(temp_dir.path().join("ADir")).expect("Failed to create dir");
        std::fs::File::create(temp_dir.path().join("z.md")).expect("Failed to create file");
        std::fs::File::create(temp_dir.path().join("a.md")).expect("Failed to create file");
        
        let result = read_directory(temp_dir.path().to_string_lossy().to_string());
        assert!(result.is_ok());
        
        let nodes = result.unwrap();
        
        // Directories first (sorted alphabetically), then files (sorted alphabetically)
        assert_eq!(nodes[0].name, "ADir");
        assert_eq!(nodes[1].name, "ZDir");
        assert_eq!(nodes[2].name, "a.md");
        assert_eq!(nodes[3].name, "z.md");
    }

    // export_html writes HTML content to a file path (core logic test, dialog-free)
    #[test]
    fn test_export_html_write_success() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("output.html");
        let html = "<html><body><h1>Hello</h1></body></html>";

        let result = std::fs::write(&file_path, html.as_bytes());
        assert!(result.is_ok());

        let content = std::fs::read_to_string(&file_path).expect("Failed to read");
        assert_eq!(content, html);
    }

    #[test]
    fn test_export_html_write_invalid_path() {
        let result = std::fs::write("/nonexistent/path/output.html", b"<html></html>");
        assert!(result.is_err());
    }

    #[test]
    fn test_export_html_write_permission_error() {
        // Write to a read-only directory (simulate permission error)
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("output.html");

        // Write successfully first
        std::fs::write(&file_path, b"<html></html>").expect("Initial write failed");

        // Make file read-only
        let mut perms = std::fs::metadata(&file_path).unwrap().permissions();
        use std::os::unix::fs::PermissionsExt;
        perms.set_mode(0o444);
        std::fs::set_permissions(&file_path, perms).unwrap();

        // Attempt to overwrite — should fail
        let result = std::fs::write(&file_path, b"<html>new</html>");
        assert!(result.is_err());
    }

    #[test]
    fn test_file_tree_node_serialization() {
        let node = FileTreeNode {
            name: "test.md".to_string(),
            path: "/path/to/test.md".to_string(),
            node_type: "file".to_string(),
            extension: Some("md".to_string()),
            children: None,
            is_loaded: Some(false),
        };
        
        let json = serde_json::to_string(&node).expect("Failed to serialize");
        assert!(json.contains("\"name\":\"test.md\""));
        assert!(json.contains("\"type\":\"file\""));
        assert!(json.contains("\"isLoaded\":false"));
    }

    // --- search_in_files tests ---

    #[test]
    fn test_fuzzy_match_basic() {
        assert!(fuzzy_match("readme.md", "readme"));
        assert!(fuzzy_match("readme.md", "rdm"));
        assert!(fuzzy_match("README.md", "readme")); // case-insensitive
        assert!(!fuzzy_match("readme.md", "xyz"));
        assert!(fuzzy_match("anything", "")); // empty query matches all
    }

    #[test]
    fn test_search_filename_basic() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        std::fs::File::create(temp_dir.path().join("readme.md")).unwrap();
        std::fs::File::create(temp_dir.path().join("notes.md")).unwrap();
        std::fs::File::create(temp_dir.path().join("todo.md")).unwrap();

        let result = search_in_files(
            temp_dir.path().to_string_lossy().to_string(),
            "note".to_string(),
            "filename".to_string(),
        );
        assert!(result.is_ok());
        let resp = result.unwrap();
        assert_eq!(resp.file_results.len(), 1);
        assert_eq!(resp.file_results[0].name, "notes.md");
        assert!(!resp.truncated);
    }

    #[test]
    fn test_search_filename_case_insensitive() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        std::fs::File::create(temp_dir.path().join("README.md")).unwrap();

        let result = search_in_files(
            temp_dir.path().to_string_lossy().to_string(),
            "readme".to_string(),
            "filename".to_string(),
        );
        assert!(result.is_ok());
        let resp = result.unwrap();
        assert_eq!(resp.file_results.len(), 1);
    }

    #[test]
    fn test_search_fulltext_basic() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("doc.md");
        std::fs::write(&file_path, "# Hello World\nThis is a test file.\nAnother line.").unwrap();

        let result = search_in_files(
            temp_dir.path().to_string_lossy().to_string(),
            "test".to_string(),
            "fulltext".to_string(),
        );
        assert!(result.is_ok());
        let resp = result.unwrap();
        assert_eq!(resp.text_results.len(), 1);
        assert_eq!(resp.text_results[0].line_number, 2);
        assert!(resp.text_results[0].snippet.contains("test"));
    }

    #[test]
    fn test_search_fulltext_case_insensitive() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("doc.md");
        std::fs::write(&file_path, "Hello World\nTEST line").unwrap();

        let result = search_in_files(
            temp_dir.path().to_string_lossy().to_string(),
            "test".to_string(),
            "fulltext".to_string(),
        );
        assert!(result.is_ok());
        let resp = result.unwrap();
        assert_eq!(resp.text_results.len(), 1);
        assert_eq!(resp.text_results[0].line_number, 2);
    }

    #[test]
    fn test_search_empty_query_returns_empty() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        std::fs::File::create(temp_dir.path().join("doc.md")).unwrap();

        let result = search_in_files(
            temp_dir.path().to_string_lossy().to_string(),
            "".to_string(),
            "filename".to_string(),
        );
        assert!(result.is_ok());
        let resp = result.unwrap();
        assert!(resp.file_results.is_empty());
        assert!(!resp.truncated);
    }

    #[test]
    fn test_search_invalid_folder() {
        let result = search_in_files(
            "/nonexistent/path".to_string(),
            "query".to_string(),
            "filename".to_string(),
        );
        assert!(result.is_err());
    }

    // --- create_file tests ---

    #[test]
    fn test_create_file_success() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("new_file.md");

        let result = create_file(file_path.to_string_lossy().to_string());
        assert!(result.is_ok());
        assert!(file_path.exists());
    }

    #[test]
    fn test_create_file_already_exists() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("existing.md");
        std::fs::File::create(&file_path).expect("Failed to create file");

        let result = create_file(file_path.to_string_lossy().to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("File already exists"));
    }

    #[test]
    fn test_create_file_missing_parent() {
        let result = create_file("/nonexistent/parent/dir/file.md".to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Parent directory does not exist"));
    }

    // --- create_directory tests ---

    #[test]
    fn test_create_directory_success() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let dir_path = temp_dir.path().join("new_dir");

        let result = create_directory(dir_path.to_string_lossy().to_string());
        assert!(result.is_ok());
        assert!(dir_path.is_dir());
    }

    #[test]
    fn test_create_directory_already_exists() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let dir_path = temp_dir.path().join("existing_dir");
        std::fs::create_dir(&dir_path).expect("Failed to create dir");

        let result = create_directory(dir_path.to_string_lossy().to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Directory already exists"));
    }

    // --- rename_path tests ---

    #[test]
    fn test_rename_path_file_success() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let old_path = temp_dir.path().join("old.md");
        let new_path = temp_dir.path().join("new.md");
        std::fs::File::create(&old_path).expect("Failed to create file");

        let result = rename_path(
            old_path.to_string_lossy().to_string(),
            new_path.to_string_lossy().to_string(),
        );
        assert!(result.is_ok());
        assert!(!old_path.exists());
        assert!(new_path.exists());
    }

    #[test]
    fn test_rename_path_directory_success() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let old_dir = temp_dir.path().join("old_dir");
        let new_dir = temp_dir.path().join("new_dir");
        std::fs::create_dir(&old_dir).expect("Failed to create dir");

        let result = rename_path(
            old_dir.to_string_lossy().to_string(),
            new_dir.to_string_lossy().to_string(),
        );
        assert!(result.is_ok());
        assert!(!old_dir.exists());
        assert!(new_dir.is_dir());
    }

    #[test]
    fn test_rename_path_source_missing() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let result = rename_path(
            temp_dir.path().join("nonexistent.md").to_string_lossy().to_string(),
            temp_dir.path().join("dest.md").to_string_lossy().to_string(),
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Source path does not exist"));
    }

    #[test]
    fn test_rename_path_destination_exists() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let old_path = temp_dir.path().join("old.md");
        let new_path = temp_dir.path().join("existing.md");
        std::fs::File::create(&old_path).expect("Failed to create file");
        std::fs::File::create(&new_path).expect("Failed to create file");

        let result = rename_path(
            old_path.to_string_lossy().to_string(),
            new_path.to_string_lossy().to_string(),
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Destination already exists"));
    }

    // --- delete_path tests ---

    #[test]
    fn test_delete_path_file_success() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("to_delete.md");
        std::fs::File::create(&file_path).expect("Failed to create file");

        let result = delete_path(file_path.to_string_lossy().to_string());
        assert!(result.is_ok());
        assert!(!file_path.exists());
    }

    #[test]
    fn test_delete_path_directory_success() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let dir_path = temp_dir.path().join("to_delete_dir");
        std::fs::create_dir(&dir_path).expect("Failed to create dir");
        std::fs::File::create(dir_path.join("child.md")).expect("Failed to create child");

        let result = delete_path(dir_path.to_string_lossy().to_string());
        assert!(result.is_ok());
        assert!(!dir_path.exists());
    }

    #[test]
    fn test_delete_path_not_found() {
        let result = delete_path("/nonexistent/path/file.md".to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Path does not exist"));
    }
}
