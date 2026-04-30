## ADDED Requirements

### Requirement: Toolbar displays formatted action buttons
The system SHALL display a toolbar below the title bar with grouped action buttons for common editing operations. The toolbar SHALL NOT be a window drag region.

#### Scenario: Toolbar layout
- **WHEN** the toolbar is rendered
- **THEN** it SHALL be positioned directly below the title bar
- **AND** its height SHALL be 40 pixels
- **AND** buttons SHALL be organized into groups separated by vertical dividers
- **AND** groups SHALL be ordered: 撤销/重做 | 标题(H1-H3) | 文本格式 | 代码 | 链接/图片 | 列表 | 其他 | AI

#### Scenario: Toolbar is NOT a window drag region
- **WHEN** the toolbar is rendered
- **THEN** the toolbar element SHALL NOT have the `data-tauri-drag-region` attribute
- **AND** clicking and dragging on the toolbar background SHALL NOT move the application window
- **AND** all toolbar buttons SHALL remain fully interactive without triggering window drag

### Requirement: Toolbar provides undo/redo actions
The system SHALL provide undo and redo buttons as the first group in the toolbar.

#### Scenario: Undo button
- **WHEN** user clicks the undo button in the toolbar
- **THEN** the last editing operation SHALL be undone
- **AND** the button SHALL show a tooltip "撤销 (Ctrl+z)" on hover

#### Scenario: Redo button
- **WHEN** user clicks the redo button in the toolbar
- **THEN** the previously undone operation SHALL be redone
- **AND** the button SHALL show a tooltip "重做 (Ctrl+Shift+Z)" on hover

### Requirement: Toolbar provides heading level buttons
The system SHALL provide H1, H2, H3 heading insertion buttons.

#### Scenario: H1 button inserts level 1 heading
- **WHEN** user clicks the H1 button
- **THEN** `# ` SHALL be inserted at the beginning of the current line (if not already present)
- **OR** if text is selected, the selection SHALL be wrapped with `# ` prefix

#### Scenario: H2 button inserts level 2 heading
- **WHEN** user clicks the H2 button
- **THEN** `## ` SHALL be inserted at the beginning of the current line

#### Scenario: H3 button inserts level 3 heading
- **WHEN** user clicks the H3 button
- **THEN** `### ` SHALL be inserted at the beginning of the current line

### Requirement: Toolbar provides text formatting buttons
The system SHALL provide Bold, Italic, and Strikethrough formatting buttons.

#### Scenario: Bold button toggles bold formatting
- **WHEN** user clicks the Bold button (B) or presses Ctrl+B via toolbar
- **THEN** if text is selected, it SHALL be wrapped with `**` (e.g., `**selected**`)
- **OR** if no text is selected, `****` SHALL be inserted with cursor positioned inside

#### Scenario: Italic button toggles italic formatting
- **WHEN** user clicks the Italic button (I) or presses Ctrl+I via toolbar
- **THEN** if text is selected, it SHALL be wrapped with `*` (e.g., `*selected*`)
- **OR** if no text is selected, `**` SHALL be inserted with cursor inside

#### Scenario: Strikethrough button applies strikethrough
- **WHEN** user clicks the Strikethrough button
- **THEN** if text is selected, it SHALL be wrapped with `~~` (e.g., `~~selected~~`)

### Requirement: Toolbar provides code insertion buttons
The system SHALL provide inline code and code block insertion buttons.

#### Scenario: Inline code button
- **WHEN** user clicks the inline code button
- **THEN** if text is selected, it SHALL be wrapped with backticks (`` `code` ``)
- **OR** if no text selected, `` ` ` `` SHALL be inserted with cursor inside

#### Scenario: Code block button
- **WHEN** user clicks the code block button
- **THEN** a fenced code block template SHALL be inserted:
  ```
  \`\`\`language

  \`\`\`
  ```
- **AND** the cursor SHALL be positioned inside the code block on the second line

### Requirement: Toolbar provides link and image insertion buttons
The system SHALL provide Link and Image insertion buttons.

#### Scenario: Link button
- **WHEN** user clicks the Link button or presses Ctrl+K via toolbar
- **THEN** if text is selected, `[selected](url)` SHALL be inserted with `url` highlighted
- **OR** if no text selected, `[](url)` SHALL be inserted with cursor at the text position

#### Scenario: Image button
- **WHEN** user clicks the Image button
- **THEN** `![alt](url)` SHALL be inserted at the cursor position
- **AND** `alt` text SHALL be highlighted for replacement

### Requirement: Toolbar provides list insertion buttons
The system SHALL provide unordered list, ordered list, and task list buttons.

#### Scenario: Unordered list button
- **WHEN** user clicks the unordered list button
- **THEN** `- ` SHALL be inserted at the current line

#### Scenario: Ordered list button
- **WHEN** user clicks the ordered list button
- **THEN** `1. ` SHALL be inserted at the current line

#### Scenario: Task list button
- **WHEN** user clicks the task list button
- **THEN** `- [ ] ` SHALL be inserted at the current line

### Requirement: Toolbar provides additional utility buttons
The system SHALL provide Blockquote, Horizontal Rule, and Table insertion buttons.

#### Scenario: Blockquote button
- **WHEN** user clicks the blockquote button
- **THEN** `> ` SHALL be inserted at the beginning of the current line

#### Scenario: Horizontal rule button
- **WHEN** user clicks the horizontal rule button
- **THEN** `---` SHALL be inserted at the current line, creating a new paragraph separator

#### Scenario: Table button
- **WHEN** user clicks the table button
- **THEN** a Markdown table template SHALL be inserted:
  ```
  | Column 1 | Column 2 | Column 3 |
  |----------|----------|----------|
  |          |          |          |
  ```
- **AND** the cursor SHALL be positioned in the first data cell

### Requirement: Toolbar provides AI assistant button
The system SHALL provide an AI assistant button to open the AI panel.

#### Scenario: AI button opens AI panel
- **WHEN** user clicks the AI button (Bot icon + "AI" label) in the toolbar
- **THEN** the AI assistant panel SHALL open on the right side of the editor
- **AND** the button SHALL display both the Bot icon and "AI" text label
- **AND** the tooltip SHALL show "AI 助手" on hover

### Requirement: Toolbar buttons show hover effects and tooltips
The system SHALL provide visual feedback when interacting with toolbar buttons.

#### Scenario: Hover effect
- **WHEN** user hovers over any toolbar button
- **THEN** the button background SHALL lighten (using --bg-hover CSS variable)
- **AND** a tooltip SHALL appear showing the button name and shortcut (if any)

#### Scenario: Active state
- **WHEN** a formatting button's state is active (e.g., cursor is within bold text)
- **THEN** the button SHALL show an activated visual state (accent color background)
