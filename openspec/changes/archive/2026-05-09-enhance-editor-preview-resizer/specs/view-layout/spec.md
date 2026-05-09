## MODIFIED Requirements

### Requirement: Gutter allows resizing editor/preview ratio
The system SHALL allow users to drag the divider between editor and preview to resize their relative widths. The Gutter SHALL be rendered as a direct flex child (or with explicit full height) to ensure it is visible and interactive. During dragging, the window drag region SHALL be disabled to prevent accidental window movement.

#### Scenario: Gutter is visible and occupies full height
- **WHEN** the view mode is `split` and at least one tab is open
- **THEN** the Gutter SHALL render as a vertical bar between editor and preview panes
- **AND** the Gutter SHALL occupy the full height of the editor-preview container
- **AND** the Gutter SHALL have a width of 6px with border indicators
- **AND** the Gutter SHALL display `cursor: col-resize` on hover

#### Scenario: Drag gutter to resize
- **WHEN** user clicks and drags the vertical gutter between editor and preview
- **THEN** the gutter position SHALL follow the cursor horizontally
- **AND** the editor width and preview width SHALL adjust proportionally in real-time
- **AND** during dragging, the gutter SHALL highlight with accent color
- **AND** mouse cursor SHALL change to ↔ (col-resize cursor)
- **AND** during dragging, the flex transition animation on editor/preview panes SHALL be disabled

#### Scenario: Minimum pane sizes enforced
- **WHEN** dragging the gutter
- **THEN** the editor pane SHALL NOT shrink below 200px minimum width
- **AND** the preview pane SHALL NOT shrink below 200px minimum width
- **IF** either limit is reached, further dragging in that direction SHALL be blocked

#### Scenario: Double-click gutter to reset ratio
- **WHEN** user double-clicks the gutter divider
- **THEN** the editor/preview width SHALL reset to 50/50 equal split
- **AND** the reset SHALL include a smooth transition animation (~200ms)
- **AND** the persisted editorWidth value SHALL be cleared (set to null)

#### Scenario: Hover effect on gutter
- **WHEN** user hovers over the gutter without clicking
- **THEN** the gutter SHALL subtly highlight with accent color

#### Scenario: Window drag region disabled during gutter drag
- **WHEN** user presses mouse button down on the gutter to start resizing
- **THEN** the `data-resizing` attribute SHALL be set on `document.documentElement`
- **AND** all `data-tauri-drag-region` elements SHALL have `-webkit-app-region: no-drag` applied via CSS
- **AND** the flex transition on editor/preview panes SHALL be set to `none`
- **WHEN** user releases the mouse button
- **THEN** the `data-resizing` attribute SHALL be removed from `document.documentElement`
- **AND** the TitleBar SHALL resume functioning as a window drag region
- **AND** the flex transition SHALL be restored

## ADDED Requirements

### Requirement: Gutter 拖拽期间禁用面板过渡动画
系统 SHALL 在 Gutter 拖拽期间禁用编辑器/预览面板的 CSS transition，确保拖拽实时跟手。

#### Scenario: 拖拽时 transition 被禁用
- **WHEN** `document.documentElement` 上存在 `data-resizing` 属性
- **THEN** `#md-mate-editor-preview` 的直接子元素 SHALL 应用 `transition: none !important` CSS 规则
- **AND** 面板宽度变化 SHALL 无动画延迟地立即跟随鼠标

#### Scenario: 拖拽结束后 transition 恢复
- **WHEN** `data-resizing` 属性被移除
- **THEN** 面板的 CSS transition SHALL 恢复为 `flex 0.25s ease`
- **AND** 后续通过视图模式切换触发的布局变化 SHALL 继续有平滑过渡
