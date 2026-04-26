## Why

当前 Seven Markdown 的快捷键系统与交互说明存在明显差异，多个规范中定义的快捷键未在代码中实现，影响用户工作效率和操作一致性。这些缺失的快捷键覆盖了面板切换、窗口管理、查找替换和文本编辑等核心功能，需要全面补全以对齐规范要求。

## What Changes

### 新增功能
- **Ctrl+Shift+E**：打开资源管理器面板
- **Ctrl+Shift+F**：打开搜索面板
- **Ctrl+Shift+O**：打开大纲/大纲视图面板
- **Ctrl+W**：关闭当前标签页
- **Ctrl+H**：打开查找+替换栏
- **Ctrl+B**：在编辑模式下应用加粗格式
- **Ctrl+I**：在编辑模式下应用斜体格式
- **Ctrl+K**：在编辑模式下插入链接

### 修改功能
- **侧边栏切换快捷键修正**：从 `Ctrl+\` 改为 `Ctrl+B`（与规范一致，避免与加粗快捷键冲突）
- **编辑格式快捷键重新映射**：确保 `Ctrl+B` 在编辑时为加粗，非编辑时为侧边栏切换

## Capabilities

### New Capabilities
- `panel-focus-shortcuts`：面板焦点切换快捷键组（资源管理器、搜索、大纲）
- `window-tab-shortcuts`：窗口和标签管理快捷键
- `inline-format-shortcuts`：内联文本格式快捷键（加粗、斜体、链接）

### Modified Capabilities
- `keyboard-shortcuts-hook`：扩展快捷键注册表，添加缺失的全局和上下文快捷键
- `sidebar-collapse-all`：修正侧边栏切换快捷键绑定

## Impact

### 受影响代码
- `src/AppV2.tsx`：快捷键注册逻辑（shortcuts 数组扩展）
- `src/hooks/useKeyboardShortcuts.ts`：全局快捷键 Hook
- `src/components/FindReplaceBar.tsx`：Ctrl+H 触发逻辑
- `src/commands/index.ts`：编辑格式命令与快捷键绑定

### 依赖项
- 依赖 `keyboard-shortcuts-hook` 规格中定义的快捷键注册机制
- 需与 `find-replace` 规格协调 Ctrl+H 行为
- 需与 `sidebar-explorer`、`sidebar-search`、`sidebar-outline` 规格协调面板切换

### 系统影响
- 快捷键需在编辑器编辑模式和命令模式间正确切换上下文
- 避免与其他已注册快捷键冲突（如 `Ctrl+B` 侧边栏切换需重新评估）
