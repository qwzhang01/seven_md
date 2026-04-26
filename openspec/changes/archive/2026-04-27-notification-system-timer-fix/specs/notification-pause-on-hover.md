# Notification Pause on Hover

## Overview

用户鼠标悬停在通知上时，自动关闭计时器暂停；鼠标离开后继续倒计时。

## Behavior

1. 用户鼠标进入通知区域
   - 计时器暂停
   - 通知保持显示

2. 用户鼠标离开通知区域
   - 计时器继续（从剩余时间）
   - 通知按正常流程自动关闭

3. 默认 duration
   - 所有通知默认 5000ms
   - 可覆盖

## Edge Cases

- 快速 hover/unhover：使用 remainingTime 状态跟踪
- 多个通知同时 hover：独立计时器，互不影响
