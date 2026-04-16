## ADDED Requirements

### Requirement: Context menu appears on right-click of a tree item
The system SHALL display a context menu when the user right-clicks (or long-presses on touch) any file or folder item in the file tree.

#### Scenario: Right-click on a file
- **WHEN** the user right-clicks a file node in the file tree
- **THEN** a context menu appears near the cursor with items: "New File", "New Folder", "Rename", "Delete"

#### Scenario: Right-click on a folder
- **WHEN** the user right-clicks a folder node in the file tree
- **THEN** a context menu appears near the cursor with items: "New File", "New Folder", "Rename", "Delete"

#### Scenario: Context menu closes on outside click
- **WHEN** a context menu is open and the user clicks anywhere outside the menu
- **THEN** the context menu closes without performing any action

#### Scenario: Context menu closes on Escape key
- **WHEN** a context menu is open and the user presses the Escape key
- **THEN** the context menu closes without performing any action

### Requirement: "New File" action creates a file in the correct parent directory
The system SHALL create a new file as a child of the right-clicked node's parent directory (or inside the right-clicked directory if the node is a folder).

#### Scenario: New File from a folder node
- **WHEN** the user selects "New File" from the context menu of a folder node
- **THEN** an inline input row appears inside that folder (folder auto-expands if collapsed) prompting for a filename

#### Scenario: New File from a file node
- **WHEN** the user selects "New File" from the context menu of a file node
- **THEN** an inline input row appears in the same directory as that file, prompting for a filename

### Requirement: "New Folder" action creates a folder in the correct parent directory
The system SHALL create a new folder as a child of the right-clicked node's parent directory (or inside the right-clicked directory if the node is a folder).

#### Scenario: New Folder from a folder node
- **WHEN** the user selects "New Folder" from the context menu of a folder node
- **THEN** an inline input row appears inside that folder prompting for a folder name

#### Scenario: New Folder from a file node
- **WHEN** the user selects "New Folder" from the context menu of a file node
- **THEN** an inline input row appears in the same directory as that file, prompting for a folder name

### Requirement: "Rename" action initiates inline rename of the node
The system SHALL allow the user to rename a file or folder by selecting "Rename" from its context menu.

#### Scenario: Rename action on a file
- **WHEN** the user selects "Rename" from the context menu of a file
- **THEN** the file's name label is replaced by an inline input pre-filled with the current name

#### Scenario: Rename action on a folder
- **WHEN** the user selects "Rename" from the context menu of a folder
- **THEN** the folder's name label is replaced by an inline input pre-filled with the current name

### Requirement: "Delete" action removes the file or folder after confirmation
The system SHALL permanently delete the selected file or folder after the user confirms.

#### Scenario: Delete a file with confirmation
- **WHEN** the user selects "Delete" from the context menu of a file and confirms the prompt
- **THEN** the file is deleted from disk and removed from the file tree

#### Scenario: Delete a folder with confirmation
- **WHEN** the user selects "Delete" from the context menu of a folder and confirms the prompt
- **THEN** the folder and all its contents are deleted from disk and removed from the file tree

#### Scenario: Delete cancelled
- **WHEN** the user selects "Delete" from the context menu and cancels the confirmation prompt
- **THEN** no file or folder is deleted and the tree remains unchanged

#### Scenario: Delete of an open file closes its tab
- **WHEN** the user deletes a file that is currently open in a tab
- **THEN** that tab is closed after deletion (unsaved changes prompt shown first if tab is dirty)
