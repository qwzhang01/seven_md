## 1. Store — Batch Close Actions

- [x] 1.1 在 workspace store（或 tab store）中新增 `closeOtherTabs(tabId)` action，关闭除指定 tabId 外的所有标签，逐一调用现有 `closeTab` 处理脏标签确认
- [x] 1.2 新增 `closeAllTabs()` action，关闭所有标签，逐一调用 `closeTab`
- [x] 1.3 新增 `closeTabsToLeft(tabId)` action，关闭指定 tabId 左侧的所有标签
- [x] 1.4 新增 `closeTabsToRight(tabId)` action，关闭指定 tabId 右侧的所有标签
- [x] 1.5 为以上四个 action 编写单元测试，覆盖含脏标签和无脏标签的场景

## 2. TabContextMenu Component

- [x] 2.1 创建 `TabContextMenu` 组件（`src/components/TabContextMenu.tsx` 或同级目录），接收 `tabId`、`position: {x, y}`、`onClose` 回调作为 props
- [x] 2.2 实现菜单项列表：关闭、关闭其他、关闭全部、分隔线、关闭左侧、关闭右侧
- [x] 2.3 为每个菜单项添加对应的 lucide-react 图标（X、Layers、XCircle、ChevronLeft、ChevronRight），尺寸 14px，颜色继承 `var(--text-primary)`
- [x] 2.4 根据当前标签位置动态计算 disabled 状态：
  - \"关闭其他\"：仅一个标签时 disabled
  - \"关闭左侧\"：当前标签是最左侧时 disabled
  - \"关闭右侧\"：当前标签是最右侧时 disabled
- [x] 2.5 菜单使用 `position: fixed`，渲染在传入的 `{x, y}` 坐标处，样式与现有 ContextMenu 保持一致
- [x] 2.6 实现点击菜单外部关闭（`useEffect` 监听全局 `mousedown`）
- [x] 2.7 实现按 Escape 键关闭菜单

## 3. TabBar Integration

- [x] 3.1 在 `TabBar` 组件中为每个标签元素添加 `onContextMenu` 事件处理器
- [x] 3.2 在事件处理器中调用 `event.preventDefault()` 阻止浏览器原生菜单
- [x] 3.3 记录右键点击的 `tabId` 和鼠标坐标 `{clientX, clientY}`，存入本地 state
- [x] 3.4 在 TabBar 渲染中条件渲染 `TabContextMenu`，传入 tabId、position 和关闭回调
- [x] 3.5 确保同一时刻只有一个 TabContextMenu 可见（新右键点击替换旧菜单）

## 4. Wiring — Connect Menu Actions to Store

- [x] 4.1 在 `TabContextMenu` 中连接\"关闭\"按钮 → 调用 `closeTab(tabId)`
- [x] 4.2 连接\"关闭其他\" → 调用 `closeOtherTabs(tabId)`
- [x] 4.3 连接\"关闭全部\" → 调用 `closeAllTabs()`
- [x] 4.4 连接\"关闭左侧\" → 调用 `closeTabsToLeft(tabId)`
- [x] 4.5 连接\"关闭右侧\" → 调用 `closeTabsToRight(tabId)`
- [x] 4.6 每个操作执行后关闭菜单（调用 `onClose` 回调）

## 5. Styling

- [x] 5.1 为 `TabContextMenu` 添加 CSS 样式，与现有编辑器右键菜单（context-menu-format）视觉风格一致（背景、边框、阴影、hover 状态、disabled 状态）
- [x] 5.2 验证菜单在标签栏边缘（最左/最右标签）右键时不超出视口边界，必要时做边界检测翻转
- [x] 5.3 移除标签关闭按钮（×）的 hover-only 显示逻辑，改为始终可见；调整标签最小宽度/内边距，确保关闭按钮不挤压文件名显示

## 6. QA & Verification

- [x] 6.1 手动验证：右键单个标签，菜单正确显示，所有操作项可点击
- [x] 6.2 手动验证：含未保存修改的标签在批量关闭时逐一弹出 DirtyTabDialog
- [x] 6.3 手动验证：disabled 状态正确（最左标签"关闭左侧"灰显，最右标签"关闭右侧"灰显，仅一个标签时"关闭其他"灰显）
- [x] 6.4 手动验证：点击菜单外部和按 Escape 键均可关闭菜单
- [x] 6.5 手动验证：菜单样式与编辑器右键菜单一致
- [x] 6.6 手动验证：标签关闭按钮（×）在鼠标未悬停时也始终可见，且不遮挡文件名
