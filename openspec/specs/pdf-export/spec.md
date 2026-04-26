## ADDED Requirements

### Requirement: PDF 导出功能
用户 SHALL 能通过"文件"菜单或命令面板将当前编辑器内容导出为 PDF 文件。

#### Scenario: 通过菜单导出 PDF
- **WHEN** 用户点击"文件"→"导出"→"导出为 PDF"
- **THEN** 系统 SHALL 调用 `window.print()` 打开系统打印对话框，用户可在对话框中选择"另存为 PDF"或直接打印

#### Scenario: 通过命令面板导出 PDF
- **WHEN** 用户在命令面板中搜索并执行"导出为 PDF"命令
- **THEN** 系统 SHALL 调用 `window.print()` 打开系统打印对话框

### Requirement: 打印样式优化
导出 PDF 时 SHALL 应用专用的 `@media print` CSS 样式，隐藏编辑器 UI 只保留预览内容。

#### Scenario: 打印时隐藏编辑器 UI
- **WHEN** `window.print()` 触发打印/导出
- **THEN** 打印预览中 SHALL 只显示 Markdown 渲染后的预览内容，不显示侧边栏、工具栏、状态栏、编辑器等 UI 元素

#### Scenario: 打印样式保留代码高亮
- **WHEN** 导出的 Markdown 内容包含代码块
- **THEN** 打印结果中 SHALL 保留 highlight.js 的语法高亮样式
