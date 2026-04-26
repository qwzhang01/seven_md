## Context

资源管理器（`ExplorerPanel.tsx`）当前只支持点击打开文件，缺少右键菜单功能。需要添加文件和文件夹的右键操作菜单。

## Goals / Non-Goals

**Goals:**
- 文件右键菜单：新建、重命名、删除、复制路径等
- 文件夹右键菜单：新建、重命名、删除、复制路径等
- macOS 标准操作：在 Finder 中显示、在终端中打开

**Non-Goals:**
- 不实现拖拽操作
- 不实现文件复制/粘贴（仅复制路径）

## Decisions

### 可复用 ContextMenu 组件

创建通用的 ContextMenu 组件：

```tsx
interface ContextMenuItem {
  id: string
  label: string
  icon?: ReactNode
  shortcut?: string
  disabled?: boolean
  danger?: boolean  // 红色危险操作
  onClick: () => void
  separator?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  position: { x: number; y: number }
  onClose: () => void
}
```

### 菜单项设计

**文件右键菜单**:
1. 新建文件
2. 新建文件夹
3. ---
4. 重命名
5. 复制
6. ---
7. 复制路径
8. 在终端中打开
9. 在 Finder 中显示
10. ---
11. 删除（danger）

**文件夹右键菜单**:
1. 新建文件
2. 新建文件夹
3. ---
4. 重命名
5. ---
6. 复制路径
7. 在终端中打开
8. 在 Finder 中显示
9. ---
10. 删除（danger）

### 平台检测

```tsx
const isMac = navigator.platform.startsWith('Mac')
// Windows/Linux 显示不同选项
```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 删除操作不可逆 | 显示确认对话框 |
| 文件系统权限问题 | 捕获错误并显示通知 |

## Open Questions

- 是否需要"打开方式"子菜单（选择其他应用打开）？
- 是否需要支持多选文件操作？
