# Proposal: 命令面板导出快捷键与切换自动换行

## Why

根据 `docs/todo-comparison-report.md` 中 J. 命令面板差异分析，当前实现与规范存在以下问题：

1. **命令面板缺少"切换自动换行"命令** — 规范 `command-palette/spec.md` 已在默认命令分类中定义了"🖌️ Edit: 切换自动换行"命令，但 `commands/index.ts` 中缺少该命令实现
2. **导出 PDF/HTML 缺少快捷键显示** — 规范 `pdf-export/spec.md` 定义了导出功能，但 commands 中 `exportPdf`/`exportHtml` 命令缺少 `shortcut` 字段，导致命令面板无法显示快捷键提示

这些是低优先级但影响用户体验的小缺陷，修复后可提升命令面板的完整性和可用性。

## What Changes

- **新增**: 在 `commands/index.ts` 中添加 `toggleWordWrap` 命令，实现编辑器自动换行切换功能
- **新增**: 为 `exportPdf` 命令添加快捷键配置 `Ctrl+Shift+P`（macOS: `Cmd+Shift+P`）
- **新增**: 为 `exportHtml` 命令添加快捷键配置
- **修改**: 确保命令面板中显示的命令与 `command-palette/spec.md` 规范一致

## Capabilities

### New Capabilities

- `editor-word-wrap-toggle`: 编辑器自动换行切换功能，支持通过命令面板调用

### Modified Capabilities

- `command-palette`: 更新命令列表，确保"切换自动换行"命令存在，并展示导出命令的快捷键
- `pdf-export`: 添加导出 PDF/HTML 命令的快捷键元数据

## Impact

- **修改文件**: `src/commands/index.ts` — 添加 `toggleWordWrap` 命令及导出命令快捷键
- **依赖规范**: `openspec/specs/command-palette/spec.md`、`openspec/specs/pdf-export/spec.md`
- **相关组件**: CommandPalette、EditorCore
