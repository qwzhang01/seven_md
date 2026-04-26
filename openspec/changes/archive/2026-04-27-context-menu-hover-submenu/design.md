## Context

`EditorContextMenu.tsx` 当前实现了右键菜单，点击"插入"后会展开子菜单。但交互规范要求支持 hover 展开子菜单，提供更流畅的操作体验。

## Goals / Non-Goals

**Goals:**
- 鼠标移入"插入"菜单项时自动展开子菜单
- 鼠标离开子菜单区域时关闭子菜单
- 保持点击展开的兼容性

**Non-Goals:**
- 不修改菜单的样式和布局
- 不支持键盘导航打开子菜单（暂不考虑）

## Decisions

### 子菜单状态管理

在菜单组件中添加状态跟踪当前展开的子菜单：

```tsx
const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

const menuItems = [
  {
    id: 'insert',
    label: '插入',
    hasSubmenu: true,
    onMouseEnter: () => setOpenSubmenu('insert'),
    onMouseLeave: () => setOpenSubmenu(null),
    submenu: openSubmenu === 'insert' ? <InsertSubmenu /> : null
  },
  // ...
]
```

### 定位问题

子菜单需要正确计算位置：
- 水平菜单：子菜单显示在父菜单右侧
- 垂直菜单：子菜单显示在下方
- 边界检测：确保子菜单不超出视口

使用固定定位 + transform 计算：

```tsx
const submenuStyle = {
  position: 'fixed',
  left: menuRect.right + 4,
  top: menuRect.top,
}
```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| Hover 和 click 行为可能冲突 | 使用 `mouseleave` 延迟关闭，确保鼠标移动到子菜单时不会关闭 |
| 移动端不支持 hover | 点击行为作为 fallback |

## Open Questions

- 是否需要延迟关闭子菜单（如 200ms）以提升体验？
- 是否需要支持触摸设备的 long-press 展开？
