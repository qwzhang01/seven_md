## MODIFIED Requirements

### Requirement: Help menu provides documentation and about information
The system SHALL provide a Help menu with documentation links and application information.

#### Scenario: Help menu items
- **WHEN** user clicks the Help menu
- **THEN** the following items SHALL be displayed:
  - 欢迎页
  - Markdown 指南
  - 快捷键参考
  - Separator
  - About Seven Markdown
  - 检查更新

#### Scenario: About dialog shows Seven Markdown branding
- **WHEN** user selects "About Seven Markdown"
- **THEN** a modal dialog SHALL display showing:
  - Application name: "Seven Markdown"
  - Slogan: "Write Markdown Like Code"
  - Version number
  - License information (MIT)
