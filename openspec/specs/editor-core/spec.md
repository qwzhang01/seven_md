## ADDED Requirements

### Requirement: Editor displays line numbers
The system SHALL display line numbers along the left edge of the editor area.

#### Scenario: Line numbers visible by default
- **WHEN** the editor is displayed
- **THEN** line numbers SHALL be shown in a gutter area on the left side of each line
- **AND** the gutter width SHALL accommodate up to 4-5 digits
- **AND** line numbers SHALL use secondary text color (--text-secondary)

#### Scenario: Current line number highlighted
- **WHEN** the cursor is positioned on a specific line
- **THEN** that line's number SHALL be highlighted with primary text color and a subtle background

#### Scenario: Clicking line number selects entire line
- **WHEN** user clicks on a line number in the gutter
- **THEN** the entire corresponding line SHALL be selected (highlighted)

### Requirement: Editor provides Markdown syntax highlighting
The system SHALL apply syntax highlighting to Markdown content within the editor.

#### Scenario: Syntax elements highlighted
- **WHEN** Markdown content is displayed in the editor
- **THEN** the following syntax elements SHALL be color-coded:
  | Syntax | Visual Style |
  |--------|-------------|
  | H1-H4 headings | Different sizes, accent colors |
  | **Bold** | Bold weight + emphasis color |
  | *Italic* | Italic style + emphasis color |
  | `Inline code` | Code font family + code background color |
  | Code blocks | Monospace font + code background |
  | [Links](url) | Link color + underline |
  | > Blockquotes | Left border + quote color |
  | Lists (- / 1.) | List item color |
  | --- Horizontal rule | Divider color |
  | ~~Strikethrough~~ | Strikethrough decoration + gray |
  | - [x] Completed task | Green check color |
  | - [ ] Incomplete task | Gray color |

### Requirement: Editor supports auto-pairing of brackets and quotes
The system SHALL automatically insert matching closing brackets, quotation marks, and backticks when opening ones are typed.

#### Scenario: Auto-pair parentheses
- **WHEN** user types `(` in the editor
- **THEN** `()` SHALL be inserted with the cursor positioned between them

#### Scenario: Auto-pair square brackets
- **WHEN** user types `[` in the editor
- **THEN** `[]` SHALL be inserted with cursor between

#### Scenario: Auto-pair curly braces
- **WHEN** user types `{` in the editor
- **THEN** `{}` SHALL be inserted with cursor between

#### Scenario: Auto-pair quotes
- **WHEN** user types `"` or `'`
- **THEN** the matching closing quote SHALL be automatically inserted

#### Scenario: Auto-pair backticks
- **WHEN** user types `` ` `` in the editor
- **THEN** `` `` `` SHALL be inserted with cursor between

#### Scenario: Skip over closing bracket
- **WHEN** the cursor is immediately before a closing bracket/quote
- **AND** user types that same closing character
- **THEN** the cursor SHALL move past the closing character without inserting a new one

### Requirement: Editor supports automatic list continuation
The system SHALL automatically continue list items when pressing Enter at the end of a list item.

#### Scenario: Continue unordered list
- **WHEN** user is at the end of an unordered list item line (`- item`)
- **AND** user presses Enter
- **THEN** a new `- ` prefix SHALL be created on the next line
- **AND** cursor SHALL be placed after the prefix

#### Scenario: Continue ordered list
- **WHEN** user is at the end of an ordered list item line (`3. item`)
- **AND** user presses Enter
- **THEN** a new `4. ` prefix SHALL be created on the next line (incremented)

#### Scenario: Exit list with double Enter
- **WHEN** user presses Enter on an empty list item line (just the prefix, no content)
- **THEN** the list prefix SHALL be removed
- **AND** a blank line shall be created (exiting the list context)

### Requirement: Editor displays right-click context menu
The system SHALL display a context menu when the user right-clicks in the editor area.

#### Scenario: Context menu appears on right-click
- **WHEN** user right-clicks anywhere in the editor area
- **THEN** a context menu SHALL appear at the cursor position containing:
  - ✂️ 剪切 (Ctrl+X)
  - 📋 复制 (Ctrl+C)
  - 📄 粘贴 (Ctrl+V)
  - Separator
  - ➕ Insert submenu:
    - 标题 / 加粗 / 斜体 / 行内代码 / 代码块 / 链接 / 图片 / 表格 / 水平线 / 无序列表 / 有序列表 / 任务列表 / 引用
  - Separator
  - 🔤 全选 (Ctrl+A)
  - Separator
  - 🖌️ 格式化文档
  - 🤖 AI 改写

#### Scenario: Submenu expands on hover
- **WHEN** user hovers over "插入" in the context menu
- **THEN** a submenu SHALL expand showing all insertion options

#### Scenario: Context menu closes appropriately
- **WHEN** the context menu is open
- **AND** user clicks outside it OR presses Escape
- **THEN** the context menu SHALL close

### Requirement: Editor supports Tab/Shift+Tab indentation
The system SHALL support Tab key for indentation and Shift+Tab for outdent.

#### Scenario: Tab inserts indent
- **WHEN** user presses Tab in the editor
- **THEN** indentation (2 spaces or configured tab width) SHALL be inserted at cursor
- **OR** if multiple lines are selected, all lines shall be indented

#### Scenario: Shift+Tab removes indent
- **WHEN** user presses Shift+Tab
- **THEN** one level of indentation SHALL be removed from the current line(s)
