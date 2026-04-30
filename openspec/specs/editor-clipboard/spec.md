## ADDED Requirements

### Requirement: Copy via keyboard shortcut works natively
The editor SHALL allow users to copy selected text using `Cmd+C` (macOS) or `Ctrl+C` (Windows/Linux) without any custom interception. CodeMirror's native browser copy event SHALL handle this operation.

#### Scenario: Copy selected text with keyboard shortcut
- **WHEN** the user selects text in the editor and presses `Cmd+C` / `Ctrl+C`
- **THEN** the selected text SHALL be placed on the system clipboard without any permission dialog

#### Scenario: Copy with no selection
- **WHEN** the user presses `Cmd+C` / `Ctrl+C` with no text selected
- **THEN** nothing SHALL be copied and no error SHALL occur

### Requirement: Cut via keyboard shortcut works natively
The editor SHALL allow users to cut selected text using `Cmd+X` (macOS) or `Ctrl+X` (Windows/Linux) without any custom interception. CodeMirror's native browser cut event SHALL handle this operation.

#### Scenario: Cut selected text with keyboard shortcut
- **WHEN** the user selects text in the editor and presses `Cmd+X` / `Ctrl+X`
- **THEN** the selected text SHALL be removed from the editor and placed on the system clipboard without any permission dialog

### Requirement: Paste via keyboard shortcut works natively
The editor SHALL allow users to paste text using `Cmd+V` (macOS) or `Ctrl+V` (Windows/Linux) without triggering a browser clipboard-read permission dialog. CodeMirror's native browser paste event SHALL handle this operation.

#### Scenario: Paste text with keyboard shortcut
- **WHEN** the user presses `Cmd+V` / `Ctrl+V` while the editor has focus
- **THEN** the clipboard content SHALL be inserted at the cursor position without any permission dialog appearing

### Requirement: Paste via Tauri native menu works without permission dialog
When the user triggers paste from the Tauri native Edit menu, the paste operation SHALL complete without triggering a `navigator.clipboard.readText()` permission dialog.

#### Scenario: Paste from native menu
- **WHEN** the user selects Edit → Paste from the native menu bar
- **THEN** the clipboard content SHALL be inserted at the cursor position
- **THEN** no browser permission dialog SHALL appear

### Requirement: Right-click context menu copy/cut/paste work correctly
The editor's right-click context menu SHALL perform copy, cut, and paste operations by dispatching the same `editor:copy`, `editor:cut`, `editor:paste` custom events used by the Tauri native menu, rather than using the deprecated `document.execCommand` API.

#### Scenario: Copy via right-click menu
- **WHEN** the user selects text, right-clicks, and chooses "复制"
- **THEN** the selected text SHALL be placed on the system clipboard

#### Scenario: Cut via right-click menu
- **WHEN** the user selects text, right-clicks, and chooses "剪切"
- **THEN** the selected text SHALL be removed from the editor and placed on the system clipboard

#### Scenario: Paste via right-click menu
- **WHEN** the user right-clicks and chooses "粘贴"
- **THEN** the clipboard content SHALL be inserted at the cursor position without a permission dialog
