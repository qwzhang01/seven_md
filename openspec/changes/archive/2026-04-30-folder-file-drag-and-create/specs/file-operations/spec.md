## ADDED Requirements

### Requirement: File system supports move operation
The system SHALL support moving files and folders to new locations within the workspace via the file system API.

#### Scenario: Move file to a different folder
- **WHEN** a move operation is triggered with a source file path and a target folder path
- **THEN** the system SHALL call the underlying file system rename/move API
- **AND** the file SHALL appear at the new path
- **AND** the file SHALL no longer exist at the original path
- **AND** the workspace file tree SHALL refresh to reflect the change

#### Scenario: Move folder to a different folder
- **WHEN** a move operation is triggered with a source folder path and a target folder path
- **THEN** the system SHALL move the entire folder (including all contents) to the target location
- **AND** the folder and all its contents SHALL appear under the new path
- **AND** the original folder path SHALL no longer exist
- **AND** the workspace file tree SHALL refresh to reflect the change

#### Scenario: Move operation fails gracefully
- **WHEN** a move operation fails (e.g., permission denied, target already exists)
- **THEN** the system SHALL display an error notification to the user
- **AND** the source file/folder SHALL remain at its original location unchanged
- **AND** the workspace file tree SHALL remain consistent with the actual file system state
