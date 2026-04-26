## Why

通知系统是用户反馈操作状态的重要渠道。根据交互规范，通知应具备 5 秒自动关闭和鼠标悬停暂停倒计时的功能。当前实现虽然定义了 `isPaused` 状态，但在 `NotificationItem` 组件中未实际使用该状态来暂停计时器，导致用户体验不符合规范要求。

## What Changes

- 在 `NotificationItem` 组件中添加鼠标悬停事件处理
- 实现 `onMouseEnter` 时暂停自动关闭计时器
- 实现 `onMouseLeave` 时恢复计时器（从剩余时间继续倒计时，而非重新计时）
- 统一所有通知的默认 duration 为 5000ms（或可配置的全局默认值）
- 移除或规范化各个调用处的自定义 duration，改为使用全局默认值

## Capabilities

### New Capabilities

- `notification-pause-on-hover`: 通知悬停暂停功能，当鼠标悬停在通知上时，自动关闭计时器暂停；鼠标离开后继续倒计时

### Modified Capabilities

- `notification-system`: 修改默认 duration 为 5000ms，并确保全局一致性

## Impact

- 修改文件：`src/components/notification-v2/NotificationItem.tsx`
- 修改文件：`src/stores/useNotificationStore.ts`（可选：添加全局 duration 配置）
- 影响范围：所有使用通知功能的组件
