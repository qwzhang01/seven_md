## Context

当前标签栏（TabBar）仅支持左键点击切换标签、悬停显示关闭按钮（×）的交互方式，没有右键上下文菜单。主流代码编辑器（VS Code、JetBrains IDE、Sublime Text）均在标签上提供右键菜单，支持快速关闭当前标签、关闭其他标签、关闭左/右侧标签等批量操作。

现有相关模块：
- `TabBar` 组件：渲染标签列表，处理点击/拖拽事件
- `workspace store`（或 tab store）：管理 `openTabs`、`activeTabId`，提供 `closeTab` 操作
- `DirtyTabDialog`：处理未保存文件关闭确认，已有完整流程

## Goals / Non-Goals

**Goals:**
- 在标签上右键弹出上下文菜单，提供：关闭、关闭其他、关闭全部、关闭左侧、关闭右侧
- 批量关闭时对含未保存修改的标签逐一触发 DirtyTabDialog 确认
- 菜单样式与现有编辑器右键菜单（context-menu-format）保持一致
- 使用 lucide-react 图标

**Non-Goals:**
- 不支持标签固定（Pin Tab）
- 不支持标签分组
- 不支持跨窗口移动标签
- 不修改 DirtyTabDialog 现有逻辑

## Decisions

### 决策 1：新建独立的 `TabContextMenu` 组件，而非复用编辑器 ContextMenu

**选择**：新建 `TabContextMenu` 组件，挂载在 TabBar 内部。

**理由**：编辑器右键菜单（`ContextMenu`）的菜单项与标签操作完全不同，强行复用会导致耦合。独立组件职责清晰，便于维护。

**备选方案**：在通用 ContextMenu 组件中通过 props 传入菜单项 → 增加通用组件复杂度，且当前通用组件不存在，成本更高。

---

### 决策 2：批量关闭时串行处理脏标签确认

**选择**：批量关闭（关闭其他/全部/左侧/右侧）时，对每个含未保存修改的标签依次弹出 DirtyTabDialog，用户逐一确认。

**理由**：与现有单标签关闭行为一致，用户不会意外丢失数据；实现简单，直接复用 `closeTab` 逻辑。

**备选方案**：一次性弹出"有 N 个未保存文件，是否全部保存？"的批量确认 → 交互更简洁，但需新增 UI，且用户无法对每个文件单独决策。留作后续优化。

---

### 决策 3：菜单定位使用鼠标坐标（fixed 定位）

**选择**：在 `onContextMenu` 事件中记录 `clientX/clientY`，菜单使用 `position: fixed` 渲染在鼠标位置。

**理由**：与现有编辑器 ContextMenu 实现方式一致，避免 overflow 裁剪问题。

---

### 决策 4：store 新增批量关闭 actions

在 workspace store 中新增：
- `closeOtherTabs(tabId)` — 关闭除指定 tabId 外的所有标签
- `closeAllTabs()` — 关闭所有标签
- `closeTabsToLeft(tabId)` — 关闭指定 tabId 左侧的所有标签
- `closeTabsToRight(tabId)` — 关闭指定 tabId 右侧的所有标签

每个 action 内部调用现有 `closeTab(id)` 逐一处理，保证脏标签确认流程不变。

## Risks / Trade-offs

- **[风险] 批量关闭多个脏标签时，用户需多次确认** → 当前版本接受此行为，与单标签关闭一致；后续可优化为批量确认弹窗
- **[风险] 菜单未关闭时切换标签** → 在 `useEffect` 中监听全局 `mousedown` 事件，点击菜单外部时关闭菜单
- **[风险] 标签数量为 1 时，"关闭左侧"/"关闭右侧"/"关闭其他" 应置灰** → 在菜单渲染时根据标签位置动态计算 disabled 状态
