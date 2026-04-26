## Why

Seven MD 当前的键盘快捷键处理存在两个严重缺陷：

1. **`useKeyboardShortcuts` hook 源文件缺失**：测试文件已按 TDD 模式编写完毕（`useKeyboardShortcuts.test.ts` + `.test.tsx`），但实现文件 `src/hooks/useKeyboardShortcuts.ts` 根本不存在，导致测试无法通过、快捷键功能依赖硬编码。

2. **快捷键管理完全分散**：当前快捷键在 `AppV2.tsx` 内联 `useEffect`（约 20 行 keydown 事件处理）中硬编码了 10+ 个快捷键；另有 `CommandPalette`、`MenuBar`、`AIPanel`、`FindReplaceBar` 等 5+ 组件各自独立监听 Escape/方向键。同时 `useCommandStore` 中 59 个命令虽已注册了 `shortcut` 字段，但这些字段**仅用于 UI 显示，并未实际绑定到 keydown 事件**。

3. **编辑器缺少 Tab 缩进**：`EditorPaneV2.tsx` 的 CodeMirror 配置中仅有 `closeBracketsKeymap` 和自定义 `listContinuation()`，**没有加载 `indentWithTab`**，也没有 `defaultKeymap` 和 `historyKeymap`，导致 Tab 缩进、Ctrl+Z 撤销等编辑器标准快捷键无法在 CodeMirror 内部工作。

此提案旨在建立统一的快捷键管理系统，连接已有的命令注册机制，并补齐编辑器标准 keymaps。

## What Changes

- **创建 `src/hooks/useKeyboardShortcuts.ts`**：实现统一的全局快捷键 hook，导出 `useKeyboardShortcuts`、`formatShortcut`、`isMacOS`、`getModifierKey` 函数（API 需与现有测试文件完全兼容）
- **连接 Command Store**：自动从 `useCommandStore` 中读取所有已注册命令的 `shortcut` 字段，将其绑定为真实的 keydown 事件监听
- **移除 AppV2.tsx 硬编码快捷键**：用 `useKeyboardShortcuts` hook 替换 `AppV2.tsx` 第 174-195 行的内联 `useEffect` keydown 处理
- **补齐 CodeMirror keymaps**：在 `EditorPaneV2.tsx` 中添加 `indentWithTab`、`defaultKeymap`、`historyKeymap`、`searchKeymap`，使编辑器支持 Tab 缩进、标准撤销/重做等
- **macOS/Windows 双平台支持**：在 macOS 上使用 `⌘` (metaKey)，在 Windows/Linux 上使用 `Ctrl` (ctrlKey)，统一通过 `isMacOS()` 判断

## Capabilities

### New Capabilities
- `keyboard-shortcuts-hook`: 统一的全局快捷键管理 hook，支持修饰键匹配（ctrl/meta/shift/alt）、macOS/Windows 自适应、preventDefault 控制、挂载/卸载自动清理
- `editor-standard-keymaps`: 编辑器标准快捷键支持，包括 Tab 缩进、默认编辑快捷键、历史操作快捷键

### Modified Capabilities
（无已有 spec 需要修改）

## Impact

- **受影响文件**：
  - `src/hooks/useKeyboardShortcuts.ts` — 新建
  - `src/AppV2.tsx` — 移除内联快捷键 useEffect，改用 hook
  - `src/components/editor-v2/EditorPaneV2.tsx` — 补充 CodeMirror keymap 扩展
  - `src/commands/index.ts` — 可能需要补充部分命令的 `shortcut` 字段
- **依赖**：`@codemirror/commands`（`indentWithTab`、`defaultKeymap`、`historyKeymap`）— 已作为项目依赖安装
- **已有测试**：`useKeyboardShortcuts.test.ts` 和 `.test.tsx` 共定义了 20+ 测试用例，实现后应全部通过
- **风险**：替换 AppV2 快捷键逻辑时需确保所有现有快捷键行为不变（回归测试）
