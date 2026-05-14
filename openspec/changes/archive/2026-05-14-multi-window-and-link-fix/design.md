## Context

Seven Markdown 是一个基于 Tauri v2 + React 19 的桌面 Markdown 编辑器。当前的窗口管理和链接处理存在两个核心问题：

**多窗口现状**：
- Rust 后端已有 `create_new_window` 命令，可创建新窗口（label 为 `window-{timestamp}`）
- 新窗口加载同一个 `index.html`，每个窗口拥有独立的 React 应用实例和 Zustand store
- 但创建新窗口时**没有上下文传递机制**——无法指定新窗口打开哪个文件夹
- `useWorkspaceStore` 是全局单例设计，没有窗口 ID 的概念
- 菜单事件通过 `AppHandle::emit()` 广播给所有窗口，没有窗口级事件隔离

**链接处理现状**：
- `PreviewPaneV2.tsx` 中 `<a>` 标签直接使用 `href` 渲染，无点击拦截
- 点击内部 `.md` 链接导致 WebView 导航离开应用（白屏）
- 点击外部链接受 CSP 限制失败
- 不支持 `#heading` 锚点滚动

## Goals / Non-Goals

**Goals:**
- 每个窗口可独立打开一个文件夹，窗口间状态完全隔离
- 创建新窗口时可传递初始文件夹路径，新窗口自动打开指定目录
- 预览面板中点击 `.md` 链接在当前窗口新标签页中打开对应文件
- 预览面板中点击外部 URL 通过系统默认浏览器打开
- 预览面板中点击 `#heading` 锚点实现平滑滚动定位

**Non-Goals:**
- 不实现多工作区（一个窗口打开多个文件夹）——每个窗口仅绑定一个文件夹
- 不实现窗口间拖拽文件/标签页传递
- 不实现窗口间状态同步或共享剪贴板
- 不实现窗口布局记忆/恢复（关闭后重新打开不记住上次布局）
- 不处理非 `.md` 格式的内部链接（如 `.pdf`、`.png`）

## Decisions

### 决策 1：窗口上下文传递方案 — 使用 URL Query Parameter

**选择**: 新窗口通过 URL query parameter 传递初始文件夹路径

**方案**:
- Rust 端 `create_new_window` 接受可选参数 `initial_folder: Option<String>`
- 构建新窗口 URL 为 `index.html?folder=/path/to/dir`（对路径进行 URL 编码）
- 前端 `AppV2.tsx` 初始化时读取 `window.location.search` 中的 `folder` 参数
- 如果存在 `folder` 参数，自动调用 `useWorkspaceStore.openFolderByPath(path)` 打开目录

**替代方案**:
1. ~~Tauri window data/userdata~~：Tauri v2 的 `WebviewWindowBuilder` 不支持自定义 data 属性传递
2. ~~后端全局状态映射~~：需要前端主动查询，增加复杂度且存在时序问题
3. ~~LocalStorage 共享~~：各窗口共享同一个 localStorage，会导致状态冲突

**理由**: URL parameter 是最简单且可靠的跨窗口上下文传递方式，Tauri 的 `WebviewUrl::App` 支持带 query string 的路径。

### 决策 2：Store 隔离方案 — 天然隔离，无需改造

**选择**: 利用 Tauri 窗口的天然隔离特性，每个窗口独立的 React 实例已经拥有独立的 Zustand store

**分析**:
- 每个 Tauri 窗口加载独立的 `index.html`，运行独立的 JavaScript 上下文
- Zustand store 是内存中的 JavaScript 对象，天然按窗口隔离
- `useUIStore` 使用 `persist` 中间件存到 localStorage——**需要注意**: 同源窗口共享 localStorage，可能导致 UI 偏好冲突
- 解决方案: 为 `useUIStore` 的 persist key 加上窗口标识前缀，或接受所有窗口共享 UI 偏好（主题、语言等共享是合理的）

**理由**: 不需要为多窗口做 store 层面的重构，当前架构已经天然支持。

### 决策 3：文件监控按窗口隔离

**选择**: 每个窗口各自调用 `startFsWatch`，监控自己的 `folderPath`

**分析**:
- 当前 `startFsWatch` 在 Rust 端使用 `notify` crate，通过 window emit 事件通知前端
- 每个窗口已有自己的 workspace store 和 folderPath
- Rust 端的 `fs_watch` 命令绑定到调用它的窗口（通过 `Window` 参数），事件只发送给该窗口
- 无需额外改造

### 决策 4：链接拦截方案 — React 组件级 onClick 拦截

**选择**: 在 `PreviewPaneV2.tsx` 的 `react-markdown` 自定义组件中为 `<a>` 标签添加 `onClick` 拦截

**方案**:
```
a: ({ href, children }) => {
  onClick = (e) => {
    e.preventDefault()  // 阻止默认导航
    if (href 以 # 开头) → 锚点滚动
    else if (href 是绝对 URL) → shell.open(href) 系统浏览器
    else if (href 以 .md/.markdown 结尾) → 解析为本地路径，readFile + openTab
    else → 忽略或提示不支持
  }
  return <a onClick={onClick}>{children}</a>
}
```

**链接类型判断逻辑**:
1. `#xxx` → 锚点链接，在预览面板内通过 `document.getElementById` 滚动
2. `http://` / `https://` → 外部链接，使用 `@tauri-apps/plugin-shell` 的 `open()` 打开系统浏览器
3. `./xxx.md` / `../xxx.md` / `xxx.md` → 相对路径，基于当前文件所在目录解析为绝对路径，然后 `readFile` + `openTab`
4. 其他（无扩展名、非 md 扩展名）→ 忽略或尝试作为 md 处理

**替代方案**:
1. ~~全局 WebView 导航拦截~~（Tauri 的 `on_navigation`）：过于底层，难以区分应用内路由和链接点击
2. ~~事件委托在 document 级别~~：与 React 虚拟 DOM 冲突，不推荐

**理由**: React 组件级拦截最干净、可测试、无副作用。

### 决策 5：路径解析策略

**选择**: 基于当前打开文件的目录解析相对链接路径

**方案**:
- 从 `useFileStore` 获取当前活动标签页的 `filePath`
- 使用 `path.dirname(filePath)` 获取所在目录
- 使用 `path.resolve(dir, href)` 解析出绝对路径
- 将路径标准化（处理 `..` 和 `.`）
- 调用 Rust 端 `readFile` 读取文件内容
- 如果文件不存在，显示通知提示"文件未找到"

**注意**: 前端使用纯 JS 路径处理（无 Node.js path 模块），需要自行实现或使用轻量库。Tauri 环境下可通过 `@tauri-apps/api/path` 提供的 `resolve`、`dirname`、`join` 等函数处理。

## Risks / Trade-offs

**[LocalStorage 冲突]** → 所有窗口共享 localStorage，`useUIStore` 的 persist 可能导致窗口间 UI 状态互相覆盖
→ **缓解**: UI 偏好（主题、语言、侧边栏宽度）全局共享是合理行为，不视为冲突。如果未来需要窗口级 UI 状态，再加 window label 前缀。

**[菜单事件广播]** → `AppHandle::emit()` 会将菜单事件广播给所有窗口，如"打开文件夹"事件可能在非活跃窗口也触发弹窗
→ **缓解**: 将菜单事件改为 `Window::emit()` 仅发送给触发菜单的窗口，或在前端过滤非 focused 窗口的事件。

**[相对路径解析边界]** → 某些 Markdown 链接可能指向工作区外的文件（如 `../../outside/file.md`）
→ **缓解**: 允许打开工作区外的文件（只要文件存在），但不将其添加到文件树中。

**[链接格式多样性]** → Markdown 链接格式多样（URL 编码、中文路径、带空格路径等）
→ **缓解**: 使用 `decodeURIComponent` 处理 URL 编码，Tauri 的 Rust 后端天然支持 Unicode 路径。
