## Why

最近文档列表中保存了文件夹类型的条目（`type: 'folder'`），但 `app:open-recent` 事件处理器和 `menu-open-recent-doc` 原生菜单处理器均无条件调用 `readFile(path)` 读取路径内容，导致当路径指向目录时触发 OS error 21（Is a directory），弹出"打开最近文档失败"错误通知。此外，`WelcomeDialog` 中的 `RecentDoc` 接口缺少 `type` 字段，导致 dispatch `app:open-recent` 事件时无法携带类型信息，处理器无从区分文件与文件夹。

## What Changes

- **修复 `app:open-recent` 事件处理器**（`AppV2.tsx`）：从 `CustomEvent` 的 `detail` 中读取 `{ path, type }` 对象（而非仅 `path` 字符串）；当 `type === 'folder'` 时调用 `openFolder(path)` 而非 `readFile(path)`
- **修复 `menu-open-recent-doc` 原生菜单处理器**（`AppV2.tsx`）：从 `localStorage` 中查找对应路径的 `type`，若为 `folder` 则调用 `openFolder(path)`，否则调用 `readFile(path)`
- **修复 `WelcomeDialog` 的 `RecentDoc` 接口**：添加 `type: 'file' | 'folder'` 字段，与 `AppV2.tsx` / `useRecentFiles.ts` 中的定义保持一致
- **修复 `WelcomeDialog` 的 `handleOpenRecent`**：dispatch `app:open-recent` 事件时，将 `detail` 从 `path` 字符串改为 `{ path, type }` 对象
- **修复 `WelcomeDialog` 的图标显示**：文件夹类型条目显示 `FolderOpen` 图标，文件类型条目显示 `FileText` 图标

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `recent-documents-open`: 打开最近文档时需正确区分文件与文件夹，文件夹应调用 `openFolder` 而非 `readFile`
- `help-menu-dialogs`: WelcomeDialog 的 `RecentDoc` 接口需包含 `type` 字段，`handleOpenRecent` 需传递类型信息

## Impact

- **`src/AppV2.tsx`**：`app:open-recent` handler 和 `menu-open-recent-doc` handler 各修改约 5 行
- **`src/components/dialogs/WelcomeDialog.tsx`**：`RecentDoc` 接口新增 `type` 字段；`handleOpenRecent` 修改 dispatch payload；列表图标按类型渲染
- **无破坏性变更**：仅修复运行时错误，不改变 UI 结构和存储格式
