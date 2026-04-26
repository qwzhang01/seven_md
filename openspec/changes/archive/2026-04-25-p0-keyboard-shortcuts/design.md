## Context

Seven MD 是基于 Tauri v2 + React 19 + TypeScript 的桌面 Markdown 编辑器。当前快捷键处理有以下问题：

1. **AppV2.tsx 第 174-195 行**内联了约 12 个全局快捷键（保存、打开、新建、命令面板、侧边栏、查找、缩放、Escape），直接通过 `document.addEventListener('keydown', ...)` 实现
2. **5+ 组件**各自独立监听 Escape/方向键（CommandPalette、MenuBar、AIPanel、FindReplaceBar、ChatMode）
3. **`useCommandStore`** 注册了 59 个命令，每个都有 `shortcut` 字段，但仅用于命令面板 UI 显示，未绑定到实际 keydown 事件
4. **CodeMirror 6 编辑器**只配置了 `closeBracketsKeymap` 和自定义 `listContinuation()`，缺少 `defaultKeymap`、`historyKeymap`、`indentWithTab`
5. **测试文件已存在**：`useKeyboardShortcuts.test.ts`（6 个用例）和 `.test.tsx`（13 个用例）定义了完整的 API 契约

**约束**：
- 必须兼容已有测试文件的 API 签名（`useKeyboardShortcuts(shortcuts[])`、`formatShortcut`、`isMacOS`、`getModifierKey`）
- macOS 使用 `⌘`（metaKey），Windows/Linux 使用 `Ctrl`（ctrlKey）
- 组件级 Escape 处理（如 CommandPalette、MenuBar）保留不动，不纳入全局快捷键

## Goals / Non-Goals

**Goals:**
- 创建可测试、可复用的 `useKeyboardShortcuts` hook，通过已有 20+ 测试用例
- 将 AppV2.tsx 中硬编码的全局快捷键迁移到 hook，消除内联逻辑
- 为 CodeMirror 编辑器补齐 `indentWithTab`、`defaultKeymap`、`historyKeymap` 标准 keymaps
- 建立快捷键与 Command Store 的桥接机制（command shortcut → keydown 自动绑定）

**Non-Goals:**
- 不重构组件级 Escape 键处理（CommandPalette、MenuBar 等各自管理的 Escape 逻辑保留）
- 不实现快捷键自定义/重映射功能（v2.0 范畴）
- 不实现快捷键冲突检测（当前命令数量有限，暂不需要）
- 不修改 `useKeyboardNavigation` hook（容器内方向键导航是独立关注点）

## Decisions

### 决策 1：useKeyboardShortcuts 作为独立 hook（非 Store）

**选择**：创建纯 React hook `useKeyboardShortcuts(shortcuts: ShortcutConfig[])`
**替代方案**：
- A) 在 `useCommandStore` 中内建快捷键绑定 → 拒绝，因为 Store 不应直接操作 DOM（addEventListener）
- B) 创建独立的 `useShortcutStore` Zustand Store → 拒绝，过度设计，hook 更简单且与组件生命周期自然绑定

**理由**：hook 模式与测试文件 API 完全匹配，`renderHook(() => useKeyboardShortcuts(shortcuts))` 可直接测试，挂载/卸载自动管理监听器生命周期。

### 决策 2：修饰键匹配策略 — 精确匹配

**选择**：快捷键匹配要求**所有修饰键状态完全一致**
- 定义 `{ key: 'p', ctrlKey: true, shiftKey: true }` 时，`Ctrl+P`（无 Shift）不触发
- 未指定的修饰键默认为 `false`

**理由**：测试用例 "does not trigger export PDF when only Cmd+P is pressed" 明确要求此行为。

### 决策 3：macOS 兼容 — ctrlKey 透明映射

**选择**：shortcut 配置统一使用 `ctrlKey: true`，hook 内部在 macOS 上将其映射为 `metaKey` 检查
**替代方案**：
- 让调用方分别配置 ctrlKey/metaKey → 拒绝，增加调用复杂度
- 同时检查 ctrlKey 和 metaKey → 存在冲突风险

**理由**：测试文件显示 JSDOM 下 `navigator.platform` 为空（isMac=false），使用 `ctrlKey` 测试，说明 hook 内部做平台适配。

### 决策 4：CodeMirror keymaps — 增量添加，不替换

**选择**：在现有 `keymap.of([...closeBracketsKeymap, ...listContinuation()])` 基础上**追加** `defaultKeymap`、`historyKeymap`、`indentWithTab`
**替代方案**：完全重写 extensions 列表 → 风险太大，可能破坏现有行为

**注意**：`defaultKeymap` 包含 Ctrl+Z/Y 等编辑快捷键，`historyKeymap` 需要同时添加 `history()` extension。`indentWithTab` 需要从 `@codemirror/commands` 导入。keymap 的优先级：closeBracketsKeymap 优先于 defaultKeymap，listContinuation 优先于默认 Enter 行为。

### 决策 5：AppV2 快捷键迁移 — 渐进式替换

**选择**：在 AppV2 中调用 `useKeyboardShortcuts`，传入与当前内联逻辑等价的快捷键配置数组，然后删除旧的 `useEffect`
**步骤**：
1. 编写 `useKeyboardShortcuts` 实现
2. 在 AppV2 中引入 hook，配置完全等价的快捷键列表
3. 验证通过后删除旧 `useEffect`（第 174-195 行）
4. 运行测试确认无回归

## Risks / Trade-offs

- **[Risk] 全局快捷键与 CodeMirror 编辑器快捷键冲突** → Mitigation: 编辑器内的快捷键（Ctrl+B 加粗等）由 CodeMirror keymap 在编辑器聚焦时优先处理；全局 hook 通过 `document.addEventListener` 在冒泡阶段监听，CodeMirror 的 `preventDefault()` 会阻止事件到达全局监听器
- **[Risk] indentWithTab 影响 Tab 键焦点导航** → Mitigation: `indentWithTab` 仅在编辑器 focused 时拦截 Tab 键，不影响其他组件的 Tab 导航
- **[Risk] 测试文件引用了 `AppProvider`（旧 Context API）** → Mitigation: `.test.tsx` 中的 wrapper 使用了 `AppProvider`，如该 Context 已废弃，需要更新测试 wrapper 为 Zustand 兼容版本
- **[Trade-off] 不做命令-快捷键自动绑定** → 当前阶段手动在 AppV2 中配置快捷键列表，而非自动从 CommandStore 读取 shortcut 字段绑定。这简化了实现但增加了维护成本。未来可考虑增加自动绑定层。
