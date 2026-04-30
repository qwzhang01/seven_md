## Context

"最近文档"功能由三个部分组成：
1. **存储层**：`localStorage` 中的 `recent-documents` key，存储 `{path, name, lastOpened}[]`
2. **读取层**：`WelcomeDialog.tsx` 中的 `getRecentDocuments()` 函数，从 `recent-documents` 读取并展示
3. **写入层**：应在文件打开时写入，但当前完全缺失

当前问题：
- `handleOpenFile` / `handleOpenFolder` 打开文件后**从不写入** `recent-documents`
- `WelcomeDialog` 派发 `app:open-recent` 事件，但 `AppV2.tsx` **从不监听**该事件
- `useRecentFiles` hook 使用 `seven-md:recent-files` key，与 `WelcomeDialog` 使用的 `recent-documents` key **不一致**，导致 hook 的数据与 UI 展示的数据完全隔离

## Goals / Non-Goals

**Goals:**
- 打开文件/文件夹时自动记录到最近文档列表
- 从欢迎页点击最近文档能正确打开文件
- 统一 localStorage key，消除数据孤岛
- 修复 `useRecentFiles` hook 的清空逻辑

**Non-Goals:**
- 不引入新的 UI 组件或改变现有 UI 布局
- 不迁移到 Tauri 后端存储（后端命令已是 placeholder，维持现状）
- 不修改原生菜单的最近文档子菜单动态更新（Tauri 原生菜单不支持运行时动态修改菜单项，超出本次范围）

## Decisions

### Decision 1：统一使用 `recent-documents` 作为 localStorage key

**选择**：将 `useRecentFiles` hook 的 `STORAGE_KEY` 从 `seven-md:recent-files` 改为 `recent-documents`

**理由**：
- `WelcomeDialog` 已使用 `recent-documents`，是用户可见的 UI 数据源
- `menu-clear-recent` 事件处理也清除 `recent-documents`
- 保持 `useRecentFiles` hook 与 UI 一致，避免两套数据

**替代方案**：将 `WelcomeDialog` 改为使用 `seven-md:recent-files` → 需要修改更多地方，且 `menu-clear-recent` 也需同步修改

### Decision 2：在 `AppV2.tsx` 中内联写入最近文档，不使用 `useRecentFiles` hook

**选择**：在 `handleOpenFile` 成功后，直接操作 `localStorage`（复用 `WelcomeDialog` 中已有的工具函数模式）

**理由**：
- `useRecentFiles` 是 React hook，只能在组件内使用；`AppV2.tsx` 的 `handleOpenFile` 是 `useCallback`，可以直接访问 `localStorage`
- 避免引入额外的 hook 依赖，保持代码简洁
- 提取一个共享的 `addRecentDocument(path)` 工具函数，供 `handleOpenFile`、`handleOpenFolder`、`app:open-recent` 处理共用

### Decision 3：`app:open-recent` 事件在 `AppV2.tsx` 中监听

**选择**：在 `AppV2.tsx` 的 `useEffect` 中添加 `window.addEventListener('app:open-recent', handler)`

**理由**：所有文件操作（打开、保存）都集中在 `AppV2.tsx`，保持一致性；`WelcomeDialog` 已通过 `window.dispatchEvent` 派发该事件

## Risks / Trade-offs

- **[风险] 原生菜单最近文档子菜单不会动态更新** → 接受：Tauri 原生菜单在构建时静态生成，运行时无法动态添加菜单项；欢迎页对话框的最近文档列表可正常工作，满足核心需求
- **[风险] `useRecentFiles` hook 的 key 变更导致旧数据丢失** → 可接受：旧 key 下的数据从未被 UI 展示，用户无感知；新 key 与 UI 一致，体验更好
- **[Trade-off] 不使用 hook 而直接操作 localStorage** → 简单直接，避免 hook 在非组件上下文中使用的复杂性
