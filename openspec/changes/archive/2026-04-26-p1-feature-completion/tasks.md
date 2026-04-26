## 1. Help 菜单模态框

- [x] 1.1 创建 `src/components/dialogs/ShortcutReferenceDialog.tsx`：从 `useCommandStore` 读取所有含 `shortcut` 字段的命令，按 category 分组渲染表格（命令名 + 快捷键），支持 ESC/overlay 关闭
- [x] 1.2 创建 `src/components/dialogs/AboutDialog.tsx`：显示应用名称、版本号、MIT 许可证、技术栈信息（Tauri v2 + React 19 + TypeScript + CodeMirror 6），支持 ESC/overlay 关闭
- [x] 1.3 在 `useUIStore` 中添加 `dialogType` 状态（`'shortcut-reference' | 'about' | null`）和 `setDialogType` action
- [x] 1.4 修改 Help 菜单事件处理（AppV2.tsx 中 listen handlers）：快捷键参考 → `setDialogType('shortcut-reference')`，关于 → `setDialogType('about')`，欢迎页和检查更新 → `addNotification` 显示"功能开发中"
- [x] 1.5 在 `AppV2.tsx` 中挂载 `ShortcutReferenceDialog` 和 `AboutDialog`，根据 `dialogType` 条件渲染

## 2. 右键菜单"格式化文档"

- [x] 2.1 在 `EditorContextMenu.tsx` 的 `menuItems` 数组中添加"📝 格式化文档"项（位于"查找"和"AI 改写"之间），action 为 `dispatch('editor:format')`
- [x] 2.2 在 `EditorPaneV2.tsx` 中添加 `editor:format` 事件监听：获取当前文档内容，应用格式化规则（合并多余空行为2行、去除尾部空格但保留 Markdown 换行、确保末尾换行符），通过单次 `view.dispatch` 替换文档

## 3. AI 服务层与三模式实现

- [x] 3.1 创建 `src/services/aiService.ts`：定义 `AIServiceConfig` 接口（apiKey、endpoint、model），实现 `getAIConfig()`/`setAIConfig()` 读写 localStorage，导出 `aiChat(messages)`、`aiRewrite(text, style)`、`aiTranslate(text, direction)`、`aiExplain(text)` 四个方法，统一错误处理
- [x] 3.2 修改 `ChatMode.tsx`：将 mock 回复替换为调用 `aiService.aiChat()`，保留现有 UI（消息列表、输入框、错误重试）。未配置 API Key 时显示引导提示 + 设置按钮
- [x] 3.3 修改 `RewriteMode.tsx`：为风格按钮添加触发逻辑（选中风格后自动调用 `aiService.aiRewrite(selectedText, style)`），为"应用改写"按钮添加 `onClick`（dispatch `editor:replace-selection` 事件替换编辑器选中文本）
- [x] 3.4 修改 `TranslateMode.tsx`：为翻译方向按钮添加触发逻辑，为"应用翻译"按钮添加 `onClick`
- [x] 3.5 修改 `ExplainMode.tsx`：添加"解释"触发按钮，调用 `aiService.aiExplain(selectedText)` 并显示结果
- [x] 3.6 在 `EditorPaneV2.tsx` 的 `EditorView.updateListener` 中添加选中文本同步：当 `selectionSet` 时获取选中文本并调用 `useAIStore.setSelectedText()`

## 4. 状态栏功能补齐

- [x] 4.1 在 Rust 后端 `commands.rs` 中添加 `get_git_branch` 命令（执行 `git branch --show-current`，失败时返回空字符串），在 `main.rs` 中注册
- [x] 4.2 在 `tauriCommands.ts` 中添加 `getGitBranch()` 封装函数
- [x] 4.3 修改 `StatusBar.tsx`：移除 props 硬编码，改为从 `useWorkspaceStore.folderPath` 读取并调用 `getGitBranch()`，5 秒轮询，非 Git 目录或无工作区时显示 "—"
- [x] 4.4 为行号按钮添加 `onClick`：弹出 prompt 输入行号后 dispatch `editor:jump-to-line` 事件
- [x] 4.5 为编码/换行符按钮添加 `onClick`：显示 info notification "当前编码: UTF-8" / "当前换行符: LF"
- [x] 4.6 修改同步状态显示：从 `useFileStore` 读取当前 tab 的 `isDirty` 状态，`isDirty=true` 时显示 "未保存" + 旋转图标，`false` 时显示 "已保存"

## 5. 编辑器-预览滚动同步

- [x] 5.1 在 `useEditorStore` 中添加 `scrollSyncEnabled: boolean`（默认 `false`）和 `scrollRatio: number`（默认 `0`）及对应 setter + `toggleScrollSync`
- [x] 5.2 在 `EditorPaneV2.tsx` 中监听 CodeMirror scroller 的原生 scroll 事件：计算 `scrollTop / (scrollHeight - clientHeight)` 比例，使用 `requestAnimationFrame` 节流后更新 `useEditorStore.scrollRatio`
- [x] 5.3 在 `PreviewPaneV2.tsx` 中订阅 `useEditorStore.scrollRatio`：当 `scrollSyncEnabled=true` 且 view mode 为 `split` 时，设置预览容器 `scrollTop = scrollRatio * (scrollHeight - clientHeight)`，使用 `isExternalScroll` flag 防止循环
- [x] 5.4 在状态栏中添加滚动同步 toggle 开关（ArrowUpDown 图标按钮）

## 6. 集成验证

- [x] 6.1 确认所有新增对话框支持 ESC 关闭和 overlay 点击关闭 ✓（代码实现包含 ESC keydown + overlay click）
- [x] 6.2 确认 AI 服务层在未配置 API Key 时优雅降级 ✓（ChatMode 提示配置，其他模式显示错误通知）
- [x] 6.3 确认状态栏在无工作区时所有按钮正常显示且不报错 ✓（folderPath=null 时 branch 显示 "—"）
- [x] 6.4 确认滚动同步在 editor-only 和 preview-only 模式下不执行 ✓（useEffect 中检查 viewMode === 'split'）
