## Why

通知系统的 `duration` 配置不一致，影响用户体验的一致性。规范要求错误通知自动关闭时间为 5 秒，但代码中存在 4000ms 和其他不一致的值。

## What Changes

- 统一所有错误通知的 duration 为 5000ms（5 秒）
- 确保 `AppV2.tsx` 中打开文件失败通知的 duration 与规范一致

## Capabilities

### New Capabilities

- `notification-duration-standard`: 定义通知 duration 规范，确保所有通知组件遵循统一的自动关闭时间

### Modified Capabilities

- 无

## Impact

- `src/AppV2.tsx`: 修复打开文件失败通知的 duration
- 审查所有 toast/notification 调用，确保 duration 一致性
