## ADDED Requirements

### Requirement: UI chrome 区域禁止文本选择
应用的所有非内容区域（工具栏、活动栏、侧边栏容器、标签栏、状态栏、分隔条、对话框标题栏）SHALL 禁止用户通过鼠标拖拽选择文本。

#### Scenario: 用户在工具栏拖拽鼠标
- **WHEN** 用户在工具栏区域按住鼠标并拖动
- **THEN** 不产生任何文本选择高亮效果

#### Scenario: 用户在侧边栏标题区域拖拽鼠标
- **WHEN** 用户在侧边栏标题或面板切换区域按住鼠标并拖动
- **THEN** 不产生任何文本选择高亮效果

#### Scenario: 用户在标签栏拖拽鼠标
- **WHEN** 用户在标签栏区域（包括标签和空白处）按住鼠标并拖动
- **THEN** 不产生任何文本选择高亮效果

#### Scenario: 用户在状态栏拖拽鼠标
- **WHEN** 用户在状态栏区域按住鼠标并拖动
- **THEN** 不产生任何文本选择高亮效果

### Requirement: 编辑器内容区保持文本可选
编辑器核心内容区（CodeMirror 编辑器）SHALL 保持正常的文本选择和光标操作能力。

#### Scenario: 用户在编辑器中选择文本
- **WHEN** 用户在 CodeMirror 编辑器内容区域按住鼠标并拖动
- **THEN** 正常选中文本并高亮显示

#### Scenario: 用户在编辑器中使用键盘选择
- **WHEN** 用户按 Shift+方向键进行文本选择
- **THEN** 编辑器正常响应键盘选择操作

### Requirement: 预览面板正文区保持文本可选
预览面板的渲染内容区域 SHALL 保持文本可选，以便用户复制预览内容。

#### Scenario: 用户在预览面板选择文本
- **WHEN** 用户在预览面板的 Markdown 渲染内容区域按住鼠标并拖动
- **THEN** 正常选中文本并高亮显示

#### Scenario: 用户在预览面板使用 Cmd+A 全选
- **WHEN** 用户在预览面板焦点下按 Cmd+A
- **THEN** 预览面板内的渲染内容被全选

### Requirement: 全局 user-select 通过 CSS 实现
系统 SHALL 通过根元素 CSS `user-select: none` 配合内容区域 `user-select: text` 的方式实现选择控制，而非通过 JavaScript 事件拦截。

#### Scenario: CSS 规则生效
- **WHEN** 应用加载完成
- **THEN** 根元素 (`#root` 或 `html`) 的 computed style 中 `user-select` 为 `none`
- **THEN** 编辑器容器内 `user-select` 为 `text`
- **THEN** 预览面板内容区 `user-select` 为 `text`
