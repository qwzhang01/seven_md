## MODIFIED Requirements

### Requirement: 编辑器右键菜单事件处理
编辑器右键菜单 SHALL 使用 `e.stopPropagation()` 防止事件冒泡到全局 contextmenu handler，确保在全局拦截机制下自定义菜单仍能正常工作。

#### Scenario: 编辑器区域右键事件不冒泡
- **WHEN** 用户在编辑器区域右键点击
- **THEN** 编辑器自定义右键菜单正常弹出
- **THEN** 事件不会冒泡到全局 contextmenu handler
- **THEN** 不会触发兜底菜单

#### Scenario: 编辑器右键菜单保持原有功能
- **WHEN** 用户在编辑器区域右键点击并使用菜单
- **THEN** 剪切/复制/粘贴/全选/查找/格式化/AI改写等功能正常可用
