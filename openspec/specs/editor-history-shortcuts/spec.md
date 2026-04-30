## ADDED Requirements

### Requirement: Undo via keyboard shortcut works in editor
The editor SHALL support undo using `Cmd+Z` (macOS) or `Ctrl+Z` (Windows/Linux). CodeMirror's `historyKeymap` SHALL handle this natively. The Tauri native menu's Edit → Undo SHALL also trigger undo via the `editor:undo` custom event.

#### Scenario: Undo last edit with keyboard shortcut
- **WHEN** the user makes a text change and presses `Cmd+Z` / `Ctrl+Z`
- **THEN** the last change SHALL be reverted in the editor

#### Scenario: Undo via native menu
- **WHEN** the user selects Edit → Undo from the native menu bar
- **THEN** the last change SHALL be reverted in the editor

### Requirement: Redo via keyboard shortcut works in editor
The editor SHALL support redo using `Cmd+Shift+Z` (macOS) or `Ctrl+Shift+Z` (Windows/Linux). CodeMirror's `historyKeymap` SHALL handle this natively. The Tauri native menu's Edit → Redo SHALL also trigger redo via the `editor:redo` custom event.

#### Scenario: Redo last undone edit with keyboard shortcut
- **WHEN** the user undoes a change and presses `Cmd+Shift+Z` / `Ctrl+Shift+Z`
- **THEN** the undone change SHALL be reapplied in the editor

#### Scenario: Redo via native menu
- **WHEN** the user selects Edit → Redo from the native menu bar
- **THEN** the undone change SHALL be reapplied in the editor

### Requirement: No global shortcut hook intercepts undo/redo
The global `useKeyboardShortcuts` hook SHALL NOT register `Ctrl+Z` or `Ctrl+Shift+Z` shortcuts, as these are handled natively by CodeMirror's `historyKeymap` and must not be intercepted.

#### Scenario: Undo shortcut reaches CodeMirror
- **WHEN** the editor has focus and the user presses `Cmd+Z` / `Ctrl+Z`
- **THEN** the keydown event SHALL NOT be consumed by the global shortcut hook
- **THEN** CodeMirror's history extension SHALL process the undo operation
