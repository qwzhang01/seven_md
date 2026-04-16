use std::fs;
use std::path::Path;
use tempfile::TempDir;

/// Tests for Windows-specific file system compatibility
#[cfg(test)]
mod windows_filesystem_tests {
    use super::*;
    use std::os::windows::fs::MetadataExt;

    #[test]
    fn test_windows_path_separators() {
        // Test that paths with Windows separators work correctly
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // Create a path with Windows-style separators
        let windows_path = temp_dir.path().join("folder\\subfolder\\file.md");
        
        // Ensure parent directories exist
        if let Some(parent) = windows_path.parent() {
            fs::create_dir_all(parent).expect("Failed to create parent directories");
        }
        
        // Create file with Windows path
        fs::write(&windows_path, "Test content").expect("Failed to write file");
        
        // Verify file exists and can be read
        assert!(windows_path.exists());
        let content = fs::read_to_string(&windows_path).expect("Failed to read file");
        assert_eq!(content, "Test content");
    }

    #[test]
    fn test_windows_special_characters_in_paths() {
        // Test paths with Windows special characters
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // Test various special characters that are allowed on Windows
        let special_paths = [
            "file with spaces.md",
            "file-with-dashes.md",
            "file_with_underscores.md",
            "file(1).md",
            "file[test].md",
            "file%20encoded.md",
            "file@test.md",
            "file#test.md",
            "file$test.md",
            "file&test.md",
            "file'test.md",
            "file+test.md",
            "file,test.md",
            "file;test.md",
            "file=test.md",
        ];
        
        for filename in special_paths {
            let file_path = temp_dir.path().join(filename);
            
            // Create and write file
            fs::write(&file_path, "Test content").expect("Failed to write file");
            
            // Verify file exists and can be read
            assert!(file_path.exists(), "File should exist: {:?}", file_path);
            let content = fs::read_to_string(&file_path).expect("Failed to read file");
            assert_eq!(content, "Test content");
            
            // Clean up for next test
            fs::remove_file(&file_path).expect("Failed to remove file");
        }
    }

    #[test]
    fn test_windows_file_permissions() {
        // Test Windows file permission handling
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("permission_test.md");
        
        // Create file
        fs::write(&file_path, "Test content").expect("Failed to write file");
        
        // Check file attributes (Windows-specific)
        let metadata = fs::metadata(&file_path).expect("Failed to get metadata");
        let attributes = metadata.file_attributes();
        
        // Verify file is not hidden or system file
        assert_eq!(attributes & 0x2, 0, "File should not be hidden"); // FILE_ATTRIBUTE_HIDDEN
        assert_eq!(attributes & 0x4, 0, "File should not be system"); // FILE_ATTRIBUTE_SYSTEM
        
        // File should be normal and archive
        assert_ne!(attributes & 0x80, 0, "File should have archive attribute"); // FILE_ATTRIBUTE_ARCHIVE
    }

    #[test]
    fn test_windows_long_paths() {
        // Test handling of long paths (Windows has 260 character limit by default)
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // Create a moderately long path (within normal limits)
        let long_folder_name = "a".repeat(50);
        let long_file_name = "b".repeat(50) + ".md";
        
        let long_path = temp_dir.path()
            .join(&long_folder_name)
            .join(&long_file_name);
        
        // Ensure parent directory exists
        if let Some(parent) = long_path.parent() {
            fs::create_dir_all(parent).expect("Failed to create parent directories");
        }
        
        // Create file with long path
        fs::write(&long_path, "Test content").expect("Failed to write file");
        
        // Verify file exists and can be read
        assert!(long_path.exists());
        let content = fs::read_to_string(&long_path).expect("Failed to read file");
        assert_eq!(content, "Test content");
    }

    #[test]
    fn test_windows_case_insensitive_paths() {
        // Test Windows case-insensitive file system behavior
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // Create file with lowercase name
        let lowercase_path = temp_dir.path().join("testfile.md");
        fs::write(&lowercase_path, "Test content").expect("Failed to write file");
        
        // Try to access with different case variations
        let variations = [
            "TESTFILE.md",
            "TestFile.md",
            "testFile.md",
            "TESTfile.md",
        ];
        
        for variation in variations {
            let variant_path = temp_dir.path().join(variation);
            
            // On Windows, these should all refer to the same file
            assert!(variant_path.exists(), "Variant should exist: {}", variation);
            
            // All variants should have the same content
            let content = fs::read_to_string(&variant_path).expect("Failed to read file");
            assert_eq!(content, "Test content");
        }
    }

    #[test]
    fn test_windows_reserved_names() {
        // Test handling of Windows reserved names
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // These are Windows reserved names that should be avoided
        let reserved_names = [
            "CON", "PRN", "AUX", "NUL",
            "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
            "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
        ];
        
        for reserved_name in reserved_names {
            let file_path = temp_dir.path().join(format!("{}.md", reserved_name));
            
            // Attempt to create file with reserved name
            // This should work on modern Windows with proper handling
            let result = fs::write(&file_path, "Test content");
            
            // On some systems this might fail, but modern Windows often allows it
            if result.is_ok() {
                // If creation succeeded, verify the file
                assert!(file_path.exists());
                let content = fs::read_to_string(&file_path).expect("Failed to read file");
                assert_eq!(content, "Test content");
                
                // Clean up
                fs::remove_file(&file_path).expect("Failed to remove file");
            }
        }
    }

    #[test]
    fn test_windows_unicode_paths() {
        // Test Unicode characters in file paths (Windows supports UTF-16)
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        let unicode_names = [
            "文件.md",           // Chinese
            "ドキュメント.md",   // Japanese
            "파일.md",          // Korean
            "файл.md",          // Russian
            "ملف.md",           // Arabic
            "📄文档.md",         // Emoji + Chinese
            "test-αβγ.md",      // Greek
            "file-ñño.md",      // Spanish characters
        ];
        
        for unicode_name in unicode_names {
            let file_path = temp_dir.path().join(unicode_name);
            
            // Create file with Unicode name
            fs::write(&file_path, "Test content").expect("Failed to write file");
            
            // Verify file exists and can be read
            assert!(file_path.exists(), "Unicode file should exist: {}", unicode_name);
            let content = fs::read_to_string(&file_path).expect("Failed to read file");
            assert_eq!(content, "Test content");
            
            // Clean up for next test
            fs::remove_file(&file_path).expect("Failed to remove file");
        }
    }

    #[test]
    fn test_windows_special_folders() {
        // Test access to Windows special folders
        // Note: These tests are informational and may not work in all environments
        
        // Test common Windows environment variables
        let env_vars = [
            "USERPROFILE",
            "APPDATA",
            "LOCALAPPDATA",
            "TEMP",
            "TMP",
        ];
        
        for env_var in env_vars {
            if let Ok(path) = std::env::var(env_var) {
                let path_buf = Path::new(&path);
                
                // Verify the path exists and is a directory
                assert!(path_buf.exists(), "{} should exist: {}", env_var, path);
                assert!(path_buf.is_dir(), "{} should be a directory: {}", env_var, path);
                
                // Test that we can list contents (at least try)
                let _ = fs::read_dir(path_buf).expect("Should be able to read directory");
            }
        }
    }

    #[test]
    fn test_windows_file_operations_integration() {
        // Comprehensive test of file operations on Windows
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // Test file creation
        let file_path = temp_dir.path().join("test.md");
        fs::write(&file_path, "Initial content").expect("Failed to create file");
        
        // Test file reading
        let content = fs::read_to_string(&file_path).expect("Failed to read file");
        assert_eq!(content, "Initial content");
        
        // Test file modification
        fs::write(&file_path, "Modified content").expect("Failed to modify file");
        let modified_content = fs::read_to_string(&file_path).expect("Failed to read modified file");
        assert_eq!(modified_content, "Modified content");
        
        // Test file deletion
        fs::remove_file(&file_path).expect("Failed to delete file");
        assert!(!file_path.exists(), "File should be deleted");
        
        // Test directory operations
        let dir_path = temp_dir.path().join("subdir");
        fs::create_dir(&dir_path).expect("Failed to create directory");
        assert!(dir_path.is_dir(), "Directory should exist");
        
        // Test file in subdirectory
        let sub_file_path = dir_path.join("nested.md");
        fs::write(&sub_file_path, "Nested content").expect("Failed to create nested file");
        
        // Test directory removal
        fs::remove_dir_all(&dir_path).expect("Failed to remove directory");
        assert!(!dir_path.exists(), "Directory should be deleted");
    }

    #[test]
    fn test_windows_path_normalization() {
        // Test path normalization for Windows
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        
        // Test mixed separators
        let mixed_path = temp_dir.path().join("folder/subfolder\\file.md");
        
        // Ensure parent directories exist
        if let Some(parent) = mixed_path.parent() {
            fs::create_dir_all(parent).expect("Failed to create parent directories");
        }
        
        // Create file with mixed separators
        fs::write(&mixed_path, "Test content").expect("Failed to write file");
        
        // Verify file exists and can be read
        assert!(mixed_path.exists());
        let content = fs::read_to_string(&mixed_path).expect("Failed to read file");
        assert_eq!(content, "Test content");
        
        // Test that the path is properly normalized when used
        let canonical_path = mixed_path.canonicalize().expect("Failed to canonicalize path");
        assert!(canonical_path.exists());
    }
}

/// Platform-agnostic file system tests that should work on both Windows and Unix
#[cfg(test)]
mod cross_platform_filesystem_tests {
    use super::*;

    #[test]
    fn test_basic_file_operations() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("test.md");
        
        // Create file
        fs::write(&file_path, "Hello, World!").expect("Failed to write file");
        
        // Read file
        let content = fs::read_to_string(&file_path).expect("Failed to read file");
        assert_eq!(content, "Hello, World!");
        
        // Modify file
        fs::write(&file_path, "Modified content").expect("Failed to modify file");
        let modified_content = fs::read_to_string(&file_path).expect("Failed to read modified file");
        assert_eq!(modified_content, "Modified content");
        
        // Delete file
        fs::remove_file(&file_path).expect("Failed to delete file");
        assert!(!file_path.exists());
    }

    #[test]
    fn test_directory_operations() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let dir_path = temp_dir.path().join("test_dir");
        
        // Create directory
        fs::create_dir(&dir_path).expect("Failed to create directory");
        assert!(dir_path.is_dir());
        
        // Create file in directory
        let file_path = dir_path.join("file.md");
        fs::write(&file_path, "Test content").expect("Failed to write file");
        
        // List directory contents
        let entries: Vec<_> = fs::read_dir(&dir_path)
            .expect("Failed to read directory")
            .map(|entry| entry.expect("Failed to read entry").file_name())
            .collect();
        
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].to_string_lossy(), "file.md");
        
        // Delete directory recursively
        fs::remove_dir_all(&dir_path).expect("Failed to remove directory");
        assert!(!dir_path.exists());
    }

    #[test]
    fn test_file_metadata() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("metadata_test.md");
        
        fs::write(&file_path, "Test content").expect("Failed to write file");
        
        let metadata = fs::metadata(&file_path).expect("Failed to get metadata");
        
        assert!(metadata.is_file());
        assert!(!metadata.is_dir());
        assert!(metadata.len() > 0);
        
        // Check that modification time is reasonable (within last few minutes)
        let modified = metadata.modified().expect("Failed to get modification time");
        let now = std::time::SystemTime::now();
        let duration = now.duration_since(modified).expect("File should not be from the future");
        assert!(duration.as_secs() < 300, "File should be recently created");
    }

    #[test]
    fn test_file_permissions() {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let file_path = temp_dir.path().join("permission_test.md");
        
        fs::write(&file_path, "Test content").expect("Failed to write file");
        
        let metadata = fs::metadata(&file_path).expect("Failed to get metadata");
        let permissions = metadata.permissions();
        
        // Basic permission checks (platform-specific behavior may vary)
        // On Windows, files are typically readable and writable
        // On Unix, we can check more specific permissions
        
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mode = permissions.mode();
            // File should be readable and writable by owner
            assert!(mode & 0o600 == 0o600, "File should be readable and writable by owner");
        }
    }
}