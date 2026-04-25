## ADDED Requirements

### Requirement: Modal dialog provides confirmation and alert interface
The system SHALL display modal dialog overlays for user confirmations, alerts, and information.

#### Scenario: Dialog structure
- **WHEN** a modal dialog is displayed
- **THEN** it SHALL appear centered over the application with:
  - A semi-transparent dark overlay backdrop (clicking closes)
  - A dialog container with rounded corners
  - A title bar area showing the dialog title
  - A body area with the message/content
  - A footer with action buttons (e.g., [取消] [确定])
- **AND** the dialog SHALL appear with scale + fade-in animation (~150ms)

#### Scenario: Confirmation dialog for unsaved file close
- **WHEN** user attempts to close a file or window with unsaved changes
- **THEN** a confirmation dialog SHALL appear with title "未保存的更改"
- **AND** the body SHALL show: "文件 'filename.md' 有未保存的更改。是否要保存？"
- **AND** buttons SHALL be: [不保存] [取消] [保存]

#### Scenario: Delete confirmation dialog
- **WHEN** user initiates a delete action (file/folder deletion)
- **THEN** a confirmation dialog SHALL appear warning about permanent deletion
- **AND** it SHALL require explicit user confirmation before proceeding

### Requirement: Modal supports keyboard interaction
The system SHALL allow full keyboard control of modal dialogs.

#### Scenario: Escape cancels dialog
- **WHEN** a modal dialog is open
- **AND** user presses Escape key
- **THEN** the dialog SHALL close as if "Cancel" was clicked

#### Scenario: Enter confirms primary action
- **WHEN** a modal dialog is open with focus in its content
- **AND** user presses Enter key
- **THEN** the primary/confirm button (typically "确定" or "保存") SHALL be activated

#### Scenario: Tab navigates between buttons
- **WHEN** focus is on a button within the dialog
- **AND** user presses Tab key
- **THEN** focus SHALL move to the next focusable element (cycling through buttons)

#### Scenario: Focus trapped within dialog
- **WHEN** a modal dialog is open
- **THEN** Tab/Shift+Tab focus navigation SHALL be trapped within the dialog
- **AND** focus SHALL NOT escape to elements behind the dialog overlay

### Requirement: Modal overlay click dismisses (configurable)
The system SHALL handle clicking outside the dialog appropriately.

#### Scenario: Click overlay dismisses by default
- **WHEN** the dialog overlay/backdrop is clicked
- **THEN** the dialog SHALL dismiss (cancel action) by default

#### Scenario: Non-dismissible dialogs
- **WHEN** a critical dialog requires explicit user choice (e.g., must save or cancel, no escape)
- **THEN** clicking the overlay SHALL have no effect
- **AND** only the action buttons shall dismiss the dialog
