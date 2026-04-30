## ADDED Requirements

### Requirement: Editor handles menu-triggered clipboard operations
The system SHALL respond to `editor:cut`, `editor:copy`, `editor:paste`, and `editor:select-all` CustomEvents by executing the corresponding clipboard operation on the active CodeMirror view.

#### Scenario: Menu cut copies selection to clipboard and removes it
- **WHEN** the `editor:cut` CustomEvent is dispatched on `window`
- **AND** the editor has a non-empty text selection
- **THEN** the selected text SHALL be copied to the system clipboard
- **AND** the selected text SHALL be removed from the editor

#### Scenario: Menu copy copies selection to clipboard
- **WHEN** the `editor:copy` CustomEvent is dispatched on `window`
- **AND** the editor has a non-empty text selection
- **THEN** the selected text SHALL be copied to the system clipboard
- **AND** the editor content SHALL remain unchanged

#### Scenario: Menu paste inserts clipboard content at cursor
- **WHEN** the `editor:paste` CustomEvent is dispatched on `window`
- **THEN** the current system clipboard text content SHALL be inserted at the cursor position
- **AND** if text is selected, the selection SHALL be replaced with the clipboard content

#### Scenario: Menu select-all selects entire document
- **WHEN** the `editor:select-all` CustomEvent is dispatched on `window`
- **THEN** all text in the editor document SHALL be selected

#### Scenario: Clipboard operations are no-ops when editor view is not initialized
- **WHEN** any clipboard CustomEvent is dispatched
- **AND** the CodeMirror view has not been initialized
- **THEN** the event SHALL be silently ignored without throwing an error
