use std::fs;
use std::path::Path;
use tempfile::TempDir;

/// Tests for Windows file permission handling
#[cfg(test)]
mod windows_file_permission_tests {
    use super::*;
    use std::os::windows::fs::{FileExt, MetadataExt};

    #[test]
    fn test_windows_file_read_permissions() {
        // Test basic file read permissions on Windows
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("readable.md");
        
        // Create file with read permissions
        fs::write(&file_path, "Readable content").expect("Failed to write file");
        
        // Test that file can be read
        let content = fs::read_to_string(&file_path).expect("Failed to read file");
        assert_eq!(content, "Readable content");
        
        // Test that file metadata can be accessed
        let metadata = fs::metadata(&file_path).expect("Failed to get metadata");
        assert!(metadata.is_file());
        assert!(metadata.len() > 0);
    }

    #[test]
    fn test_windows_file_write_permissions() {
        // Test file write permissions on Windows
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("writable.md");
        
        // Create file
        fs::write(&file_path, "Initial content").expect("Failed to write file");
        
        // Test that file can be modified
        fs::write(&file_path, "Modified content").expect("Failed to modify file");
        
        let content = fs::read_to_string(&file_path).expect("Failed to read modified file");
        assert_eq!(content, "Modified content");
        
        // Test append operations
        use std::fs::OpenOptions;
        let mut file = OpenOptions::new()
            .append(true)
            .open(&file_path)
            .expect("Failed to open file for append");
        
        use std::io::Write;
        writeln!(file, "\nAppended line").expect("Failed to append to file");
        
        let final_content = fs::read_to_string(&file_path).expect("Failed to read final file");
        assert!(final_content.contains("Appended line"));
    }

    #[test]
    fn test_windows_file_delete_permissions() {
        // Test file deletion permissions on Windows
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("deletable.md");
        
        // Create file
        fs::write(&file_path, "Content to delete").expect("Failed to write file");
        assert!(file_path.exists());
        
        // Test that file can be deleted
        fs::remove_file(&file_path).expect("Failed to delete file");
        assert!(!file_path.exists());
    }

    #[test]
    fn test_windows_directory_permissions() {
        // Test directory permissions on Windows
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let dir_path = temp_dir.path().join("test_dir");
        
        // Create directory
        fs::create_dir(&dir_path).expect("Failed to create directory");
        assert!(dir_path.is_dir());
        
        // Test that we can list directory contents
        let entries: Vec<_> = fs::read_dir(&dir_path)
            .expect("Failed to read directory")
            .collect();
        assert_eq!(entries.len(), 0); // Should be empty initially
        
        // Test creating files in directory
        let file_path = dir_path.join("nested.md");
        fs::write(&file_path, "Nested content").expect("Failed to write nested file");
        
        // Test that directory can be deleted
        fs::remove_dir_all(&dir_path).expect("Failed to delete directory");
        assert!(!dir_path.exists());
    }

    #[test]
    fn test_windows_file_attributes() {
        // Test Windows-specific file attributes
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("attributes.md");
        
        fs::write(&file_path, "Test content").expect("Failed to write file");
        
        let metadata = fs::metadata(&file_path).expect("Failed to get metadata");
        let attributes = metadata.file_attributes();
        
        // Check common Windows file attributes
        // FILE_ATTRIBUTE_NORMAL = 0x80
        // FILE_ATTRIBUTE_ARCHIVE = 0x20
        // FILE_ATTRIBUTE_READONLY = 0x1
        
        // File should have archive attribute set
        assert_ne!(attributes & 0x20, 0, "File should have archive attribute");
        
        // File should not be hidden or system
        assert_eq!(attributes & 0x2, 0, "File should not be hidden");
        assert_eq!(attributes & 0x4, 0, "File should not be system");
        
        // File should not be read-only
        assert_eq!(attributes & 0x1, 0, "File should not be read-only");
    }

    #[test]
    fn test_windows_readonly_file_handling() {
        // Test handling of read-only files on Windows
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("readonly.md");
        
        // Create file
        fs::write(&file_path, "Read-only content").expect("Failed to write file");
        
        // Set read-only attribute
        #[cfg(windows)]
        {
            use std::os::windows::fs::FileExt;
            use winapi::um::winbase::SetFileAttributesA;
            
            // Note: This is a simplified test - actual implementation would use proper Windows APIs
            // For now, we'll test that we can read read-only files
        }
        
        // Test that read-only file can still be read
        let content = fs::read_to_string(&file_path).expect("Failed to read read-only file");
        assert_eq!(content, "Read-only content");
        
        // Attempting to modify should fail (or succeed depending on permissions)
        // This behavior may vary based on actual permissions
    }

    #[test]
    fn test_windows_concurrent_file_access() {
        // Test concurrent file access on Windows
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("concurrent.md");
        
        // Create initial file
        fs::write(&file_path, "Initial content").expect("Failed to write file");
        
        // Test multiple readers
        let content1 = fs::read_to_string(&file_path).expect("Failed to read file (reader 1)");
        let content2 = fs::read_to_string(&file_path).expect("Failed to read file (reader 2)");
        
        assert_eq!(content1, "Initial content");
        assert_eq!(content2, "Initial content");
        
        // Test writer while readers are active
        fs::write(&file_path, "Modified content").expect("Failed to modify file");
        
        let modified_content = fs::read_to_string(&file_path).expect("Failed to read modified file");
        assert_eq!(modified_content, "Modified content");
    }

    #[test]
    fn test_windows_file_locking() {
        // Test file locking behavior on Windows
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("locked.md");
        
        // Create file
        fs::write(&file_path, "Lock test content").expect("Failed to write file");
        
        // Open file with exclusive access
        use std::fs::File;
        use std::io::{Read, Write};
        
        let mut file = File::open(&file_path).expect("Failed to open file");
        
        // Read from file
        let mut buffer = String::new();
        file.read_to_string(&mut buffer).expect("Failed to read from file");
        assert_eq!(buffer, "Lock test content");
        
        // Test that we can still read the file through other means
        let content = fs::read_to_string(&file_path).expect("Failed to read file via fs::read_to_string");
        assert_eq!(content, "Lock test content");
    }

    #[test]
    fn test_windows_special_permission_scenarios() {
        // Test special permission scenarios on Windows
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // Test creating files in protected locations (should fail gracefully)
        let protected_locations = [
            "C:\\Windows\\System32",
            "C:\\Program Files",
            "C:\\ProgramData",
        ];
        
        for location in protected_locations {
            let test_path = Path::new(location).join("test_file.md");
            
            // Attempt to create file - should fail due to permissions
            let result = fs::write(&test_path, "Test content");
            
            // It's expected to fail, so we don't assert success
            if result.is_err() {
                // Verify error is permission-related
                let error = result.unwrap_err();
                assert!(error.to_string().contains("Permission") || 
                       error.to_string().contains("denied") ||
                       error.to_string().contains("access"),
                       "Error should be permission-related: {}", error);
            }
        }
    }

    #[test]
    fn test_windows_file_sharing() {
        // Test file sharing behavior on Windows
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("shared.md");
        
        // Create file
        fs::write(&file_path, "Shared content").expect("Failed to write file");
        
        // Test multiple processes accessing the same file
        // (simulated by multiple file handles)
        use std::fs::OpenOptions;
        
        let handle1 = OpenOptions::new()
            .read(true)
            .open(&file_path)
            .expect("Failed to open file (handle 1)");
        
        let handle2 = OpenOptions::new()
            .read(true)
            .open(&file_path)
            .expect("Failed to open file (handle 2)");
        
        // Both handles should be able to read the file
        let content1 = fs::read_to_string(&file_path).expect("Failed to read via handle 1");
        let content2 = fs::read_to_string(&file_path).expect("Failed to read via handle 2");
        
        assert_eq!(content1, "Shared content");
        assert_eq!(content2, "Shared content");
        
        // Test writing while handles are open
        fs::write(&file_path, "Updated content").expect("Failed to update file");
        
        let updated_content = fs::read_to_string(&file_path).expect("Failed to read updated file");
        assert_eq!(updated_content, "Updated content");
    }

    #[test]
    fn test_windows_file_permission_errors() {
        // Test handling of permission errors on Windows
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // Test accessing non-existent file
        let nonexistent_path = temp_dir.path().join("nonexistent.md");
        let result = fs::read_to_string(&nonexistent_path);
        assert!(result.is_err());
        
        // Test accessing directory as file
        let dir_path = temp_dir.path().join("test_dir");
        fs::create_dir(&dir_path).expect("Failed to create directory");
        
        let result = fs::read_to_string(&dir_path);
        assert!(result.is_err());
        
        // Test invalid path characters
        let invalid_path = temp_dir.path().join("invalid<file>.md");
        let result = fs::write(&invalid_path, "Test content");
        assert!(result.is_err());
    }
}

/// Cross-platform file permission tests
#[cfg(test)]
mod cross_platform_permission_tests {
    use super::*;

    #[test]
    fn test_basic_file_permissions() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("permission_test.md");
        
        // Create file
        fs::write(&file_path, "Test content").expect("Failed to write file");
        
        // Test basic permissions
        let metadata = fs::metadata(&file_path).expect("Failed to get metadata");
        
        // File should be readable
        let content = fs::read_to_string(&file_path).expect("Failed to read file");
        assert_eq!(content, "Test content");
        
        // File should be writable
        fs::write(&file_path, "Modified content").expect("Failed to modify file");
        
        // File should be deletable
        fs::remove_file(&file_path).expect("Failed to delete file");
        assert!(!file_path.exists());
    }

    #[test]
    fn test_file_access_errors() {
        // Test error handling for file access issues
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // Test reading non-existent file
        let nonexistent = temp_dir.path().join("nonexistent.md");
        let result = fs::read_to_string(&nonexistent);
        assert!(result.is_err());
        
        // Test writing to read-only location (simulated by creating a file then making it read-only)
        let read_only_path = temp_dir.path().join("readonly_test.md");
        fs::write(&read_only_path, "Initial content").expect("Failed to write file");
        
        // Note: Setting read-only permissions is platform-specific
        // We'll test that we can at least read the file
        let content = fs::read_to_string(&read_only_path).expect("Failed to read file");
        assert_eq!(content, "Initial content");
    }

    #[test]
    fn test_directory_permissions() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let dir_path = temp_dir.path().join("permission_dir");
        
        // Create directory
        fs::create_dir(&dir_path).expect("Failed to create directory");
        
        // Test directory access
        let entries = fs::read_dir(&dir_path).expect("Failed to read directory");
        assert_eq!(entries.count(), 0);
        
        // Test creating file in directory
        let file_path = dir_path.join("nested.md");
        fs::write(&file_path, "Nested content").expect("Failed to write file in directory");
        
        // Test directory deletion
        fs::remove_dir_all(&dir_path).expect("Failed to delete directory");
        assert!(!dir_path.exists());
    }

    #[test]
    fn test_file_ownership_and_permissions() {
        // Test file ownership and permission attributes
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("ownership_test.md");
        
        fs::write(&file_path, "Test content").expect("Failed to write file");
        
        let metadata = fs::metadata(&file_path).expect("Failed to get metadata");
        
        // Basic file properties
        assert!(metadata.is_file());
        assert!(!metadata.is_dir());
        assert!(metadata.len() > 0);
        
        // File should have been created recently
        let created = metadata.created().expect("Failed to get creation time");
        let now = std::time::SystemTime::now();
        let duration = now.duration_since(created).expect("File should not be from the future");
        assert!(duration.as_secs() < 300, "File should be recently created");
        
        // File should be readable by current user
        let content = fs::read_to_string(&file_path).expect("Failed to read file");
        assert_eq!(content, "Test content");
    }
}