# Explorer Context Menu - Tasks

## 1. ContextMenu Component

- [x] 1.1 创建通用 `ContextMenu` 组件
- [x] 1.2 定义 `ContextMenuItem` 和 `ContextMenuProps` 类型
- [x] 1.3 实现菜单定位（跟随鼠标/锚点）
- [x] 1.4 实现菜单关闭逻辑（点击外部/Esc）

## 2. ExplorerPanel Integration

- [x] 2.1 在文件节点添加 `onContextMenu` 事件
- [x] 2.2 在文件夹节点添加 `onContextMenu` 事件
- [x] 2.3 传递节点信息给 ContextMenu
- [x] 2.4 平台检测（macOS 显示 Finder 选项）

## 3. File Operations (Tauri API)

- [x] 3.1 实现新建文件功能
- [x] 3.2 实现新建文件夹功能
- [x] 3.3 实现重命名功能
- [x] 3.4 实现删除功能（带确认对话框）
- [x] 3.5 实现复制路径到剪贴板

## 4. Platform-Specific Operations

- [x] 4.1 实现"在终端中打开"
- [x] 4.2 实现"在 Finder 中显示"（macOS）
- [x] 4.3 Windows/Linux 替代方案

## 5. Testing

- [x] 5.1 测试文件右键菜单
- [x] 5.2 测试文件夹右键菜单
- [x] 5.3 测试各操作功能正常
- [x] 5.4 测试删除确认对话框
