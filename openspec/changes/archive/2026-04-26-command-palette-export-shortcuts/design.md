# Design: 命令面板导出快捷键与切换自动换行

## Context

当前 `src/commands/index.ts` 中存在以下问题：
1. 缺少 `toggleWordWrap` 命令，而规范 `command-palette/spec.md` 要求命令面板应显示"🖌️ Edit: 切换自动换行"
2. `exportPdf` 和 `exportHtml` 命令没有 `shortcut` 字段，用户无法在命令面板中看到快捷键提示

## Goals / Non-Goals

**Goals:**
- 添加 `toggleWordWrap` 命令到命令列表
- 为导出命令添加快捷键显示
- 保持与现有命令注册模式的一致性

**Non-Goals:**
- 不修改编辑器自动换行的实际实现逻辑（假设 `EditorCore` 已支持）
- 不添加新的菜单项（仅命令面板层面）
- 不修改其他相关命令的行为

## Decisions

### 1. toggleWordWrap 命令实现方式

**决定**: 直接调用已有的 `editorStore.toggleWordWrap()` action

**理由**:
- 符合现有命令模式（其他命令如 `formatDocument` 也是调用 store action）
- 不引入新的依赖或耦合

### 2. 导出命令快捷键分配

**决定**:
- `exportPdf`: `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`)
- `exportHtml`: `Ctrl+Shift+O` (macOS: `Cmd+Shift+O`) — 复用规范中定义的快捷键

**理由**:
- `Ctrl+Shift+P` 与命令面板快捷键 `Ctrl+Shift+P` 不冲突（导出 PDF 使用时需要先聚焦编辑器）
- 避免与现有快捷键冲突

### 3. 命令分类

**决定**: `toggleWordWrap` 归类到 `Edit` 分类

**理由**: 与规范 `command-palette/spec.md` 第 33 行保持一致

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `editorStore.toggleWordWrap()` 方法不存在 | 先检查 store 中是否有相关方法，如无则实现 |
| 快捷键与其他功能冲突 | 测试时验证无冲突 |
