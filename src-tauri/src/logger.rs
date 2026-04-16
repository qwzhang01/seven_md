use chrono::{Local, Utc};
use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;

/// Log levels supported by the logger
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

impl std::fmt::Display for LogLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LogLevel::Trace => write!(f, "TRACE"),
            LogLevel::Debug => write!(f, "DEBUG"),
            LogLevel::Info => write!(f, "INFO"),
            LogLevel::Warn => write!(f, "WARN"),
            LogLevel::Error => write!(f, "ERROR"),
        }
    }
}

/// Log entry structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<String>,
}

/// Logger configuration
#[allow(dead_code)]
pub struct LoggerConfig {
    pub log_dir: PathBuf,
    pub max_file_size: u64,       // in bytes
    pub max_files: usize,         // number of files to keep
    pub default_level: LogLevel,
}

impl Default for LoggerConfig {
    fn default() -> Self {
        Self {
            log_dir: PathBuf::from("logs"),
            max_file_size: 10 * 1024 * 1024, // 10 MB
            max_files: 7,                     // Keep 7 days
            default_level: LogLevel::Info,
        }
    }
}

/// Global logger state
pub struct Logger {
    config: LoggerConfig,
    current_file: Option<PathBuf>,
    current_size: u64,
}

impl Logger {
    /// Create a new logger instance
    pub fn new(config: LoggerConfig) -> Self {
        // Ensure log directory exists
        if let Err(e) = fs::create_dir_all(&config.log_dir) {
            eprintln!("Failed to create log directory: {}", e);
        }
        
        let mut logger = Self {
            config,
            current_file: None,
            current_size: 0,
        };
        
        // Initialize current log file
        logger.rotate_if_needed();
        logger
    }
    
    /// Get the current log file path
    fn get_log_file_path(&self) -> PathBuf {
        let date = Local::now().format("%Y-%m-%d");
        self.config.log_dir.join(format!("app-{}.log", date))
    }
    
    /// Check if log rotation is needed and rotate if so
    fn rotate_if_needed(&mut self) {
        let log_file = self.get_log_file_path();
        
        // Check if file exists and its size
        let file_exists = log_file.exists();
        let file_size = if file_exists {
            fs::metadata(&log_file)
                .map(|m| m.len())
                .unwrap_or(0)
        } else {
            0
        };
        
        self.current_file = Some(log_file);
        self.current_size = file_size;
        
        // Rotate if file is too large
        if self.current_size >= self.config.max_file_size {
            self.rotate_file();
        }
    }
    
    /// Rotate the log file
    fn rotate_file(&mut self) {
        if let Some(ref current_file) = self.current_file {
            if current_file.exists() {
                let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
                let rotated_file = current_file.with_extension(format!("log.{}", timestamp));
                
                if let Err(e) = fs::rename(current_file, &rotated_file) {
                    eprintln!("Failed to rotate log file: {}", e);
                }
            }
        }
        
        self.current_size = 0;
        self.cleanup_old_files();
    }
    
    /// Remove old log files beyond the retention period
    fn cleanup_old_files(&self) {
        if let Ok(entries) = fs::read_dir(&self.config.log_dir) {
            let mut log_files: Vec<PathBuf> = entries
                .filter_map(|e| e.ok())
                .filter(|e| {
                    e.path().extension()
                        .and_then(|ext| ext.to_str())
                        .map(|ext| ext == "log")
                        .unwrap_or(false)
                })
                .map(|e| e.path())
                .collect();
            
            // Sort by modification time (oldest first)
            log_files.sort_by_key(|p| {
                fs::metadata(p)
                    .and_then(|m| m.modified())
                    .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
            });
            
            // Remove oldest files if we have too many
            while log_files.len() > self.config.max_files {
                if let Some(old_file) = log_files.first() {
                    if let Err(e) = fs::remove_file(old_file) {
                        eprintln!("Failed to remove old log file: {}", e);
                    }
                    log_files.remove(0);
                }
            }
        }
    }
    
    /// Write a log entry to file
    pub fn log(&mut self, entry: &LogEntry) -> Result<(), String> {
        // Check if rotation is needed
        self.rotate_if_needed();
        
        if let Some(ref log_file) = self.current_file {
            let json = serde_json::to_string(entry)
                .map_err(|e| format!("Failed to serialize log entry: {}", e))?;
            
            let mut file = OpenOptions::new()
                .create(true)
                .append(true)
                .open(log_file)
                .map_err(|e| format!("Failed to open log file: {}", e))?;
            
            writeln!(file, "{}", json)
                .map_err(|e| format!("Failed to write to log file: {}", e))?;
            
            self.current_size += json.len() as u64 + 1; // +1 for newline
            
            Ok(())
        } else {
            Err("No log file available".to_string())
        }
    }
    
    /// Read all logs from a specific date
    pub fn read_logs(&self, date: &str) -> Result<Vec<LogEntry>, String> {
        let log_file = self.config.log_dir.join(format!("app-{}.log", date));
        
        if !log_file.exists() {
            return Ok(vec![]);
        }
        
        let content = fs::read_to_string(&log_file)
            .map_err(|e| format!("Failed to read log file: {}", e))?;
        
        let entries: Vec<LogEntry> = content
            .lines()
            .filter_map(|line| serde_json::from_str(line).ok())
            .collect();
        
        Ok(entries)
    }
    
    /// Get list of available log dates
    pub fn get_available_dates(&self) -> Result<Vec<String>, String> {
        let entries = fs::read_dir(&self.config.log_dir)
            .map_err(|e| format!("Failed to read log directory: {}", e))?;
        
        let dates: Vec<String> = entries
            .filter_map(|e| e.ok())
            .filter_map(|e| {
                let file_name = e.file_name().to_string_lossy().to_string();
                // Extract date from filename like "app-2024-01-15.log"
                if file_name.starts_with("app-") && file_name.ends_with(".log") {
                    Some(file_name[4..file_name.len()-4].to_string())
                } else {
                    None
                }
            })
            .collect();
        
        Ok(dates)
    }
}

// Global logger instance (lazy initialization)
lazy_static::lazy_static! {
    static ref GLOBAL_LOGGER: Mutex<Option<Logger>> = Mutex::new(None);
}

/// Initialize the global logger
pub fn init_logger(log_dir: PathBuf) -> Result<(), String> {
    let config = LoggerConfig {
        log_dir,
        ..Default::default()
    };
    
    let logger = Logger::new(config);
    
    let mut global_logger = GLOBAL_LOGGER.lock()
        .map_err(|_| "Failed to acquire logger lock".to_string())?;
    
    *global_logger = Some(logger);
    
    Ok(())
}

/// Log a message using the global logger
pub fn log(level: LogLevel, message: String, data: Option<serde_json::Value>, context: Option<String>) -> Result<(), String> {
    let entry = LogEntry {
        timestamp: Utc::now().to_rfc3339(),
        level: level.to_string(),
        message,
        data,
        context,
    };
    
    let mut global_logger = GLOBAL_LOGGER.lock()
        .map_err(|_| "Failed to acquire logger lock".to_string())?;
    
    if let Some(ref mut logger) = *global_logger {
        logger.log(&entry)?;
    }
    
    // Also print to console
    match level {
        LogLevel::Trace | LogLevel::Debug => eprintln!("[{}] {}", entry.level, entry.message),
        LogLevel::Info => println!("[{}] {}", entry.level, entry.message),
        LogLevel::Warn => eprintln!("[WARN] {}", entry.message),
        LogLevel::Error => eprintln!("[ERROR] {}", entry.message),
    }
    
    Ok(())
}

/// Convenience macros for logging
#[macro_export]
macro_rules! log_info {
    ($msg:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Info, $msg.to_string(), None, None)
    };
    ($msg:expr, $data:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Info, $msg.to_string(), Some($data), None)
    };
}

#[macro_export]
macro_rules! log_error {
    ($msg:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Error, $msg.to_string(), None, None)
    };
    ($msg:expr, $data:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Error, $msg.to_string(), Some($data), None)
    };
}

#[macro_export]
macro_rules! log_warn {
    ($msg:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Warn, $msg.to_string(), None, None)
    };
    ($msg:expr, $data:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Warn, $msg.to_string(), Some($data), None)
    };
}

#[macro_export]
macro_rules! log_debug {
    ($msg:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Debug, $msg.to_string(), None, None)
    };
    ($msg:expr, $data:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Debug, $msg.to_string(), Some($data), None)
    };
}

/// Tauri command to write a log entry
#[tauri::command]
pub fn write_log(
    level: String,
    message: String,
    data: Option<serde_json::Value>,
    context: Option<String>,
) -> Result<(), String> {
    let log_level = match level.to_lowercase().as_str() {
        "trace" => LogLevel::Trace,
        "debug" => LogLevel::Debug,
        "info" => LogLevel::Info,
        "warn" => LogLevel::Warn,
        "error" => LogLevel::Error,
        _ => return Err(format!("Invalid log level: {}", level)),
    };
    
    log(log_level, message, data, context)
}

/// Tauri command to read logs from a specific date
#[tauri::command]
pub fn read_logs(date: String) -> Result<Vec<LogEntry>, String> {
    let global_logger = GLOBAL_LOGGER.lock()
        .map_err(|_| "Failed to acquire logger lock".to_string())?;
    
    if let Some(ref logger) = *global_logger {
        logger.read_logs(&date)
    } else {
        Err("Logger not initialized".to_string())
    }
}

/// Tauri command to get available log dates
#[tauri::command]
pub fn get_log_dates() -> Result<Vec<String>, String> {
    let global_logger = GLOBAL_LOGGER.lock()
        .map_err(|_| "Failed to acquire logger lock".to_string())?;
    
    if let Some(ref logger) = *global_logger {
        logger.get_available_dates()
    } else {
        Err("Logger not initialized".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    
    #[test]
    fn test_log_level_display() {
        assert_eq!(format!("{}", LogLevel::Trace), "TRACE");
        assert_eq!(format!("{}", LogLevel::Debug), "DEBUG");
        assert_eq!(format!("{}", LogLevel::Info), "INFO");
        assert_eq!(format!("{}", LogLevel::Warn), "WARN");
        assert_eq!(format!("{}", LogLevel::Error), "ERROR");
    }
    
    #[test]
    fn test_logger_creation() {
        let temp_dir = tempdir().unwrap();
        let log_dir = temp_dir.path().to_path_buf();
        
        let config = LoggerConfig {
            log_dir: log_dir.clone(),
            ..Default::default()
        };
        
        let logger = Logger::new(config);
        assert!(logger.current_file.is_some());
        assert!(log_dir.exists());
    }
    
    #[test]
    fn test_write_log_entry() {
        let temp_dir = tempdir().unwrap();
        let log_dir = temp_dir.path().to_path_buf();
        
        let config = LoggerConfig {
            log_dir,
            ..Default::default()
        };
        
        let mut logger = Logger::new(config);
        
        let entry = LogEntry {
            timestamp: Utc::now().to_rfc3339(),
            level: "INFO".to_string(),
            message: "Test message".to_string(),
            data: None,
            context: None,
        };
        
        let result = logger.log(&entry);
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_read_logs() {
        let temp_dir = tempdir().unwrap();
        let log_dir = temp_dir.path().to_path_buf();
        
        let config = LoggerConfig {
            log_dir,
            ..Default::default()
        };
        
        let mut logger = Logger::new(config);
        
        // Write some logs
        for i in 0..5 {
            let entry = LogEntry {
                timestamp: Utc::now().to_rfc3339(),
                level: "INFO".to_string(),
                message: format!("Test message {}", i),
                data: None,
                context: None,
            };
            logger.log(&entry).unwrap();
        }
        
        // Read logs
        let today = Local::now().format("%Y-%m-%d").to_string();
        let logs = logger.read_logs(&today).unwrap();
        
        assert_eq!(logs.len(), 5);
    }
}
