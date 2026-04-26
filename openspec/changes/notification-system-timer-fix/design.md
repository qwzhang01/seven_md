## Context

通知系统当前使用 Zustand store 管理通知队列，每个通知有 `autoClose` 和 `duration` 属性。虽然 store 中定义了 `isPaused` 状态和 `setNotificationPaused` 方法，但 `NotificationItem` 组件并未使用这些功能来暂停计时器。

## Goals / Non-Goals

**Goals:**
- 实现鼠标悬停时暂停通知自动关闭计时器
- 鼠标离开后从剩余时间继续倒计时（非重新计时）
- 统一通知 duration 为 5 秒

**Non-Goals:**
- 不修改通知的样式和布局
- 不添加通知队列管理策略（如最大数量限制已存在）

## Decisions

### 方案 A: 在组件内部使用 setTimeout 管理暂停（推荐）

```tsx
// NotificationItem.tsx
const [remainingTime, setRemainingTime] = useState(notification.duration)
const [isPaused, setIsPaused] = useState(false)
const timerRef = useRef<number | null>(null)

useEffect(() => {
  if (isPaused) return
  
  timerRef.current = window.setTimeout(() => {
    removeNotification(id)
  }, remainingTime)
  
  return () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }
}, [isPaused, remainingTime])
```

**优点**: 实现简单，组件自包含
**缺点**: 每个通知实例持有独立 timer

### 方案 B: 在 Store 层管理暂停状态

在 store 中添加 pause/resume 方法，组件通过 props 控制。

**优点**: 状态集中管理
**缺点**: 需要额外的状态同步逻辑

### 最终选择: 方案 A

考虑到通知系统相对独立，组件自包含的实现更加简洁，也便于后续维护。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 快速悬停/离开可能导致 timer 不稳定 | 使用 `remainingTime` 状态跟踪，暂停时保存剩余时间 |

## Open Questions

- 是否需要在通知 store 中暴露全局 duration 配置？
- 悬停时是否需要视觉反馈（如进度条）？
