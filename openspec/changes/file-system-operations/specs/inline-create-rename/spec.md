## ADDED Requirements

### Requirement: Inline input row appears for new file creation
The system SHALL render a temporary editable input row in the file tree at the correct location when the user initiates a "New File" action.

#### Scenario: Input row appears with empty value
- **WHEN** the user selects "New File" from the context menu
- **THEN** an inline `<input>` element appears in the tree at the target location with an empty value and keyboard focus

#### Scenario: Confirm new file with Enter key
- **WHEN** the user types a filename in the inline input and presses Enter
- **THEN** the system calls `create_file` with the full path (parent directory + typed name), the input row disappears, and the new file appears in the tree

#### Scenario: New file with no extension gets .md appended
- **WHEN** the user types a filename without an extension and presses Enter
- **THEN** the system appends `.md` to the filename before creating the file

#### Scenario: Cancel new file with Escape key
- **WHEN** the user presses Escape while the inline input is focused
- **THEN** the input row disappears and no file is created

#### Scenario: Empty filename is rejected
- **WHEN** the user presses Enter with an empty or whitespace-only filename
- **THEN** the system shows an inline validation error and does not create the file

#### Scenario: Duplicate filename is rejected
- **WHEN** the user types a filename that already exists in the target directory and presses Enter
- **THEN** the system shows an inline error "A file with this name already exists" and does not create the file

### Requirement: Inline input row appears for new folder creation
The system SHALL render a temporary editable input row in the file tree at the correct location when the user initiates a "New Folder" action.

#### Scenario: Input row appears with empty value
- **WHEN** the user selects "New Folder" from the context menu
- **THEN** an inline `<input>` element appears in the tree at the target location with an empty value and keyboard focus

#### Scenario: Confirm new folder with Enter key
- **WHEN** the user types a folder name in the inline input and presses Enter
- **THEN** the system calls `create_directory` with the full path, the input row disappears, and the new folder appears in the tree

#### Scenario: Cancel new folder with Escape key
- **WHEN** the user presses Escape while the inline input is focused
- **THEN** the input row disappears and no folder is created

### Requirement: Inline input row appears for rename
The system SHALL replace the name label of a file or folder with an editable input pre-filled with the current name when the user initiates a "Rename" action.

#### Scenario: Input pre-filled with current name
- **WHEN** the user selects "Rename" from the context menu
- **THEN** the name label is replaced by an `<input>` pre-filled with the current name, with the text selected

#### Scenario: Confirm rename with Enter key
- **WHEN** the user edits the name and presses Enter
- **THEN** the system calls `rename_path` with the old and new full paths, the input is replaced by the new name label

#### Scenario: Rename of open file updates tab path
- **WHEN** the user renames a file that is currently open in a tab and confirms
- **THEN** the tab's path is updated to the new path and the tab title reflects the new name

#### Scenario: Cancel rename with Escape key
- **WHEN** the user presses Escape while the rename input is focused
- **THEN** the input is replaced by the original name label and no rename occurs

#### Scenario: Rename to existing name is rejected
- **WHEN** the user types a name that already exists in the same directory and presses Enter
- **THEN** the system shows an inline error "A file or folder with this name already exists" and does not rename
