## ADDED Requirements

### Requirement: create_file command creates a new empty file
The system SHALL expose a `create_file` Tauri command that creates a new empty file at the specified path.

#### Scenario: Successful file creation
- **WHEN** `create_file` is called with a valid path in an existing directory
- **THEN** an empty file is created at that path and the command returns `Ok(())`

#### Scenario: File already exists
- **WHEN** `create_file` is called with a path that already exists
- **THEN** the command returns an `Err` with message "File already exists: <path>"

#### Scenario: Parent directory does not exist
- **WHEN** `create_file` is called with a path whose parent directory does not exist
- **THEN** the command returns an `Err` with message "Parent directory does not exist: <path>"

### Requirement: create_directory command creates a new directory
The system SHALL expose a `create_directory` Tauri command that creates a new directory at the specified path.

#### Scenario: Successful directory creation
- **WHEN** `create_directory` is called with a valid path in an existing parent directory
- **THEN** a new directory is created at that path and the command returns `Ok(())`

#### Scenario: Directory already exists
- **WHEN** `create_directory` is called with a path that already exists
- **THEN** the command returns an `Err` with message "Directory already exists: <path>"

### Requirement: rename_path command renames a file or folder
The system SHALL expose a `rename_path` Tauri command that renames (moves) a file or folder from an old path to a new path.

#### Scenario: Successful rename of a file
- **WHEN** `rename_path` is called with an existing file path and a new name in the same directory
- **THEN** the file is renamed and the command returns `Ok(())`

#### Scenario: Successful rename of a folder
- **WHEN** `rename_path` is called with an existing folder path and a new name in the same directory
- **THEN** the folder is renamed and the command returns `Ok(())`

#### Scenario: Source path does not exist
- **WHEN** `rename_path` is called with a source path that does not exist
- **THEN** the command returns an `Err` with message "Source path does not exist: <path>"

#### Scenario: Destination path already exists
- **WHEN** `rename_path` is called with a destination path that already exists
- **THEN** the command returns an `Err` with message "Destination already exists: <path>"

### Requirement: delete_path command deletes a file or folder
The system SHALL expose a `delete_path` Tauri command that permanently deletes a file or recursively deletes a folder.

#### Scenario: Successful file deletion
- **WHEN** `delete_path` is called with an existing file path
- **THEN** the file is deleted and the command returns `Ok(())`

#### Scenario: Successful folder deletion
- **WHEN** `delete_path` is called with an existing folder path
- **THEN** the folder and all its contents are recursively deleted and the command returns `Ok(())`

#### Scenario: Path does not exist
- **WHEN** `delete_path` is called with a path that does not exist
- **THEN** the command returns an `Err` with message "Path does not exist: <path>"

### Requirement: All mutation commands are logged
The system SHALL log all `create_file`, `create_directory`, `rename_path`, and `delete_path` invocations and their outcomes using the existing `crate::logger` infrastructure.

#### Scenario: Successful operation is logged at Info level
- **WHEN** any mutation command completes successfully
- **THEN** a log entry at `Info` level is written with the operation name and affected path(s)

#### Scenario: Failed operation is logged at Error level
- **WHEN** any mutation command returns an error
- **THEN** a log entry at `Error` level is written with the operation name, affected path(s), and error message
