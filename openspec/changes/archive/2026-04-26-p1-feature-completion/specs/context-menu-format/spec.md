## ADDED Requirements

### Requirement: Context menu includes Format Document option
The system SHALL provide a "格式化文档" option in the editor right-click context menu.

#### Scenario: Format Document menu item position
- **WHEN** user right-clicks in the editor area
- **THEN** the context menu SHALL include a "📝 格式化文档" item
- **AND** the item SHALL be positioned after the "🔍 查找" item and before the "🤖 AI 改写" item

#### Scenario: Format Document triggers formatting
- **WHEN** user clicks "格式化文档" in the context menu
- **THEN** the system SHALL execute the `editor:format` custom event
- **AND** the context menu SHALL close

### Requirement: Editor listens to format event and applies Markdown formatting
The system SHALL listen for `editor:format` events and apply formatting rules to the entire document.

#### Scenario: Normalize excessive blank lines
- **WHEN** the `editor:format` event is received
- **AND** the document contains 3 or more consecutive blank lines
- **THEN** the system SHALL reduce them to exactly 2 blank lines (one empty line between paragraphs)

#### Scenario: Remove trailing whitespace
- **WHEN** the `editor:format` event is received
- **AND** lines contain trailing spaces or tabs
- **THEN** the system SHALL remove trailing whitespace from all lines
- **AND** intentional Markdown line breaks (two trailing spaces before newline) SHALL be preserved

#### Scenario: Ensure final newline
- **WHEN** the `editor:format` event is received
- **AND** the document does not end with a newline character
- **THEN** the system SHALL append a single newline at the end of the document

#### Scenario: Formatting preserves undo history
- **WHEN** the format operation is applied
- **THEN** the entire format change SHALL be a single CodeMirror transaction
- **AND** the user SHALL be able to undo the formatting with a single Ctrl+Z / ⌘+Z
