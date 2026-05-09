## Context

Seven Markdown 是基于 Tauri + React + Tailwind 构建的桌面 Markdown 编辑器。当前 UI 层面存在两个与 Web 默认行为冲突的问题：

1. **文本选择**：应用未全局禁用非编辑区域的 `user-select`。用户在工具栏、侧边栏、标签栏等 UI chrome 区域拖拽鼠标时，会触发浏览器默认的文本选择行为（蓝色高亮全选效果），严重影响桌面应用体验。
2. **右键菜单**：仅编辑器、资源管理器、标签页三个区域注册了自定义 contextmenu。在预览面板、标签栏空白处、主编辑区空白处等未覆盖的区域右键点击，会弹出 Tauri WebView 的默认开发者菜单（包含 Reload/Inspect 等选项）。

现有右键菜单组件（`EditorContextMenu`、`ExplorerContextMenu`、`TabContextMenu`）已建立了良好的设计模式：固定定位 + 主题化 CSS 变量 + ESC/外部点击关闭 + 无障碍标注。

## Goals / Non-Goals

**Goals:**
- 消除 UI chrome 区域的拖拽全选效果，使应用表现更接近原生桌面应用
- 全局阻止浏览器/WebView 默认右键菜单，杜绝 "Reload" 菜单出现
- 为每个主要区域提供合理的自定义右键菜单或显式"无菜单"处理
- 保持编辑器内容区和预览面板正文区的文本仍然可选可复制

**Non-Goals:**
- 不重写现有三个右键菜单组件的内部逻辑
- 不实现菜单项的可配置/自定义功能
- 不做原生系统级右键菜单（Tauri native menu），仍使用 Web 渲染菜单
- 不处理触控/长按右键场景

## Decisions

### Decision 1: 全局 user-select 策略

**选择**：在 `index.css` 的根元素上设置 `user-select: none`，然后在编辑器内容区域和预览面板正文区域恢复 `user-select: text`。

**理由**：
- 全局禁用 + 局部恢复（opt-in）比逐个组件禁用（opt-out）更安全，不会遗漏新增组件
- 符合 VS Code、Obsidian 等桌面编辑器的通行做法
- 编辑器核心使用 CodeMirror，其内部有自己的选择机制不受 CSS `user-select` 影响

**替代方案**：逐个为工具栏/侧边栏/标签栏设置 `user-select: none` → 维护成本高，容易遗漏

### Decision 2: 全局 contextmenu 拦截策略

**选择**：在 `AppV2.tsx` 组件挂载时注册全局 `document.addEventListener('contextmenu', handler)`，默认 `preventDefault()` 阻止所有浏览器默认菜单。各区域组件通过 `e.stopPropagation()` + 自己的菜单逻辑覆盖。

**理由**：
- 采用"默认阻止 + 区域覆盖"模式，确保任何遗漏区域都不会弹出开发者菜单
- 现有的 `EditorContextMenu`、`ExplorerContextMenu`、`TabContextMenu` 已经调用了 `e.preventDefault()`，无需修改
- 全局 handler 使用 `{ capture: true }` 确保在最外层拦截

**替代方案**：在 Tauri 配置中禁用 devtools context menu → 太过粗暴，且生产版本可能仍需要部分调试能力

### Decision 3: 区域右键菜单规划

| 区域 | 右键行为 | 实现方式 |
|------|----------|----------|
| 编辑器内容区 | 已有完整菜单 | 现有 `EditorContextMenu` 不变 |
| 预览面板正文 | 复制 / 复制为 Markdown / 全选 / 查找 | 新建 `PreviewContextMenu` 组件 |
| 资源管理器树 | 已有完整菜单 | 现有 `ExplorerContextMenu` 不变 |
| 标签页 | 已有完整菜单 | 现有 `TabContextMenu` 不变 |
| 标签栏空白处 | 新建文件 / 打开文件 / 打开最近文件 | 复用 `TabContextMenu` 扩展或新建 `TabBarContextMenu` |
| 侧边栏空白处 | 新建文件 / 新建文件夹 / 在 Finder 中打开 | 在 `ExplorerPanel` 中扩展空白区域的 contextmenu |
| 工具栏 | 静默（无菜单弹出） | 全局拦截兜底 |
| 状态栏 | 静默（无菜单弹出） | 全局拦截兜底 |
| 活动栏 | 静默（无菜单弹出） | 全局拦截兜底 |
| 其他空白区域 | 新建文件 / 打开文件 / 打开文件夹 / 命令面板 | 新建 `DefaultContextMenu` 兜底组件 |

**选择**：新增 `PreviewContextMenu` 和 `DefaultContextMenu` 两个组件，`TabBarContextMenu` 扩展标签栏空白处行为。

**理由**：
- 预览面板的复制需求高频且与编辑器菜单项不同，值得独立组件
- 默认兜底菜单覆盖所有未注册区域，提供基础操作入口
- 保持与现有菜单组件一致的设计模式和代码风格

### Decision 4: 菜单组件复用

**选择**：提取 `ContextMenuBase` 基础组件处理定位、主题、关闭逻辑，各具体菜单只定义菜单项数据。

**理由**：现有三个菜单组件有大量重复代码（定位计算、外部点击检测、ESC 关闭、渲染逻辑）。趁此机会统一抽取，降低后续维护成本。

**替代方案**：每个菜单继续独立实现 → 重复代码多，但改动范围更小。考虑到需要新增 2-3 个菜单组件，提取是值得的。

## Risks / Trade-offs

- **[全局 user-select: none 可能影响无障碍]** → 编辑器和预览面板已恢复 user-select: text，屏幕阅读器用户主要通过这两个区域操作文本，影响有限。
- **[CodeMirror 选择可能被干扰]** → CodeMirror 使用自己的选择系统（contenteditable + 自定义光标），不依赖 CSS user-select。已通过测试确认无影响。
- **[重构菜单基础组件可能引入回归]** → 采用渐进式方案：先提取 `ContextMenuBase`，新菜单使用新基类，现有菜单保持不变，后续可选迁移。
- **[预览面板的"复制为 Markdown"需要反向转换]** → 预览面板已有 HTML 内容，可使用 `turndown` 或从 store 中获取对应 Markdown 源文本片段。优先从 store 获取源文本。
