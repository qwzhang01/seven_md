## ADDED Requirements

### Requirement: Application supports global keyboard shortcuts
The system SHALL provide keyboard shortcuts for common operations following platform conventions.

#### Scenario: Shortcuts use platform-appropriate modifier keys
- **WHEN** the application detects the operating system
- **THEN** keyboard shortcuts SHALL use:
  - Cmd (⌘) modifier on macOS
  - Ctrl modifier on Windows and Linux

### Requirement: File operation shortcuts work globally
The system SHALL provide keyboard shortcuts for file operations that work regardless of focus.

#### Scenario: Cmd/Ctrl+O opens file
- **WHEN** user presses Cmd+O (macOS) or Ctrl+O (Windows/Linux)
- **THEN** the system SHALL display the Open File dialog

#### Scenario: Cmd/Ctrl+Shift+O opens folder
- **WHEN** user presses Cmd+Shift+O (macOS) or Ctrl+Shift+O (Windows/Linux)
- **THEN** the system SHALL display the Open Folder dialog

#### Scenario: Cmd/Ctrl+S saves file
- **WHEN** user presses Cmd+S (macOS) or Ctrl+S (Windows/Linux)
- **AND** a file is currently open
- **THEN** the system SHALL save the current content to the file

#### Scenario: Cmd/Ctrl+N creates new file
- **WHEN** user presses Cmd+N (macOS) or Ctrl+N (Windows/Linux)
- **THEN** the system SHALL create a new untitled file

#### Scenario: Cmd/Ctrl+Shift+S saves as
- **WHEN** user presses Cmd+Shift+S (macOS) or Ctrl+Shift+S (Windows/Linux)
- **THEN** the system SHALL display the Save As dialog

### Requirement: Edit operation shortcuts work in editor
The system SHALL provide keyboard shortcuts for editing operations when the editor has focus.

#### Scenario: Cmd/Ctrl+Z undoes last action
- **WHEN** user presses Cmd+Z (macOS) or Ctrl+Z (Windows/Linux)
- **AND** the editor has focus
- **THEN** the system SHALL undo the last editing action

#### Scenario: Cmd/Ctrl+Shift+Z redoes last action
- **WHEN** user presses Cmd+Shift+Z (macOS) or Ctrl+Shift+Z (Windows/Linux)
- **AND** the editor has focus
- **THEN** the system SHALL redo the last undone action

#### Scenario: Cmd/Ctrl+F opens find
- **WHEN** user presses Cmd+F (macOS) or Ctrl+F (Windows/Linux)
- **THEN** the system SHALL open the Find panel in the editor

#### Scenario: Cmd/Ctrl+H opens replace
- **WHEN** user presses Cmd+H (macOS) or Ctrl+H (Windows/Linux)
- **THEN** the system SHALL open the Find and Replace panel in the editor

### Requirement: View operation shortcuts toggle UI elements
The system SHALL provide keyboard shortcuts for view operations.

#### Scenario: Cmd/Ctrl+B toggles sidebar
- **WHEN** user presses Cmd+B (macOS) or Ctrl+B (Windows/Linux)
- **THEN** the system SHALL toggle the sidebar visibility

#### Scenario: Cmd/Ctrl+P toggles preview
- **WHEN** user presses Cmd+P (macOS) or Ctrl+P (Windows/Linux)
- **THEN** the system SHALL toggle the preview pane visibility

#### Scenario: Cmd/Ctrl++ zooms in
- **WHEN** user presses Cmd++ (macOS) or Ctrl++ (Windows/Linux)
- **THEN** the system SHALL increase the editor font size by 2px

#### Scenario: Cmd/Ctrl+- zooms out
- **WHEN** user presses Cmd+- (macOS) or Ctrl+- (Windows/Linux)
- **THEN** the system SHALL decrease the editor font size by 2px

#### Scenario: Cmd/Ctrl+0 resets zoom
- **WHEN** user presses Cmd+0 (macOS) or Ctrl+0 (Windows/Linux)
- **THEN** the system SHALL reset the editor font size to default (14px)

#### Scenario: F11 toggles full screen (Windows/Linux)
- **WHEN** user presses F11 on Windows or Linux
- **THEN** the system SHALL toggle full screen mode

#### Scenario: Cmd+Ctrl+F toggles full screen (macOS)
- **WHEN** user presses Cmd+Ctrl+F on macOS
- **THEN** the system SHALL toggle full screen mode

### Requirement: Shortcuts do not conflict with editor
The system SHALL ensure global shortcuts do not interfere with CodeMirror's built-in shortcuts.

#### Scenario: Editor shortcuts take precedence in editor
- **WHEN** the editor has focus
- **AND** a shortcut conflicts between global and editor
- **THEN** the editor shortcut SHALL take precedence

#### Scenario: Global shortcuts work outside editor
- **WHEN** an element other than the editor has focus
- **THEN** global shortcuts SHALL function normally

### Requirement: Shortcuts are discoverable
The system SHALL make keyboard shortcuts discoverable through the UI.

#### Scenario: Menu items show shortcuts
- **WHEN** a menu is open
- **THEN** each menu item with a shortcut SHALL display the shortcut on the right side

#### Scenario: Keyboard shortcuts help is accessible
- **WHEN** user opens Help menu and clicks "Keyboard Shortcuts"
- **THEN** the system SHALL display a comprehensive list of all shortcuts
