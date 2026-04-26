## Context

当前 `AboutDialog` 组件位于 `src/components/dialogs/AboutDialog.tsx`，实现了基本的对话框功能：
- Escape 键关闭对话框
- 点击遮罩层关闭
- 无障碍焦点管理缺失
- 无打开动画

根据 `openspec/specs/modal-dialog/spec.md` 规范，对话框需要支持：
- Enter 确认主操作
- Tab/Shift+Tab 焦点切换
- 焦点陷阱（焦点不能逃逸到对话框外）
- 打开动画（scale + fade-in）

## Goals / Non-Goals

**Goals:**
- 为 `AboutDialog` 添加 Enter 键确认功能
- 实现 Tab/Shift+Tab 焦点切换，包含焦点陷阱
- 添加打开动画（scale 0.9→1 + opacity 0→1，约 150ms）

**Non-Goals:**
- 不修改其他对话框组件（如有确认对话框）
- 不重构通用 Dialog 组件
- 不添加关闭动画

## Decisions

### 1. 焦点管理实现方式

**选择**: 使用 `tabIndex` 属性 + `useRef` 管理焦点

**原因**: 
- 不引入额外依赖（对比：`react-aria`/`focus-trap-react`）
- AboutDialog 组件简单，焦点陷阱逻辑可直接在 useEffect 中实现
- 遵循现有代码风格

**实现思路**:
```tsx
// 打开时将焦点移到对话框内第一个可聚焦元素
// 监听 Tab 键，当焦点在最后一个元素时 wrap 到第一个
// 监听 Shift+Tab，当焦点在第一个元素时 wrap 到最后一个
```

### 2. 打开动画实现方式

**选择**: CSS transition + React state 控制可见性

**原因**:
- 不引入动画库依赖
- 简单场景使用 CSS 即可满足
- 性能良好

**实现思路**:
```tsx
// 添加 initial class 控制初始状态
// 打开后移除 initial class 触发动画
// 使用 transform: scale() + opacity
```

### 3. Enter 键确认逻辑

**选择**: 在现有的 keydown 处理中增加 Enter 事件

**原因**:
- 现有的 Escape 处理在 useEffect 中，可复用
- Enter 应触发默认按钮（关闭按钮）

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 焦点管理逻辑复杂可能遗漏边界情况 | 简化为只在 AboutDialog 生效，聚焦于"能工作"而非"完美" |
| 动画可能影响键盘操作时序 | 使用 CSS transition，不依赖 JS 计时器 |

## Open Questions

1. **焦点陷阱是否需要处理 Shift+Tab 反向循环？** — 是的，完整实现需支持双向循环
2. **是否需要在 spec 中更新打开动画时长？** — 规范建议 ~150ms，建议使用 150ms
