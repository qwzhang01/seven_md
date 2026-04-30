## 1. 修复 WelcomeDialog

- [x] 1.1 在 `src/components/dialogs/WelcomeDialog.tsx` 的 `RecentDoc` 接口中添加 `type: 'file' | 'folder'` 字段
- [x] 1.2 修改 `handleOpenRecent(path: string)` 签名为 `handleOpenRecent(path: string, type: 'file' | 'folder')`，dispatch `app:open-recent` 时将 `detail` 从 `path` 字符串改为 `{ path, type }` 对象
- [x] 1.3 修改最近文档列表渲染：`type === 'folder'` 时显示 `FolderOpen` 图标，否则显示 `FileText` 图标
- [x] 1.4 更新列表按钮的 `onClick`：传入 `doc.type` 参数，即 `onClick={() => handleOpenRecent(doc.path, doc.type)}`

## 2. 修复 app:open-recent 事件处理器

- [x] 2.1 在 `src/AppV2.tsx` 的 `app:open-recent` handler 中，将 `event.detail` 的类型从 `string` 改为 `{ path: string; type: 'file' | 'folder' }`
- [x] 2.2 当 `type === 'folder'` 时，调用 `useWorkspaceStore.getState().openFolder(path)` 并调用 `addRecentDocument(path, 'folder')`，而非 `readFile`
- [x] 2.3 当 `type === 'file'`（或 type 缺失时默认）时，保持原有 `readFile(path)` → `openTab` 逻辑不变

## 3. 修复 menu-open-recent-doc 原生菜单处理器

- [x] 3.1 在 `src/AppV2.tsx` 的 `menu-open-recent-doc` handler 中，从 localStorage `recent-documents` 列表查找 `path` 对应条目的 `type`
- [x] 3.2 当 `type === 'folder'` 时，调用 `useWorkspaceStore.getState().openFolder(path)` 并调用 `addRecentDocument(path, 'folder')`
- [x] 3.3 当 `type === 'file'` 或找不到对应条目时（默认），保持原有 `readFile(path)` → `openTab` 逻辑

## 4. 验证

- [ ] 4.1 手动测试：打开一个文件夹，关闭后重新打开欢迎页，点击该文件夹条目，确认文件夹正常打开且无错误通知
- [ ] 4.2 手动测试：从原生菜单"最近文档"子菜单点击文件夹条目，确认文件夹正常打开
- [ ] 4.3 手动测试：点击文件类型的最近文档条目，确认文件仍能正常打开（回归测试）
- [ ] 4.4 手动测试：文件夹条目在欢迎页显示 `FolderOpen` 图标，文件条目显示 `FileText` 图标
