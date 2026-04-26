## ADDED Requirements

### Requirement: Context menu includes Format Document option
The system SHALL provide a "格式化文档" option in the editor right-click context menu.

**Icon Specification:**
- The "格式化文档" menu item SHALL use a `Sparkles` icon from `lucide-react` (size 14px)
- Icon color SHALL inherit from `var(--text-primary)` CSS variable
- All context menu items SHALL use lucide-react icons instead of emoji:
  - 剪切: `Scissors` icon
  - 复制: `Clipboard` icon
  - 粘贴: `FileText` icon
  - 插入: `Plus` icon
  - 全选: `Type` icon
  - 查找: `Search` icon
  - AI 改写: `Bot` icon

#### Scenario: Format Document menu item position and icon
- **WHEN** user right-clicks in the editor area
- **THEN** the context menu SHALL include a "格式化文档" item with `Sparkles` icon
- **AND** the item SHALL be positioned after the "查找" item and before the "AI 改写" item

#### Scenario: Format Document triggers formatting
- **WHEN** user clicks "格式化文档" in the context menu
- **THEN** the system SHALL execute the `editor:format` custom event
- **AND** the context menu SHALL close

#### Scenario: Context menu icons use lucide-react
- **WHEN** user right-clicks in the editor area
- **THEN** all menu items with icons SHALL render lucide-react icon components
- **AND** icons SHALL have consistent size (14px) and inherit text color

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
