## ADDED Requirements

### Requirement: Opening a recent document from Welcome dialog opens the file
The system SHALL open the corresponding file when user clicks a recent document entry in the Welcome dialog.

#### Scenario: Click recent document entry
- **WHEN** user opens the Welcome dialog
- **AND** the recent documents list shows one or more entries
- **AND** user clicks a recent document entry
- **THEN** the system SHALL read the file content from disk
- **AND** the file SHALL be opened in a new editor tab
- **AND** the Welcome dialog SHALL close
- **AND** the opened file SHALL be moved to the top of the recent documents list

#### Scenario: Recent document file no longer exists
- **WHEN** user clicks a recent document entry
- **AND** the file no longer exists on disk
- **THEN** the system SHALL display an error notification
- **AND** the Welcome dialog SHALL remain open

#### Scenario: Recent document already open in a tab
- **WHEN** user clicks a recent document entry
- **AND** the file is already open in an existing tab
- **THEN** the system SHALL switch to the existing tab
- **AND** SHALL NOT open a duplicate tab
- **AND** the Welcome dialog SHALL close
