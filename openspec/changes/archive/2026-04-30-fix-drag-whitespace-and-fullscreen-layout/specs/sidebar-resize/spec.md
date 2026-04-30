## MODIFIED Requirements

### Requirement: 侧边栏宽度拖拽调整
用户 SHALL 能通过拖拽侧边栏右边缘来调整侧边栏宽度，范围限制为 180px 到 500px。拖拽期间，窗口拖动区域 SHALL 被禁用以防止意外触发窗口移动。

#### Scenario: 拖拽调整宽度
- **WHEN** 用户在侧边栏右边缘按下鼠标并向左/右拖拽
- **THEN** 侧边栏宽度 SHALL 实时跟随鼠标位置变化，但不小于 180px 且不大于 500px

#### Scenario: 释放鼠标确认宽度
- **WHEN** 用户拖拽侧边栏边缘后释放鼠标
- **THEN** 侧边栏 SHALL 保持释放时的宽度，宽度值 SHALL 持久化到 `useUIStore.sidebarWidth`

#### Scenario: 双击恢复默认宽度
- **WHEN** 用户双击侧边栏右边缘的 resize handle
- **THEN** 侧边栏宽度 SHALL 恢复为默认值 240px

#### Scenario: 拖拽期间禁用窗口拖动区域
- **WHEN** 用户在侧边栏 resize handle 上按下鼠标开始拖拽
- **THEN** `document.documentElement` 上 SHALL 设置 `data-resizing` 属性
- **AND** 所有 `data-tauri-drag-region` 元素 SHALL 通过 CSS 应用 `-webkit-app-region: no-drag`
- **AND** 鼠标移动到 TitleBar 区域 SHALL NOT 触发窗口移动
- **WHEN** 用户释放鼠标
- **THEN** `data-resizing` 属性 SHALL 从 `document.documentElement` 移除
- **AND** TitleBar SHALL 恢复作为窗口拖动区域的功能

### Requirement: Resize handle 视觉反馈
侧边栏右边缘 SHALL 显示可拖拽的视觉提示。

#### Scenario: Hover 显示 handle
- **WHEN** 鼠标悬停在侧边栏右边缘（4px 区域）
- **THEN** 右边缘 SHALL 显示一条 2px 宽的高亮线条，光标变为 `col-resize`

#### Scenario: 拖拽中光标保持
- **WHEN** 用户正在拖拽调整侧边栏宽度
- **THEN** 整个文档的光标 SHALL 保持为 `col-resize`，直到释放鼠标
