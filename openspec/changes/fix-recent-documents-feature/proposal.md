## Why

"最近文档"功能在 UI 上已有完整展示（欢迎页对话框、原生菜单子菜单），但核心数据流存在三处断裂：打开文件时不记录、`app:open-recent` 事件无监听者、两处 localStorage key 不一致（`recent-documents` vs `seven-md:recent-files`），导致最近文档列表始终为空，功能完全失效。

## What Changes

- **修复 `handleOpenFile`**：在 `AppV2.tsx` 中打开文件成功后，将文件路径写入 `localStorage`（`recent-documents` key）
- **修复 `handleOpenFolder`**：打开文件夹成功后，同样记录到最近文档列表
- **添加 `app:open-recent` 事件监听**：在 `AppV2.tsx` 中监听该事件，读取文件内容并调用 `openTab`，同时更新最近文档列表
- **统一 localStorage key**：`WelcomeDialog` 使用 `recent-documents`，`useRecentFiles` hook 使用 `seven-md:recent-files`，两者不一致；统一为 `recent-documents`（与 `WelcomeDialog` 和 `menu-clear-recent` 处理保持一致）
- **修复 `menu-clear-recent` 处理**：当前只清除 `recent-documents`，统一 key 后保持一致
- **修复 `useRecentFiles` hook 的 save 逻辑**：当列表清空时也应删除 localStorage 条目（当前只在 `recentFiles.length > 0` 时保存，清空后不会删除旧数据）

## Capabilities

### New Capabilities

- `recent-documents-write`: 打开文件/文件夹时自动将路径写入最近文档列表（localStorage）
- `recent-documents-open`: 从最近文档列表打开文件（处理 `app:open-recent` 事件）

### Modified Capabilities

- `help-menu-dialogs`: 欢迎页对话框中"最近打开"列表现在能正确显示数据（依赖 key 统一后的 localStorage）
- `file-operations`: 打开文件/文件夹操作新增最近文档记录副作用

## Impact

- **`src/AppV2.tsx`**：`handleOpenFile`、`handleOpenFolder` 逻辑新增写入最近文档；新增 `app:open-recent` 事件监听；`menu-clear-recent` 处理保持不变（key 已一致）
- **`src/hooks/useRecentFiles.ts`**：将 `STORAGE_KEY` 从 `seven-md:recent-files` 改为 `recent-documents`；修复 save effect 在列表为空时也清除 localStorage
- **`src/components/dialogs/WelcomeDialog.tsx`**：无需修改（已使用正确的 `recent-documents` key）
- **无破坏性变更**：仅修复数据流，不改变 UI 结构和 API 接口
