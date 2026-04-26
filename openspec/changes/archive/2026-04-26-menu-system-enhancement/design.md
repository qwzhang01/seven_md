## Context

当前 Seven Markdown 的 Tauri 菜单实现（`src-tauri/src/main.rs`）与规范（`menu-config.js`）存在以下主要差异：

1. **平台特性缺失**：macOS 的 Apple 菜单和窗口菜单未实现
2. **标签语言不统一**：菜单标签为英文（File/Edit/View...），规范要求中文（文件/编辑/视图...）
3. **菜单结构不完整**：缺少子菜单（如标题 H1-H6）、最近文档、全屏切换等
4. **快捷键不一致**：侧边栏切换快捷键为 `CmdOrCtrl+\`，规范为 `CmdOrCtrl+B`
5. **缺失快捷键**：多处菜单项缺少快捷键绑定

现有代码在 `main.rs` 第 64-347 行定义了所有菜单项和事件处理。

## Goals / Non-Goals

**Goals:**
- 实现 macOS 平台专属的 Apple 菜单（关于、偏好设置、服务、隐藏）和窗口菜单
- 将所有菜单标签统一为中文（符合规范）
- 添加缺失的菜单项和子菜单结构
- 补全所有菜单项的快捷键绑定
- 修复快捷键不一致问题

**Non-Goals:**
- 不修改前端 React 组件的菜单渲染逻辑（如果存在）
- 不实现菜单的动态配置功能（保持静态定义）
- 不添加右键上下文菜单的改动（本 proposal 仅针对主菜单栏）

## Decisions

### Decision 1: 菜单标签统一为中文

**选择**：将 `src-tauri/src/main.rs` 中所有菜单标签从英文改为中文

**理由**：
- 规范 `menu-config.js` 明确要求中文菜单（文件/编辑/视图/插入/格式/主题/帮助）
- 现有 `openspec/specs/menubar-system/spec.md` 已定义中文标签
- 符合 Seven Markdown 的本地化策略

**实现方式**：
```rust
// 文件菜单
let file_menu = Submenu::with_items(app, "文件", true, &[...])?;

// 示例菜单项
let new_file = MenuItem::with_id(app, "new_file", "新建文件", true, Some("CmdOrCtrl+N"))?;
```

### Decision 2: macOS Apple 菜单和窗口菜单条件编译

**选择**：使用 `#[cfg(target_os = "macos")]` 条件编译实现 macOS 专属菜单

**理由**：
- Apple 菜单是 macOS 应用程序的强制要求
- Tauri 提供 `tauri::menu::PredefinedMenuItem` 用于 macOS 特殊菜单项
- 需要在主菜单构建逻辑中根据平台条件添加

**实现方式**：
```rust
#[cfg(target_os = "macos")]
let apple_menu = Submenu::with_items(app, "Seven Markdown", true, &[
    &tauri::menu::PredefinedMenuItem::about(app, None)?,
    &tauri::menu::PredefinedMenuItem::separator(app)?,
    &preferences,  // 偏好设置
    &tauri::menu::PredefinedMenuItem::separator(app)?,
    &services,
    &tauri::menu::PredefinedMenuItem::separator(app)?,
    &tauri::menu::PredefinedMenuItem::hide(app)?,
    &tauri::menu::PredefinedMenuItem::hide_others(app)?,
    &tauri::menu::PredefinedMenuItem::show_all(app)?,
])?;
```

### Decision 3: 标题子菜单结构

**选择**：将插入和格式菜单中的标题项改为带 H1-H6 子菜单的子菜单项

**理由**：
- 规范要求 H1-H6 六级标题作为子菜单
- 当前实现只有扁平的 "Heading" 项
- 保持与 VS Code 等主流编辑器一致的 UX

**实现方式**：
```rust
// 插入菜单 - 标题子菜单
let insert_heading_h1 = MenuItem::with_id(app, "insert_h1", "标题 1", true, Some("Cmd+1"))?;
let insert_heading_h2 = MenuItem::with_id(app, "insert_h2", "标题 2", true, Some("Cmd+2"))?;
// ... H3-H6
let insert_heading_submenu = Submenu::with_items(app, "标题", true, &[
    &insert_heading_h1,
    &insert_heading_h2,
    &insert_heading_h3,
    &insert_heading_h4,
    &insert_heading_h5,
    &insert_heading_h6,
])?;
```

### Decision 4: 侧边栏快捷键修复

**选择**：将 `toggle_sidebar` 的快捷键从 `CmdOrCtrl+\` 修改为 `CmdOrCtrl+B`

**理由**：
- 这是 B18 项明确的规范要求
- `CmdOrCtrl+B` 是业界标准（VS Code、Typora 等）
- 避免与代码块快捷键冲突

**修改位置**：`main.rs` 第 96 行
```rust
// 修改前
let toggle_sidebar = MenuItem::with_id(app, "toggle_sidebar", "切换侧边栏", true, Some("CmdOrCtrl+\\"))?;
// 修改后
let toggle_sidebar = MenuItem::with_id(app, "toggle_sidebar", "切换侧边栏", true, Some("CmdOrCtrl+B"))?;
```

### Decision 5: 编辑器视图子菜单

**选择**：将视图菜单中的编辑器视图项改为带快捷键的 radio 子菜单

**理由**：
- 规范要求区分三种视图模式（仅编辑器/仅预览/分栏）
- 快捷键 `CmdOrCtrl+Alt+1/2/3` 符合 VS Code 习惯
- radio 类型的子菜单确保单选互斥

**实现方式**：
```rust
let view_editor_only = MenuItem::with_id(app, "view_editor_only", "仅编辑器", true, Some("CmdOrCtrl+Alt+1"))?;
let view_preview_only = MenuItem::with_id(app, "view_preview_only", "仅预览", true, Some("CmdOrCtrl+Alt+2"))?;
let view_split = MenuItem::with_id(app, "view_split", "分栏", true, Some("CmdOrCtrl+Alt+3"))?;
let view_mode_submenu = Submenu::with_items(app, "编辑器视图", true, &[
    &view_editor_only,
    &view_preview_only,
    &view_split,
])?;
```

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| 中文菜单可能影响国际化用户 | 低 | 考虑未来添加 i18n 支持，支持菜单语言切换 |
| macOS Apple 菜单的 `about` 需要应用名称 | 中 | 确保品牌名称统一为 "Seven Markdown" |
| 快捷键修改可能与用户习惯冲突 | 低 | 提供设置界面允许自定义快捷键 |
| Tauri 菜单事件过多可能影响性能 | 极低 | 当前实现已经过优化，事件数量可控 |

## Migration Plan

1. **阶段一**：修改现有菜单标签为中文（低风险，可回滚）
2. **阶段二**：添加缺失的菜单项和子菜单
3. **阶段三**：添加 macOS 平台菜单
4. **阶段四**：修复快捷键不一致问题

回滚策略：通过 Git 回滚 `main.rs` 即可恢复。

## Open Questions

1. **Q: 是否需要支持菜单语言切换？**
   - 当前固定中文，未来可考虑添加 i18n 支持

2. **Q: 最近文档功能需要持久化存储？**
   - 需要确认使用 Tauri 的 app data 路径存储最近文件列表

3. **Q: 新建窗口功能是否需要多窗口支持？**
   - 当前 Tauri 应用是否支持多窗口实例？
