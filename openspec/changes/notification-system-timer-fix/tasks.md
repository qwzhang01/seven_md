# Notification System Timer Fix - Tasks

## 1. NotificationItem Component

- [x] 1.1 添加 `remainingTime` state 跟踪剩余时间
- [x] 1.2 添加 `isPaused` state 管理暂停状态
- [x] 1.3 实现 `onMouseEnter` 暂停计时器
- [x] 1.4 实现 `onMouseLeave` 恢复计时器（从剩余时间继续）

## 2. Notification Store

- [x] 2.1 确认全局默认 duration 为 5000ms
- [x] 2.2 检查并规范化各调用处的 duration 参数（注：移除了 Store 层独立 setTimeout，auto-close 完全由组件管理）

## 3. Testing

- [x] 3.1 移除旧 Store 层 auto-close 测试（auto-close 已移至组件层）
- [ ] 3.2 手动测试：悬停暂停功能（hover 通知，计时器停止）
- [ ] 3.3 手动测试：悬停后离开继续倒计时（从剩余时间继续，非重新计时）
- [ ] 3.4 手动测试：多个通知同时悬停（各通知独立计时）
