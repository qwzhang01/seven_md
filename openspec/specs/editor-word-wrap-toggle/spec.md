## ADDED Requirements

### Requirement: 命令面板提供切换自动换行命令
系统 SHALL 在命令面板中提供"编辑器: 切换自动换行"命令，允许用户通过命令面板控制编辑器自动换行功能。

#### Scenario: 通过命令面板切换自动换行
- **WHEN** 用户在命令面板中搜索"切换自动换行"或"word wrap"
- **THEN** 命令列表 SHALL 显示 "🖌️ Edit: 切换自动换行" 命令
- **AND** 执行该命令 SHALL 切换编辑器的自动换行状态

#### Scenario: 切换自动换行命令显示在 Edit 分类下
- **WHEN** 命令面板以默认分类视图显示
- **THEN** "切换自动换行" 命令 SHALL 显示在 "🖌️ Edit" 分类下
- **AND** 命令项 SHALL 包含图标、分类前缀和命令名称
