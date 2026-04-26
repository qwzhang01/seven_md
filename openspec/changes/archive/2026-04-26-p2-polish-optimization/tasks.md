## 1. 侧边栏折叠全部

- [x] 1.1 在 `ExplorerPanel.tsx` 中实现 `collapseAll()` 函数，递归折叠工作区树所有文件夹节点
- [x] 1.2 将"折叠全部"按钮的 onClick 绑定到 `collapseAll()` 函数
- [x] 1.3 处理无工作区时的边界情况（不报错、不操作）

## 2. 片段面板扩展模板

- [x] 2.1 在 `SnippetsPanel.tsx` 的代码分类中添加"Mermaid 流程图"片段定义（含 Mermaid 代码模板）
- [x] 2.2 在 `SnippetsPanel.tsx` 的代码分类中添加"API 文档"片段定义（含 API 文档 Markdown 模板）
- [x] 2.3 验证新增片段可被搜索功能检索到

## 3. 通知堆叠限制与间距

- [x] 3.1 在 `useNotificationStore.ts` 中添加 `MAX_NOTIFICATIONS = 5` 常量，`addNotification` 时检查数组长度，超出则移除最早的未暂停通知
- [x] 3.2 在 `NotificationContainer.tsx` 中为通知项之间添加 `gap-2`（8px）间距样式
- [x] 3.3 确保被 hover 暂停的通知不参与 FIFO 替换

## 4. 主题切换通知

- [x] 4.1 在 `ThemeMenu.tsx`（或 `useThemeStore.setTheme`）中，主题切换成功后调用 `addNotification({ type: 'info', message: '主题已切换为 xxx', autoClose: true, duration: 3000 })`

## 5. 命令面板 Lucide 图标

- [x] 5.1 在 `commands/index.ts` 的命令定义中新增可选 `icon` 字段（值为 Lucide 图标组件名字符串）
- [x] 5.2 为所有现有命令配置 Lucide 图标映射（如 FileText/Save/FolderOpen/Palette/Robot 等）
- [x] 5.3 在 `CommandPalette.tsx` 中创建 Lucide 图标映射表，渲染时通过 icon 字段查找并渲染对应 Lucide 组件，无映射时不显示图标

## 6. PDF 导出

- [x] 6.1 在 `commands/index.ts` 中添加"导出为 PDF"命令（`file.exportPdf`）
- [x] 6.2 在 `AppV2.tsx` 中监听 `app:export-pdf` 事件，触发 `window.print()`
- [x] 6.3 在 `src/index.css` 中添加 `@media print` CSS，隐藏侧边栏/工具栏/状态栏/编辑器/TabBar，只保留预览区内容
- [x] 6.4 实现 PDF 导出触发逻辑：`window.print()` 调用系统打印对话框
- [x] 6.5 在 Tauri 菜单配置中添加"导出为 PDF"菜单项

## 7. 侧边栏宽度拖拽

- [x] 7.1 在 `Sidebar.tsx` 右边缘添加 4px 宽的 resize handle div，hover 时显示高亮线条 + `col-resize` 光标
- [x] 7.2 实现 mousedown/mousemove/mouseup 拖拽逻辑，实时更新 `useUIStore.sidebarWidth`（clamp 180-500px）
- [x] 7.3 拖拽中全局光标保持 `col-resize`（通过 document.body.style.cursor）
- [x] 7.4 双击 resize handle 恢复默认宽度 260px
- [x] 7.5 拖拽过程中禁止文本选中（`user-select: none`）

## 8. 集成验证

- [x] 8.1 TypeScript 编译检查（`npx tsc --noEmit`）无新增错误
- [x] 8.2 Vite 构建验证（`npx vite build`）通过
- [x] 8.3 Rust 编译检查（`cargo check`）通过（无后端变更）
