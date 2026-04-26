## ADDED Requirements

### Requirement: File menu includes recent documents submenu
The system SHALL provide a Recent Documents submenu in the File menu for quick access to recently opened files.

#### Scenario: Recent Documents submenu in File menu
- **WHEN** user clicks the File menu
- **THEN** a "Recent Documents" submenu SHALL appear before the "Close Folder" item
- **AND** the submenu SHALL display up to 10 most recently opened files
- **AND** each file entry SHALL show the file name and path
- **AND** a separator SHALL appear above "Clear Menu" option

#### Scenario: Recent Documents submenu displays file entries
- **WHEN** the Recent Documents submenu is opened
- **AND** files have been opened previously
- **THEN** the most recently opened file SHALL appear at the top
- **AND** subsequent files SHALL be listed in reverse chronological order
- **AND** each entry SHALL be clickable to open the file

#### Scenario: Clear Recent Documents
- **WHEN** user selects "Clear Menu" from the Recent Documents submenu
- **THEN** all recent document entries SHALL be removed
- **AND** the Recent Documents submenu SHALL show only "Clear Menu" option

#### Scenario: Opening file from Recent Documents
- **WHEN** user clicks a file entry in the Recent Documents submenu
- **THEN** the corresponding file SHALL be opened
- **AND** the file SHALL be added to the top of the recent list

### Requirement: Recent documents persist across sessions
The system SHALL store the recent documents list in persistent storage.

#### Scenario: Recent documents persist after restart
- **WHEN** the application is restarted
- **THEN** the previously opened files SHALL still appear in the Recent Documents submenu
- **AND** the list SHALL contain up to 10 files

#### Scenario: Recent documents storage location
- **WHEN** the application saves recent documents
- **THEN** the data SHALL be stored in the application data directory
- **AND** the format SHALL be JSON with file paths
