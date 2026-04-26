## ADDED Requirements

### Requirement: 错误通知 duration 统一为 5 秒

所有错误通知的自动关闭时间（MUST）统一设置为 5000 毫秒（5 秒），包括但不限于：
- 打开文件失败通知
- 保存文件失败通知
- 网络错误通知
- 权限错误通知

#### Scenario: 打开文件失败通知自动关闭
- **WHEN** 用户尝试打开一个不存在的文件
- **THEN** 显示错误通知，5 秒后自动关闭

#### Scenario: 保存文件失败通知自动关闭
- **WHEN** 用户尝试保存文件失败
- **THEN** 显示错误通知，5 秒后自动关闭

### Requirement: 通知 duration 配置常量

代码中（MUST）使用常量定义通知 duration，便于统一维护和修改。

#### Scenario: 使用常量定义 duration
- **WHEN** 开发者需要设置通知 duration
- **THEN** 应使用常量（如 `NOTIFICATION_DURATION_ERROR = 5000`）
