## MODIFIED Requirements

### Requirement: Toolbar displays formatted action buttons
The system SHALL display a toolbar below the menu bar with grouped action buttons for common editing operations.

#### Scenario: Toolbar layout
- **WHEN** the toolbar is rendered
- **THEN** it SHALL be positioned directly below the menu bar
- **AND** its height SHALL be 40 pixels
- **AND** buttons SHALL be organized into groups separated by vertical dividers
- **AND** groups SHALL be ordered: 撤销/重做 | 标题(H1-H3) | 文本格式 | 代码 | 链接/图片 | 列表 | 其他 | 分栏切换 | AI/命令面板/侧边栏

### Requirement: Toolbar provides global action buttons
The system SHALL provide command palette, AI assistant, and sidebar toggle buttons as the last group in the toolbar.

#### Scenario: Command palette button
- **WHEN** user clicks the command palette button
- **THEN** the command palette SHALL open
- **AND** the button tooltip SHALL show "命令面板 (Ctrl+Shift+P)"

#### Scenario: Sidebar toggle button
- **WHEN** user clicks the sidebar toggle button
- **THEN** the sidebar SHALL be hidden or shown based on current state
- **AND** the button SHALL show accent color when sidebar is visible
- **AND** the button tooltip SHALL show "切换侧边栏 (Ctrl+B)"

#### Scenario: AI assistant button
- **WHEN** user clicks the AI assistant button
- **THEN** the AI panel SHALL open on the right side of the editor
- **AND** the button SHALL display both the Bot icon and "AI" text label
- **AND** the tooltip SHALL show "AI 助手" on hover
