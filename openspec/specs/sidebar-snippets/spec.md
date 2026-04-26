## ADDED Requirements

### Requirement: Snippets panel displays reusable Markdown templates
The system SHALL display a snippets panel providing quick-insert templates for common Markdown patterns.

#### Scenario: Snippets panel layout
- **WHEN** the snippets panel is active via activity bar
- **THEN** it SHALL display:
  - A header titled "片段"
  - A list of snippet items, each showing:
    - Snippet name/title
    - Gray preview text showing the template content
    - A ➕ insert button on the right

#### Scenario: Default snippets included
- **WHEN** the snippets panel is loaded
- **THEN** the following default snippets SHALL be available:
  | Name | Template |
  |------|----------|
  | Markdown 表格 | `\| 列1 \| 列2 \| 列3 \|\n\|----------|----------|----------|\n\| \| \| \|` |
  | 代码块 | `\`\`\`language\n// code\n\`\`\`` |
  | 任务列表 | `- [x] 已完成\n- [ ] 未完成` |
  | 注释框 | `> 📌 **注意**: ...` |
  | 图片 | `![描述](url)` |
  | 脚注 | `[^1] 脚注内容` |

### Requirement: Inserting snippet at cursor position
The system SHALL insert snippet templates at the current cursor position when triggered.

#### Scenario: Click insert button
- **WHEN** user clicks the ➕ button next to a snippet
- **THEN** the snippet's template text SHALL be inserted at the current cursor position in the editor
- **AND** focus SHALL return to the editor
- **AND** the cursor SHALL be positioned at a logical insertion point within the template

#### Scenario: Snippet hover effect
- **WHEN** user hovers over a snippet item
- **THEN** the item SHALL be highlighted with a subtle background change

### Requirement: Snippets are extensible
The system SHALL allow users to add custom snippets (future capability).

#### Scenario: Custom snippets storage (future)
- **WHEN** custom snippets are added by the user
- **THEN** they SHALL be persisted in the application settings/localStorage
- **AND** they SHALL appear alongside the default snippets in the panel
