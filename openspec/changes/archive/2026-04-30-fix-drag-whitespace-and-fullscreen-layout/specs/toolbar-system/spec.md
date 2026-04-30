## MODIFIED Requirements

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
