## ADDED Requirements

### Requirement: Menu bar displays standard desktop menus
The system SHALL display a menu bar containing File, Edit, View, and Help menus in a standard desktop application layout.

#### Scenario: Menu bar is visible on application launch
- **WHEN** the application starts
- **THEN** the menu bar SHALL be displayed below the window title area
- **AND** the menu bar SHALL show File, Edit, View, and Help menus

#### Scenario: Menu items follow platform conventions
- **WHEN** the menu bar is displayed
- **THEN** each menu SHALL have a text label
- **AND** the first letter of each menu SHALL be underlined for keyboard navigation (Alt+F for File, etc.)

### Requirement: File menu provides file operations
The system SHALL provide a File menu with operations for creating, opening, saving, and managing files.

#### Scenario: File menu displays standard file operations
- **WHEN** user clicks on the File menu
- **THEN** the menu SHALL display the following items in order:
  - New File (Cmd/Ctrl+N)
  - Open File (Cmd/Ctrl+O)
  - Open Folder (Cmd/Ctrl+Shift+O)
  - Separator
  - Save (Cmd/Ctrl+S)
  - Save As (Cmd/Ctrl+Shift+S)
  - Separator
  - Recent Files (submenu)
  - Separator
  - Exit (Windows/Linux) or Close (macOS, Cmd+W)

#### Scenario: Open File shows file picker dialog
- **WHEN** user clicks "Open File" from File menu
- **THEN** the system SHALL display a native file picker dialog
- **AND** the dialog SHALL filter for Markdown files (*.md, *.markdown, *.txt)

#### Scenario: Open Folder shows folder picker dialog
- **WHEN** user clicks "Open Folder" from File menu
- **THEN** the system SHALL display a native folder picker dialog
- **AND** the selected folder SHALL populate the sidebar

#### Scenario: Save writes current content to file
- **WHEN** user clicks "Save" from File menu and a file is currently open
- **THEN** the system SHALL save the current editor content to the file
- **AND** show a success notification

#### Scenario: Save As creates new file
- **WHEN** user clicks "Save As" from File menu
- **THEN** the system SHALL display a save file dialog
- **AND** allow user to specify a new file name and location

### Requirement: Edit menu provides editing operations
The system SHALL provide an Edit menu with operations for editing content.

#### Scenario: Edit menu displays standard editing operations
- **WHEN** user clicks on the Edit menu
- **THEN** the menu SHALL display the following items:
  - Undo (Cmd/Ctrl+Z)
  - Redo (Cmd/Ctrl+Shift+Z)
  - Separator
  - Cut (Cmd/Ctrl+X)
  - Copy (Cmd/Ctrl+C)
  - Paste (Cmd/Ctrl+V)
  - Select All (Cmd/Ctrl+A)
  - Separator
  - Find (Cmd/Ctrl+F)
  - Replace (Cmd/Ctrl+H)

#### Scenario: Undo reverses last action
- **WHEN** user clicks "Undo" from Edit menu
- **THEN** the system SHALL reverse the last editing action in the editor

#### Scenario: Find opens search panel
- **WHEN** user clicks "Find" from Edit menu
- **THEN** the system SHALL open a search panel in the editor
- **AND** focus SHALL be on the search input field

### Requirement: View menu provides display controls
The system SHALL provide a View menu with operations for controlling the application display.

#### Scenario: View menu displays display control options
- **WHEN** user clicks on the View menu
- **THEN** the menu SHALL display the following items:
  - Toggle Sidebar (Cmd/Ctrl+B)
  - Toggle Preview (Cmd/Ctrl+P)
  - Separator
  - Zoom In (Cmd/Ctrl++)
  - Zoom Out (Cmd/Ctrl+-)
  - Reset Zoom (Cmd/Ctrl+0)
  - Separator
  - Full Screen (F11 on Windows/Linux, Cmd+Ctrl+F on macOS)

#### Scenario: Toggle Sidebar shows/hides sidebar
- **WHEN** user clicks "Toggle Sidebar" from View menu
- **THEN** the sidebar SHALL be shown if currently hidden
- **OR** the sidebar SHALL be hidden if currently shown

#### Scenario: Zoom In increases editor font size
- **WHEN** user clicks "Zoom In" from View menu
- **THEN** the editor font size SHALL increase by 2px
- **AND** the new font size SHALL be persisted

### Requirement: Help menu provides application information
The system SHALL provide a Help menu with information about the application.

#### Scenario: Help menu displays help options
- **WHEN** user clicks on the Help menu
- **THEN** the menu SHALL display the following items:
  - Keyboard Shortcuts
  - Separator
  - About Seven MD

#### Scenario: About shows application information
- **WHEN** user clicks "About Seven MD" from Help menu
- **THEN** the system SHALL display a modal with application information including:
  - Application name and version
  - License information
  - Links to documentation and repository

### Requirement: Menus support keyboard navigation
The system SHALL allow users to navigate menus using keyboard shortcuts.

#### Scenario: Alt key activates menu bar
- **WHEN** user presses the Alt key
- **THEN** focus SHALL move to the first menu item (File)
- **AND** the menu label SHALL be highlighted

#### Scenario: Arrow keys navigate between menus
- **WHEN** menu bar has focus and user presses Left/Right arrow keys
- **THEN** focus SHALL move to the previous/next menu

#### Scenario: Enter key opens menu
- **WHEN** a menu has focus and user presses Enter
- **THEN** the menu SHALL open and display its items

#### Scenario: Escape key closes menu
- **WHEN** a menu is open and user presses Escape
- **THEN** the menu SHALL close
- **AND** focus SHALL return to the previous element

### Requirement: Menus close when clicking outside
The system SHALL close open menus when the user clicks outside the menu area.

#### Scenario: Click outside closes menu
- **WHEN** a menu is open and user clicks outside the menu
- **THEN** the menu SHALL close immediately

### Requirement: Menu items show keyboard shortcuts
The system SHALL display keyboard shortcuts next to menu items where applicable.

#### Scenario: Menu items display shortcuts
- **WHEN** a menu item has an associated keyboard shortcut
- **THEN** the shortcut SHALL be displayed on the right side of the menu item
- **AND** use platform-appropriate modifier keys (Cmd for macOS, Ctrl for Windows/Linux)
