## Context

Seven Markdown 是一个基于 Tauri + React 的桌面 Markdown 编辑器。当前版本存在两个体验问题：

1. **大纲导航失效**：`OutlinePanel` 通过 `CustomEvent('editor:jump-to-line')` 通知编辑器跳转，编辑器在 `EditorPaneV2` 中监听。但当 viewMode 为 `preview-only` 时编辑器未渲染，事件无人处理；即使在 `split` 模式下，如果编辑器还未初始化完成（viewRef.current 为 null），跳转也会静默失败。
2. **文件外部变更不更新已打开 Tab**：`fs-watch:changed` 事件当前只触发 `refreshTree()`（刷新目录树），已打开的 Tab 内容不会被重新读取。

技术栈：React 18 + Zustand + Tauri (Rust) + CodeMirror 6 + TailwindCSS

## Goals / Non-Goals

**Goals:**
- 大纲点击在所有三种视图模式下都能正确导航（编辑器模式跳编辑器，预览模式跳预览锚点，分屏模式两者同步）
- 文件外部变更后，未修改的已打开 Tab 自动重载最新内容；有未保存修改的 Tab 显示冲突提示

**Non-Goals:**
- 不改变 Gutter（编辑器/预览分隔条）的实现，它工作正常
- 不做预览面板的实时滚动同步（scroll-sync 是独立 feature）
- 不做文件锁或 OT/CRDT 协同编辑能力
- 不改变 fs-watch 后端的轮询机制（800ms 间隔）

## Decisions

### Decision 1: 大纲导航多模式路由

**选择**：在 `OutlinePanel.handleHeadingClick` 中根据当前 `viewMode` 分发不同事件：
- `editor-only` / `split`：发射 `editor:jump-to-line`（编辑器滚动）
- `preview-only`：发射 `preview:scroll-to-heading`（预览面板滚动到对应 heading 锚点）
- `split`：同时发射两个事件

**替代方案**：
- 只导航编辑器，preview-only 时自动切换到 split → 改变用户预期的视图模式
- 在预览面板中注入 id 锚点，使用 scrollIntoView → 这正是我们的实现方式

**理由**：尊重用户的视图模式选择，在当前可见的面板中完成导航。

### Decision 2: 文件热重载策略

**选择**：在 `fs-watch:changed` 回调中，除了刷新目录树外，遍历所有已打开的 Tab：
1. 对有 `path` 且 `isDirty === false` 的 Tab，调用 `readFile(path)` 获取最新内容，若与 Tab 当前内容不同则更新
2. 对有 `path` 且 `isDirty === true` 的 Tab，不自动覆盖，而是在 Tab 标签上显示一个"文件已变更"图标提示，用户可选择重新加载或保留本地版本

**替代方案**：
- 使用 Tauri 的 notify-rs 精确文件监控 → 需要修改 Rust 后端，改动大
- 每次 focus 窗口时检查 → 不够实时，且窗口 focus 事件在 Tauri 中不可靠
- 对所有 Tab 无条件强制覆盖 → 会丢失用户未保存的修改

**理由**：在不修改 Rust 后端的前提下，利用现有 `fs-watch:changed` 事件（已经能检测目录变更），在前端增量重载。对未修改的文件无感刷新，对有修改的文件尊重用户选择。

### Decision 3: 文件内容比对优化

**选择**：使用简单字符串比较 (`!==`) 判断文件内容是否变化。不引入 diff 算法。

**理由**：Markdown 文件通常不大（< 1MB），字符串比较成本低。只在内容确实不同时才更新 Tab 和触发编辑器重渲染，避免无谓的状态更新。

## Risks / Trade-offs

- **[并发读取性能]** 打开大量 Tab 时，每次 fs-watch 事件都重载所有文件可能导致短暂卡顿 → 缓解：添加防抖（已有 500ms），并限制并发 `readFile` 数量（Promise.allSettled + 最多 5 个并行）
- **[竞态条件]** 用户正在编辑时文件被外部修改 → 缓解：`isDirty` 检查确保不覆盖，加锁避免重载过程中状态被覆盖
- **[预览面板 heading 锚点匹配]** Markdown 渲染后的 heading id 生成规则可能与 parseHeadings 解析的文本不完全匹配（如特殊字符） → 缓解：使用 slugify 统一 id 生成逻辑
