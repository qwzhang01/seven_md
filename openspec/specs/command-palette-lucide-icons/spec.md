## ADDED Requirements

### Requirement: 命令图标使用 Lucide 组件
命令面板中的每个命令 SHALL 使用 Lucide React 图标替代当前的 emoji 前缀。

#### Scenario: 命令列表显示 Lucide 图标
- **WHEN** 用户打开命令面板，查看命令列表
- **THEN** 每个命令左侧 SHALL 显示对应的 Lucide 图标，而非 emoji 字符

#### Scenario: 无图标映射的命令降级
- **WHEN** 某个命令没有配置 Lucide 图标映射
- **THEN** 该命令 SHALL 不显示图标前缀（不显示 emoji，也不显示空白图标占位）

### Requirement: 命令定义新增 icon 字段
`commands/index.ts` 中的命令定义 SHALL 新增可选的 `icon` 字段，值为 Lucide 图标组件名。

#### Scenario: 命令定义包含 icon
- **WHEN** 开发者在 `commands/index.ts` 中定义命令时指定 `icon: 'FileText'`
- **THEN** 命令面板渲染该命令时 SHALL 显示 `FileText` Lucide 图标
