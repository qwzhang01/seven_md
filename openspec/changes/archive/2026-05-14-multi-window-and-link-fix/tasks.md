## 1. Markdown 链接拦截与导航（Bug 修复，优先级最高）

- [x] 1.1 创建链接导航工具模块 `src/utils/linkNavigation.ts`，实现链接类型分类函数（anchor / external / internal-md / unknown）
- [x] 1.2 创建路径解析工具函数 `resolveMarkdownLink(href, currentFilePath)`，基于当前文件目录解析相对路径为绝对路径，处理 `./`、`../`、裸文件名、URL 编码和中文路径
- [x] 1.3 在 `useFileStore.ts` 中新增 `openFileByPath(absolutePath: string)` action，实现读取文件并创建/激活标签页
- [x] 1.4 修改 `PreviewPaneV2.tsx` 的 `<a>` 自定义组件，添加 `onClick` 拦截器，调用链接导航逻辑：阻止默认行为、区分链接类型、分别处理
- [x] 1.5 实现锚点链接处理：通过 `document.getElementById` 在预览面板容器内查找目标元素并 `scrollIntoView({ behavior: 'smooth' })`
- [x] 1.6 实现外部链接处理：使用 Rust 自定义命令 `open_external_url` 在系统默认浏览器中打开 HTTP/HTTPS 链接
- [x] 1.7 实现内部 `.md` 链接处理：调用 `resolveMarkdownLink` 解析路径后调用 `openFileByPath`，文件不存在时显示通知 "文件未找到"

## 2. Workspace Store 增强

- [x] 2.1 在 `useWorkspaceStore.ts` 中新增 `openFolderByPath(path: string)` action，跳过系统文件夹选择弹窗，直接加载指定路径的目录树并启动文件监控
- [x] 2.2 添加错误处理：路径不存在时保持 `folderPath` 为 null 并显示通知
- [x] 2.3 添加逻辑：如果已有文件夹打开，先调用 `closeFolder()` 清理旧状态再打开新文件夹

## 3. Rust 后端多窗口上下文传递

- [x] 3.1 修改 `src-tauri/src/main.rs` 中 `create_new_window` 命令签名，添加 `initial_folder: Option<String>` 参数
- [x] 3.2 修改窗口 URL 构建逻辑：当 `initial_folder` 有值时，将路径 URL 编码后作为 `?folder=` query parameter 拼接到 `index.html` URL 中
- [x] 3.3 更新前端 `tauriCommands.ts` 中 `createNewWindow` 的 invoke 调用，支持传入可选的 `initialFolder` 参数

## 4. 前端窗口初始化读取上下文

- [x] 4.1 在 `AppV2.tsx` 初始化逻辑中添加 URL 参数解析，读取 `window.location.search` 中的 `folder` 参数
- [x] 4.2 如果 `folder` 参数存在且非空，自动调用 `useWorkspaceStore.openFolderByPath(decodedPath)`
- [x] 4.3 确保自动打开文件夹的操作在应用初始化完成后（store 就绪、事件监听注册后）执行

## 5. 菜单与操作集成

- [x] 5.1 在菜单系统中添加 "在新窗口中打开文件夹" 选项，触发时弹出系统文件夹选择器，选择后调用 `create_new_window(initial_folder)` 传入路径
- [x] 5.2 确保 Ctrl/Cmd+Shift+N 快捷键创建的新窗口传入空参数（保持空白窗口行为）
- [x] 5.3 审查菜单事件广播逻辑：确认 `AppHandle::emit` 是否需要改为 `Window::emit` 以避免多窗口菜单事件冲突

## 6. 测试与边界验证

- [x] 6.1 手动测试：预览面板中点击 `./xxx.md` 相对链接能在当前窗口新标签页打开
- [x] 6.2 手动测试：预览面板中点击 `https://` 外部链接能在系统浏览器打开
- [x] 6.3 手动测试：预览面板中点击 `#heading` 锚点能平滑滚动到对应位置
- [x] 6.4 手动测试：创建新窗口并传入文件夹路径，新窗口自动打开目录树
- [x] 6.5 手动测试：两个窗口各自打开不同文件夹，编辑互不干扰
- [x] 6.6 边界测试：链接指向不存在的 `.md` 文件时显示"文件未找到"通知
- [x] 6.7 边界测试：中文路径、带空格路径的 markdown 链接能正确解析
