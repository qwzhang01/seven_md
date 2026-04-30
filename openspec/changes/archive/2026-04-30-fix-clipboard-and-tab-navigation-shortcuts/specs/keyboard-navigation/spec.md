## MODIFIED Requirements

### Requirement: System provides comprehensive keyboard shortcut coverage
The system SHALL provide keyboard shortcuts for all major operations across the entire application.

#### Scenario: Global shortcuts always active
- **WHEN** the application has focus
- **THEN** the following global shortcuts SHALL work regardless of which element has focus:
  | Shortcut | Action |
  |----------|--------|
  | Ctrl+Shift+P | Open command palette |
  | Ctrl+B | Toggle sidebar |
  | Ctrl+S | Save current file |
  | Ctrl+N | New file |
  | Ctrl+O | Open file |
  | Ctrl+W | Close tab/window |
  | Ctrl+Tab | Switch to next tab |
  | Ctrl+Shift+Tab | Switch to previous tab |

#### Scenario: Editor-focused shortcuts
- **WHEN** the editor area has focus
- **THEN** these editing shortcuts SHALL be active:
  | Shortcut | Action |
  |----------|--------|
  | Ctrl+Z | Undo |
  | Ctrl+Shift+Z | Redo |
  | Ctrl+X | Cut |
  | Ctrl+C | Copy |
  | Ctrl+V | Paste |
  | Ctrl+A | Select all |
  | Ctrl+F | Find |
  | Ctrl+H | Find & replace |
  | Ctrl+B | Bold (when editor focused) |
  | Ctrl+I | Italic |
  | Ctrl+K | Insert link |
  | Tab | Indent |
  | Shift+Tab | Outdent |

#### Scenario: Non-editor-focused shortcuts
- **WHEN** the editor area does NOT have focus
- **THEN** these shortcuts SHALL be active:
  | Shortcut | Action |
  |----------|--------|
  | Alt+Left | Switch to previous tab |
  | Alt+Right | Switch to next tab |

#### Scenario: View management shortcuts
- **WHEN** the application has focus
- **THEN** these view shortcuts SHALL be active:
  | Shortcut | Action |
  |----------|--------|
  | Ctrl++ | Zoom in (increase font size) |
  | Ctrl+- | Zoom out (decrease font size) |
  | Ctrl+0 | Reset zoom |
  | Ctrl+Shift+E | Focus explorer |
  | Ctrl+Shift+F | Focus search panel |
  | Ctrl+Shift+O | Toggle outline panel |

## ADDED Requirements

### Requirement: Clipboard operations via menu work correctly in Tauri webview
The system SHALL correctly execute clipboard operations (cut, copy, paste) when triggered via the native menu in the Tauri webview environment.

#### Scenario: Menu copy writes selected text to system clipboard
- **WHEN** the `editor:copy` CustomEvent is dispatched on `window`
- **AND** the editor has a non-empty text selection
- **THEN** the selected text SHALL be written to the system clipboard via `navigator.clipboard.writeText()`
- **AND** the editor content SHALL remain unchanged

#### Scenario: Menu cut writes selected text to clipboard and removes it
- **WHEN** the `editor:cut` CustomEvent is dispatched on `window`
- **AND** the editor has a non-empty text selection
- **THEN** the selected text SHALL be written to the system clipboard via `navigator.clipboard.writeText()`
- **AND** the selected text SHALL be removed from the editor document

#### Scenario: Menu paste reads from clipboard without triggering browser paste UI
- **WHEN** the `editor:paste` CustomEvent is dispatched on `window`
- **THEN** the system SHALL read clipboard text via `navigator.clipboard.readText()`
- **AND** the clipboard text SHALL be inserted at the cursor position (replacing any selection)
- **AND** the browser native paste UI button SHALL NOT appear

#### Scenario: Clipboard operations are no-ops when editor has no selection (copy/cut)
- **WHEN** the `editor:copy` or `editor:cut` CustomEvent is dispatched
- **AND** the editor has no text selected (empty selection)
- **THEN** the system SHALL silently ignore the operation without modifying the clipboard or document
