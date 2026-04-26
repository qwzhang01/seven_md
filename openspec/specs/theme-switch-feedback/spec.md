## ADDED Requirements

### Requirement: 主题切换通知反馈
用户切换主题后 SHALL 显示 info 类型通知，告知当前激活的主题名称。

#### Scenario: 切换到暗色主题
- **WHEN** 用户从主题菜单选择"Monokai"主题
- **THEN** 主题 SHALL 切换为 Monokai，同时显示通知"主题已切换为 Monokai"

#### Scenario: 切换到亮色主题
- **WHEN** 用户从主题菜单选择"GitHub"主题
- **THEN** 主题 SHALL 切换为 GitHub，同时显示通知"主题已切换为 GitHub"

#### Scenario: 通知自动关闭
- **THEN** 主题切换通知 SHALL 在 3 秒后自动关闭
