## Requirements

### Requirement: Editor supports Tab key indentation
The CodeMirror editor SHALL support Tab and Shift+Tab for text indentation.

#### Scenario: Tab key indents current line
- **WHEN** the editor has focus
- **AND** the user presses the Tab key
- **THEN** the editor SHALL insert indentation at the cursor position (or indent the selected lines)

#### Scenario: Shift+Tab outdents current line
- **WHEN** the editor has focus
- **AND** the user presses Shift+Tab
- **THEN** the editor SHALL remove one level of indentation from the current line (or selected lines)

#### Scenario: Tab indentation does not conflict with list continuation
- **WHEN** the cursor is at the end of a list item line (e.g., `- item`)
- **AND** the user presses Enter
- **THEN** the list continuation keymap SHALL still trigger (inserting a new list prefix)
- **AND** Tab indentation SHALL work normally on the new line

### Requirement: Editor includes standard CodeMirror keymaps
The CodeMirror editor SHALL include `defaultKeymap` and `historyKeymap` for standard editing shortcuts.

#### Scenario: Standard editing shortcuts are available
- **WHEN** the editor has focus
- **THEN** the following CodeMirror standard shortcuts SHALL work:
  | Shortcut | Action |
  |----------|--------|
  | Ctrl/⌘+Z | Undo |
  | Ctrl/⌘+Shift+Z (or Ctrl+Y) | Redo |
  | Ctrl/⌘+A | Select all |
  | Ctrl/⌘+D | Select next occurrence |

#### Scenario: History extension is loaded for undo/redo support
- **WHEN** the editor initializes
- **THEN** the `history()` extension SHALL be included in the editor state
- **AND** `historyKeymap` SHALL be configured in the keymap

### Requirement: Editor keymap priority preserves existing behavior
The editor SHALL maintain correct keymap priority to preserve existing behaviors.

#### Scenario: closeBracketsKeymap takes priority over defaultKeymap
- **WHEN** the editor is initialized
- **THEN** `closeBracketsKeymap` SHALL be ordered before `defaultKeymap` in the keymap configuration
- **AND** automatic bracket closing SHALL continue to work

#### Scenario: listContinuation takes priority over default Enter
- **WHEN** the editor is initialized
- **THEN** `listContinuation()` keymap SHALL be ordered before `defaultKeymap`
- **AND** pressing Enter on a list item line SHALL trigger list continuation (not default newline)

#### Scenario: indentWithTab is included in keymap
- **WHEN** the editor is initialized
- **THEN** `indentWithTab` SHALL be included in the keymap configuration
- **AND** it SHALL be ordered after `listContinuation()` but within the main keymap array
