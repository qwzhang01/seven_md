# Proposal: 状态栏增强

## Why

当前状态栏在通知徽标样式和同步状态显示方面与原型规范存在差异。通知铃铛图标缺少小红点样式的视觉反馈，同步状态也没有清晰区分开关状态，影响用户体验和界面一致性。

## What Changes

1. **通知徽标样式增强**：为通知铃铛图标添加小红点样式的通知徽标，当有未读通知时显示醒目的红色圆点标记
2. **同步状态显示优化**：明确区分"同步: 开"和"同步: 关"两种状态，提供更直观的视觉反馈

## Capabilities

### New Capabilities

- `statusbar-notification-badge`：通知徽标样式规范，定义小红点样式的显示规则和交互行为
- `statusbar-sync-toggle`：同步开关状态规范，区分同步功能的开启/关闭状态显示

### Modified Capabilities

- `status-bar-enhanced`：扩展通知徽标显示需求，添加小红点样式支持

## Impact

- **受影响代码**：`src/components/StatusBar/StatusBar.tsx`
- **UI 组件**：通知徽标、同步状态按钮
- **主题适配**：需适配暗黑/亮色主题下的小红点颜色
