# Context Menu Hover Submenu - Tasks

## 1. EditorContextMenu Enhancement

- [x] 1.1 添加 `openSubmenu` state (`string | null`)
- [x] 1.2 在"插入"菜单项添加 `onMouseEnter` 展开子菜单
- [x] 1.3 添加子菜单区域 `onMouseLeave` 关闭子菜单
- [x] 1.4 实现子菜单定位计算（右侧展开，边界检测）

## 2. Edge Cases

- [x] 2.1 处理快速 hover/unhover 情况
- [x] 2.2 确保点击展开仍然正常工作
- [x] 2.3 移动端兼容性检查

## 3. Testing

- [ ] 3.1 测试 hover 展开子菜单
- [ ] 3.2 测试鼠标离开关闭子菜单
- [ ] 3.3 测试点击展开子菜单
- [ ] 3.4 测试边界情况下子菜单位置
