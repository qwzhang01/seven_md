## Why

Seven Markdown 当前的多窗口支持存在严重缺陷：新窗口创建后无法绑定独立的工作文件夹，所有窗口共享同一个空白状态，实际上不可用。同时，预览面板中的 Markdown 内部链接（如 `[文档](./other.md)`）点击后会导致 Tauri WebView 直接导航离开应用页面，造成白屏/崩溃——这是一个已知 Bug。这两个问题严重影响了用户在多项目场景下的工作效率和基本的文档浏览体验。

## What Changes

- **多窗口独立工作区**：每个窗口可以打开并绑定一个独立的文件夹，窗口之间的文件树、标签页、编辑状态完全隔离
- **窗口上下文传递**：创建新窗口时支持传入初始文件夹路径，新窗口自动打开指定目录
- **Rust 后端窗口-工作区映射**：后端维护窗口 label 与工作区路径的映射关系，支持文件监控按窗口隔离
- **Markdown 链接拦截与路由**：预览面板的链接点击行为改为拦截处理——内部 `.md` 链接解析为本地文件路径并在当前窗口新标签页打开，外部链接通过系统默认浏览器打开
- **锚点链接滚动**：支持 `#heading` 锚点链接在预览面板内平滑滚动定位

## Capabilities

### New Capabilities
- `multi-window-workspace`: 多窗口独立工作区管理——每个窗口可绑定独立文件夹，窗口间状态完全隔离，支持创建窗口时传递工作区上下文
- `markdown-link-navigation`: Markdown 链接导航——拦截预览面板中的链接点击，区分内部 `.md` 链接、外部 URL 和锚点链接，分别执行打开文件/打开浏览器/滚动定位

### Modified Capabilities
- `preview-pane`: 链接渲染组件需要新增点击拦截逻辑，集成 markdown-link-navigation 能力
- `workspace-store`: 工作区状态管理需要支持窗口级隔离，从全局单例改为按窗口实例化
- `tab-management`: 标签页管理需要适配多窗口场景，确保每个窗口维护独立的标签页列表

## Impact

- **Rust 后端** (`src-tauri/src/main.rs`): `create_new_window` 命令需要支持参数传递（初始文件夹路径），新增窗口-工作区映射管理
- **状态管理** (`src/stores/`): `useWorkspaceStore` 和 `useFileStore` 需要重构为窗口级实例化，或引入窗口 ID 隔离机制
- **预览面板** (`src/components/editor-v2/PreviewPaneV2.tsx`): `<a>` 标签渲染需要新增 `onClick` 拦截器，替换当前的直通行为
- **Tauri 命令封装** (`src/tauriCommands.ts`): 文件监控 (`startFsWatch`) 需要按窗口区分监控目标
- **应用入口** (`src/AppV2.tsx`): 窗口初始化流程需要读取窗口上下文参数并自动打开对应文件夹
- **依赖**: 无新增外部依赖，使用 Tauri v2 现有的 `@tauri-apps/api/webviewWindow` 和 `@tauri-apps/plugin-shell` 能力
