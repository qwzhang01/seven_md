## 1. 创建 useKeyboardShortcuts Hook

- [x] 1.1 创建 `src/hooks/useKeyboardShortcuts.ts`，定义 `ShortcutConfig` 接口（key, ctrlKey?, shiftKey?, altKey?, metaKey?, action, description, preventDefault?, global?）
- [x] 1.2 实现 `isMacOS()` 函数：检测 `navigator.platform` 是否以 'Mac' 开头
- [x] 1.3 实现 `getModifierKey()` 函数：macOS 返回 `'⌘'`，其他返回 `'Ctrl'`
- [x] 1.4 实现 `formatShortcut(key, modifiers?)` 函数：根据平台格式化快捷键显示字符串（macOS: `⌘S`，Windows: `Ctrl+S`）
- [x] 1.5 实现 `useKeyboardShortcuts(shortcuts)` hook 核心逻辑：在 `useEffect` 中注册 `document.addEventListener('keydown', handler)`，在清理函数中移除
- [x] 1.6 实现修饰键精确匹配：ctrlKey 在 macOS 上映射为 metaKey 检查；未指定的修饰键默认为 false；所有修饰键状态必须完全匹配
- [x] 1.7 实现 preventDefault 控制：默认调用 `event.preventDefault()`，当 `preventDefault: false` 时跳过

## 2. 运行已有测试验证

- [x] 2.1 运行 `useKeyboardShortcuts.test.ts`，确认全部 6 个测试用例通过
- [x] 2.2 运行 `useKeyboardShortcuts.test.tsx`，确认全部 13 个测试用例通过（注意：如 `AppProvider` 已废弃，需更新 wrapper）

## 3. 补齐 CodeMirror 编辑器标准 Keymaps

- [x] 3.1 在 `EditorPaneV2.tsx` 中添加 `import { indentWithTab, defaultKeymap, historyKeymap } from '@codemirror/commands'` 和 `import { history } from '@codemirror/commands'`
- [x] 3.2 在 extensions 中添加 `history()` extension（用于 undo/redo 历史记录）
- [x] 3.3 更新 `keymap.of([...])` 配置，按优先级排序：`closeBracketsKeymap` → `listContinuation()` → `indentWithTab` → `historyKeymap` → `defaultKeymap`
- [x] 3.4 手动验证 Tab 缩进、Shift+Tab 反缩进、Ctrl+Z 撤销、列表续行均正常工作

## 4. 迁移 AppV2 快捷键到 Hook

- [x] 4.1 在 `AppV2.tsx` 中导入 `useKeyboardShortcuts`，构建等价的快捷键配置数组（保存、打开、新建、命令面板、侧边栏、查找、缩放、Escape）
- [x] 4.2 调用 `useKeyboardShortcuts(shortcuts)` 替代原有功能
- [x] 4.3 删除 `AppV2.tsx` 第 174-195 行的内联 `useEffect` keydown 处理代码
- [x] 4.4 回归测试：确认所有原有快捷键行为不变（Ctrl+S 保存、Ctrl+O 打开、Ctrl+N 新建、Ctrl+Shift+P 命令面板、Ctrl+B 侧边栏、Ctrl+F 查找、Ctrl+=/- 缩放、Escape 关闭）

## 5. 补充命令 Shortcut 字段

- [x] 5.1 检查 `src/commands/index.ts` 中所有命令，确保关键命令都有 `shortcut` 字段（特别是 edit.replace: 'Ctrl+H' 等）
- [x] 5.2 确认命令面板 UI 中快捷键显示与实际绑定一致
