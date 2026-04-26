## MODIFIED Requirements

### Requirement: Modal supports keyboard interaction
The system SHALL allow full keyboard control of modal dialogs.

#### Scenario: Escape cancels dialog
- **WHEN** a modal dialog is open
- **AND** user presses Escape key
- **THEN** the dialog SHALL close as if "Cancel" was clicked

#### Scenario: Enter confirms primary action
- **WHEN** a modal dialog is open with focus in its content
- **AND** user presses Enter key
- **THEN** the primary/confirm button (typically "确定" or "关闭") SHALL be activated

#### Scenario: Tab navigates between buttons
- **WHEN** focus is on a button within the dialog
- **AND** user presses Tab key
- **THEN** focus SHALL move to the next focusable element (cycling through buttons)

#### Scenario: Shift+Tab navigates backwards
- **WHEN** focus is on a button within the dialog
- **AND** user presses Shift+Tab key
- **THEN** focus SHALL move to the previous focusable element

#### Scenario: Focus trapped within dialog
- **WHEN** a modal dialog is open
- **THEN** Tab/Shift+Tab focus navigation SHALL be trapped within the dialog
- **AND** focus SHALL NOT escape to elements behind the dialog overlay
- **AND** when Tab reaches the last focusable element, focus SHALL wrap to the first
- **AND** when Shift+Tab reaches the first focusable element, focus SHALL wrap to the last

#### Scenario: Focus moves to dialog on open
- **WHEN** a modal dialog is opened
- **THEN** focus SHALL automatically move to the first focusable element within the dialog
- **OR** focus SHALL move to the dialog container itself if no focusable elements exist
