## ADDED Requirements

### Requirement: 编辑器/预览宽度比例持久化
系统 SHALL 将用户通过拖拽 Gutter 调整的编辑器宽度值持久化存储，应用重启或页面刷新后 SHALL 恢复到上次保存的宽度比例。

#### Scenario: 拖拽后宽度持久化
- **WHEN** 用户通过拖拽 Gutter 改变了编辑器/预览的宽度比例
- **THEN** 新的 editorWidth 值 SHALL 被持久化到 localStorage（通过 useUIStore persist 中间件）
- **AND** 持久化 SHALL 在每次拖拽 mouseup 释放时自动完成

#### Scenario: 启动时恢复持久化宽度
- **WHEN** 应用启动或页面刷新
- **AND** localStorage 中存在有效的 editorWidth 值
- **THEN** 编辑器面板 SHALL 以持久化的宽度值渲染
- **AND** 预览面板 SHALL 占据剩余空间

#### Scenario: 无持久化值时使用默认分割
- **WHEN** 应用首次启动或 localStorage 中无 editorWidth 值
- **THEN** 编辑器和预览面板 SHALL 各占 50% 可用宽度（flex: 1）

#### Scenario: 持久化宽度超出当前窗口范围时自动修正
- **WHEN** 应用启动或窗口 resize 后
- **AND** 持久化的 editorWidth 值超过当前容器宽度的 80%
- **THEN** 系统 SHALL 将 editorWidth 重置为 null（恢复 50/50 分割）
