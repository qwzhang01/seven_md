## MODIFIED Requirements

### Requirement: Commands are categorized and executable
The system SHALL organize commands into categories and allow execution via selection.

#### Scenario: Default command categories
- **WHEN** the command palette opens with no search query
- **THEN** commands SHALL be grouped by category:
  - 🌙 Theme: 切换到深色模式 / 切换到浅色模式
  - ▌▌ View: 分栏视图 / 仅编辑器 / 仅预览
  - 🖌️ Edit: 格式化文档 / **切换自动换行**
  - 💾 File: 保存 / 另存为 / **导出为 PDF** / **导出为 HTML**
  - 📊 Insert: 表格 / 代码块 / 任务列表
  - 🤖 AI: 打开助手 / 改写选中文本 / 翻译选中文本

#### Scenario: Export commands display keyboard shortcuts
- **WHEN** the command palette shows the export commands
- **THEN** "导出为 PDF" SHALL display its keyboard shortcut `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`)
- **AND** "导出为 HTML" SHALL display its keyboard shortcut
