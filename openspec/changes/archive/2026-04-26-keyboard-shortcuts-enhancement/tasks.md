## 1. 准备工作

- [x] 1.1 分析现有 AppV2.tsx 中的 shortcuts 数组，了解当前注册情况
- [x] 1.2 检查 useKeyboardShortcuts Hook 的当前实现，确认平台适配逻辑

## 2. 面板切换快捷键实现

- [x] 2.1 在 AppV2.tsx shortcuts 数组添加 Ctrl+Shift+E（资源管理器）
- [x] 2.2 在 AppV2.tsx shortcuts 数组添加 Ctrl+Shift+F（搜索面板）
- [x] 2.3 在 AppV2.tsx shortcuts 数组添加 Ctrl+Shift+O（大纲面板）
- [x] 2.4 验证面板切换时焦点正确移动到对应面板

## 3. 窗口标签管理快捷键

- [x] 3.1 在 AppV2.tsx shortcuts 数组添加 Ctrl+W（关闭标签）
- [x] 3.2 实现关闭前的保存提示逻辑
- [x] 3.3 验证关闭后焦点正确切换到相邻标签

## 4. 查找替换快捷键

- [x] 4.1 在 AppV2.tsx shortcuts 数组添加 Ctrl+H（查找+替换）
- [x] 4.2 验证 Ctrl+H 正确打开 FindReplaceBar 并聚焦到替换输入框
- [x] 4.3 检查 menu-find/menu-replace 事件是否也正确触发面板

## 5. 编辑格式快捷键

- [x] 5.1 在 AppV2.tsx shortcuts 数组添加 Ctrl+B（加粗），添加编辑器焦点条件
- [x] 5.2 在 AppV2.tsx shortcuts 数组添加 Ctrl+I（斜体），添加编辑器焦点条件
- [x] 5.3 在 AppV2.tsx shortcuts 数组添加 Ctrl+K（链接），添加编辑器焦点条件
- [x] 5.4 实现加粗/斜体/链接的具体格式化逻辑
- [x] 5.5 验证快捷键在编辑器无焦点时不触发

## 6. 快捷键冲突修正

- [x] 6.1 评估现有 Ctrl+B（侧边栏切换）的使用位置
- [x] 6.2 移除或限制 Ctrl+B 侧边栏切换（保留非编辑器焦点时的行为）
- [x] 6.3 更新相关文档和命令面板说明

## 7. 测试验证

- [ ] 7.1 在 macOS 平台验证 metaKey 映射正确
- [ ] 7.2 在 Windows/Linux 平台验证 Ctrl 映射正确
- [ ] 7.3 测试快捷键在模态对话框打开时正确禁用
- [ ] 7.4 验证所有新快捷键在命令面板中正确显示
