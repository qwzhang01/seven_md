## Why

根据 `docs/todo-comparison-report.md` 的模态对话框差异分析，当前 `AboutDialog` 组件缺少三个关键的交互特性：
1. **Enter 键确认** - 规范要求"Enter 键等同于确定"，但组件未实现
2. **Tab 键焦点切换** - 规范要求 Tab 在按钮间切换焦点，但缺少 tabIndex 和焦点管理
3. **打开动画** - 规范要求"打开带有缩放+淡入动画"，但组件直接显示无动画

这些是无障碍访问和用户体验的基本要求，需要统一实现。

## What Changes

- **AboutDialog** 组件新增 Enter 键确认逻辑，激活主按钮（确定/关闭）
- **AboutDialog** 组件新增 Tab/Shift+Tab 焦点切换支持，实现焦点陷阱
- **AboutDialog** 组件新增打开动画（scale + fade-in），时长约 150ms
- **通用 Dialog 组件**（如复用）统一支持上述键盘和动画行为

## Capabilities

### New Capabilities
- `dialog-open-animation`: 模态对话框打开时的缩放+淡入动画效果

### Modified Capabilities
- `modal-dialog`: 现有的 Enter 确认和 Tab 焦点切换规范已存在，但 AboutDialog 未实现；新增打开动画要求到现有规范

## Impact

- **受影响代码**: `src/components/dialogs/AboutDialog.tsx`
- **可能复用**: 如有其他 Dialog 组件，应统一使用相同键盘和动画行为
- **依赖**: 无外部依赖，使用 CSS transition + React 状态管理即可实现
