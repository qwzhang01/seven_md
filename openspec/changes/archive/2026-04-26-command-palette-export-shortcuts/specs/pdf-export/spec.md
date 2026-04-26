## MODIFIED Requirements

### Requirement: PDF 导出功能
用户 SHALL 能通过"文件"菜单或命令面板将当前编辑器内容导出为 PDF 文件。

#### Scenario: 通过菜单导出 PDF
- **WHEN** 用户点击"文件"→"导出"→"导出为 PDF"
- **THEN** 系统 SHALL 调用 `window.print()` 打开系统打印对话框，用户可在对话框中选择"另存为 PDF"或直接打印

#### Scenario: 通过命令面板导出 PDF
- **WHEN** 用户在命令面板中搜索并执行"导出为 PDF"命令
- **THEN** 系统 SHALL 调用 `window.print()` 打开系统打印对话框
- **AND** 命令面板中该命令 SHALL 显示快捷键 `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`)

### Requirement: HTML 导出功能
用户 SHALL 能通过命令面板将当前编辑器内容导出为 HTML 文件。

#### Scenario: 通过命令面板导出 HTML
- **WHEN** 用户在命令面板中搜索并执行"导出为 HTML"命令
- **THEN** 系统 SHALL 打开文件保存对话框，允许用户保存为 .html 文件
- **AND** 命令面板中该命令 SHALL 显示快捷键
