## 1. TitleBar 精简

- [x] 1.1 修改 `TitleBar.tsx`，移除 TabBar 相关代码
- [x] 1.2 移除 `TitleBarActions` 的引用和渲染

## 2. Toolbar 改造

- [x] 2.1 在 `Toolbar.tsx` 右侧添加操作按钮组
- [x] 2.2 添加按钮顺序：命令面板 | 侧边栏切换 | AI

## 3. 布局结构调整

- [x] 3.1 修改 `AppV2.tsx`，将 TabBar 移到 Toolbar 和 Editor 之间
- [x] 3.2 确保编辑区域使用 `flex-1` 占据剩余空间

## 4. 移除 TitleBarActions 组件

- [x] 4.1 删除 `TitleBarActions.tsx` 文件

## 5. 验证与测试

- [ ] 5.1 验证命令面板按钮功能正常
- [ ] 5.2 验证侧边栏切换按钮功能正常
- [ ] 5.3 验证 AI 助手按钮功能正常
- [ ] 5.4 验证 TabBar 在新位置（Toolbar 下方）显示
- [ ] 5.5 验证标签拖拽重排功能正常
- [ ] 5.6 验证未保存指示器功能正常
- [ ] 5.7 验证悬停关闭按钮功能正常
