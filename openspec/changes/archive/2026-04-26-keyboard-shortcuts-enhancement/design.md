## Context

当前 Seven Markdown 的快捷键系统存在以下问题：
1. 多个规范中定义的快捷键未在 `AppV2.tsx` 的 shortcuts 数组中注册
2. `Ctrl+B` 当前被映射为侧边栏切换，与编辑器加粗格式冲突
3. `Ctrl+H` 未注册，无法通过键盘快捷键打开替换功能

需要扩展 `keyboard-shortcuts-hook` 以支持完整的面板切换、窗口管理和文本格式快捷键。

## Goals / Non-Goals

**Goals:**
- 实现 Ctrl+Shift+E/F/O 三个面板切换快捷键
- 实现 Ctrl+W 关闭标签页快捷键
- 实现 Ctrl+H 打开查找+替换栏快捷键
- 实现 Ctrl+B/I/K 编辑格式快捷键（在编辑器获得焦点时）
- 修正 Ctrl+B 快捷键冲突问题

**Non-Goals:**
- 不修改 CodeMirror 原生的键盘处理逻辑
- 不添加新的快捷键自定义配置界面
- 不实现快捷键冲突检测和提示

## Decisions

### Decision 1: 使用 useKeyboardShortcuts Hook 统一注册

**选择**：所有新增快捷键都通过 `useKeyboardShortcuts` Hook 注册在 `AppV2.tsx` 中。

**理由**：
- 现有架构已经使用此 Hook 统一管理全局快捷键
- 保持代码风格一致性
- 便于后续统一管理快捷键列表

**替代方案**：
- 直接在 CodeMirror 中注册编辑格式快捷键 → 拒绝，因为 Ctrl+B/I/K 应该在编辑器外部也可配置
- 创建独立的快捷键管理器类 → 过度工程化

### Decision 2: 编辑格式快捷键需要编辑器焦点判断

**选择**：Ctrl+B/I/K 只在编辑器获得焦点时生效。

**理由**：
- 保持与 VSCode 类似的行为模式
- 用户期望在编辑文本时使用这些快捷键
- 避免与其他全局快捷键冲突

**实现方式**：
```typescript
{
  key: 'b',
  ctrlKey: true,
  when: () => editorHasFocus,
  action: () => applyBold()
}
```

### Decision 3: Ctrl+B 侧边栏切换需要重新评估上下文

**选择**：将 Ctrl+B 的侧边栏切换功能移除或限制为非编辑器焦点时触发。

**理由**：
- Ctrl+B 作为加粗快捷键是更常见的编辑操作
- VSCode 中 Ctrl+B 也是切换侧边栏（但加粗用 Ctrl+I）
- 根据 todo-comparison-report.md 规范要求，Ctrl+B 应该是加粗

### Decision 4: Ctrl+Shift+F 与 format 冲突处理

**选择**：Ctrl+Shift+F 优先用于搜索面板，format 命令改用其他快捷键。

**理由**：
- 规范中明确 Ctrl+Shift+F 为搜索面板
- commands/index.ts 中 `edit.format` 使用 Ctrl+Shift+F 是实现错误
- 搜索面板是更高频的操作

## Risks / Trade-offs

- **Risk**: 修改 Ctrl+B 行为可能影响现有用户习惯
  - **Mitigation**: 在 changelog 中明确说明变更，提供迁移指南
  - **Mitigation**: 用户可通过命令面板重新配置

- **Risk**: 快捷键上下文判断可能存在边界情况
  - **Mitigation**: 使用统一的 `editorRef` 判断编辑器焦点状态
  - **Mitigation**: 添加集成测试覆盖各种焦点场景

- **Risk**: macOS metaKey 与 Ctrl 的映射
  - **Mitigation**: `useKeyboardShortcuts` Hook 已经处理了平台适配
  - **Mitigation**: 测试时在 macOS 和 Windows 分别验证

## Open Questions

1. **Ctrl+H 在 macOS 上的行为**：macOS 上 Ctrl+H 是退格键，应使用 ⌘+H 还是保持 Ctrl+H？
   - 当前决定：保持 Ctrl+H（跨平台一致），macOS 用户习惯 Cmd 组合键

2. **是否需要为快捷键添加命令面板条目**？
   - 当前决定：暂不添加，聚焦于基础功能实现
