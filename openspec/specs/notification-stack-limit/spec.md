## ADDED Requirements

### Requirement: 通知最大显示数量限制
通知系统 SHALL 限制同时显示的通知数量为最多 5 条，超出时自动移除最早的未暂停通知。

#### Scenario: 超过 5 条通知
- **WHEN** 系统已有 5 条通知显示，新通知触发
- **THEN** 最早的那条未被 hover 暂停的通知 SHALL 被移除，新通知 SHALL 显示在底部

#### Scenario: 被 hover 暂停的通知不参与替换
- **WHEN** 用户鼠标悬停在第一条通知上（暂停自动关闭），且系统已有 5 条通知，新通知触发
- **THEN** 第二条未被暂停的通知 SHALL 被移除，被 hover 的第一条通知 SHALL 保留

### Requirement: 通知堆叠间距
多条通知堆叠时 SHALL 有统一的垂直间距（8px），视觉上清晰分隔。

#### Scenario: 多条通知间距
- **WHEN** 同时显示 3 条通知
- **THEN** 每条通知之间 SHALL 有 8px 的垂直间距
