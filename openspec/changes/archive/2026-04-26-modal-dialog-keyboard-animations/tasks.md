## 1. AboutDialog 键盘交互增强

- [x] 1.1 在 `AboutDialog` 中添加 Enter 键处理，激活关闭按钮
- [x] 1.2 添加 Tab/Shift+Tab 焦点切换逻辑
- [x] 1.3 实现焦点陷阱，防止焦点逃逸到对话框外
- [x] 1.4 添加打开时自动聚焦到对话框的逻辑

## 2. AboutDialog 打开动画

- [x] 2.1 添加 CSS 类控制初始状态（opacity: 0, scale: 0.9）
- [x] 2.2 添加打开后的动画过渡样式（opacity + transform, 150ms, ease-out）
- [x] 2.3 使用 React state 控制动画触发时机

## 3. 测试验证

- [ ] 3.1 手动测试 Enter 键关闭对话框
- [ ] 3.2 手动测试 Tab/Shift+Tab 在对话框内循环
- [ ] 3.3 手动测试打开时焦点是否在对话框内
- [ ] 3.4 手动测试打开动画效果
