## 1. ActivityBar 点击逻辑修复

- [x] 1.1 修改 `src/components/activitybar-v2/ActivityBar.tsx` onClick 逻辑，添加条件判断处理再次点击收起侧边栏
- [x] 1.2 从 useUIStore 解构 `setSidebarVisible` 方法
- [x] 1.3 验证三种场景：点击已激活图标、点击未激活图标、侧边栏收起时点击

## 2. Sidebar Resize Handle 视觉增强

- [x] 2.1 修改 `src/components/sidebar-v2/Sidebar.tsx` resize handle 宽度从 1px 增加到 4px
- [x] 2.2 增强 hover 高亮效果，使边缘线条更明显
- [x] 2.3 验证 hover 时光标变化和高亮显示

## 3. Explorer 操作按钮补全

- [x] 3.1 在 `src/components/sidebar-v2/ExplorerPanel.tsx` 的"打开的文件" section header 添加操作按钮组
- [x] 3.2 添加新建文件、刷新按钮（与"工作区" section 风格一致）
- [x] 3.3 验证悬停显示/隐藏效果
