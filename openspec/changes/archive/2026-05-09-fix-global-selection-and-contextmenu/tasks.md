## 1. 全局文本选择控制

- [x] 1.1 在 `src/index.css` 根元素添加 `user-select: none` 规则，禁止所有区域默认文本选择
- [x] 1.2 在 `src/index.css` 为编辑器内容区（`.cm-editor`）添加 `user-select: text` 恢复规则
- [x] 1.3 在 `src/index.css` 为预览面板正文区添加 `user-select: text` 恢复规则
- [x] 1.4 验证 CodeMirror 编辑器文本选择、光标操作、键盘选择正常工作

## 2. 全局右键菜单拦截

- [x] 2.1 在 `src/AppV2.tsx` 中注册全局 `contextmenu` 事件监听器（capture phase），默认调用 `preventDefault()`
- [x] 2.2 确保现有的 EditorContextMenu、ExplorerContextMenu、TabContextMenu 使用 `e.stopPropagation()` 以在全局拦截下仍正常弹出

## 3. ContextMenuBase 基础组件

- [x] 3.1 创建 `src/components/shared/ContextMenuBase.tsx` 基础组件，封装定位计算、视口边界检测、主题化样式
- [x] 3.2 实现外部点击关闭和 Escape 键关闭逻辑
- [x] 3.3 实现无障碍标注（`role="menu"` / `role="menuitem"`）和键盘导航

## 4. 预览面板右键菜单

- [x] 4.1 创建 `src/components/editor-v2/PreviewContextMenu.tsx` 组件，基于 ContextMenuBase
- [x] 4.2 实现菜单项：复制（依据选中状态启用/禁用）、全选、在文档中查找
- [x] 4.3 在 `PreviewPaneV2.tsx` 中注册 `onContextMenu` 事件，触发 PreviewContextMenu

## 5. 标签栏空白处右键菜单

- [x] 5.1 创建 `src/components/titlebar-v2/TabBarContextMenu.tsx` 组件，基于 ContextMenuBase
- [x] 5.2 实现菜单项：新建文件、打开文件、打开最近文件
- [x] 5.3 在 TabBar 组件中区分标签上右键（现有 TabContextMenu）和空白处右键（新 TabBarContextMenu），使用事件冒泡 + stopPropagation 隔离

## 6. 默认兜底右键菜单

- [x] 6.1 创建 `src/components/shared/DefaultContextMenu.tsx` 组件，基于 ContextMenuBase
- [x] 6.2 实现菜单项：新建文件、打开文件、打开文件夹、命令面板
- [x] 6.3 在 `AppV2.tsx` 的全局 contextmenu handler 中，对未被 stopPropagation 拦截的事件触发 DefaultContextMenu

## 7. 集成验证

- [x] 7.1 验证所有区域（工具栏、状态栏、活动栏）右键静默无菜单弹出
- [x] 7.2 验证编辑器、资源管理器、标签页原有右键菜单功能不受影响
- [x] 7.3 验证预览面板、标签栏空白处、兜底区域的新菜单正确显示和操作
