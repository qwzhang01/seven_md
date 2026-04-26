## 1. 添加移动端断点配置

- [x] 1.1 在 `tailwind.config.js` 中添加 `screens: { md: '768px' }` 配置
- [x] 1.2 创建 `useMediaQuery` hook (`src/hooks/useMediaQuery.ts`) 用于检测移动端

## 2. 移动端编辑器+预览纵向布局

- [x] 2.1 在 AppV2.tsx 中为 `#md-mate-editor-preview` 添加响应式类名
  - 桌面端 (`md:`): `flex-row`
  - 移动端 (默认): `flex-col`
- [x] 2.2 为编辑器区域添加响应式高度样式 (`h-1/2` 移动端)
- [x] 2.3 为预览区域添加响应式高度样式 (`h-1/2` 移动端)
- [x] 2.4 移动端隐藏垂直 gutter，添加水平分隔符样式

## 3. 移动端侧边栏弹出覆盖

- [x] 3.1 创建 `useMobileSidebar` hook (`src/hooks/useMobileSidebar.ts`)
  - 检测当前是否为移动端 (<768px)
  - 管理移动端 sidebar overlay 状态
- [x] 3.2 修改 ActivityBar.tsx
  - 移动端点击图标时显示 overlay 而非切换 sidebarVisible
  - 点击 overlay 外部区域关闭 overlay
- [x] 3.3 修改 Sidebar.tsx
  - 移动端添加 `position: fixed` 绝对定位样式
  - overlay 宽度为 `w-72`
  - 添加半透明背景遮罩层
- [x] 3.4 在 AppV2.tsx 中整合移动端 sidebar overlay 逻辑

## 4. 响应式过渡动画

- [x] 4.1 添加布局切换的 CSS transition 效果 (~250ms)
- [x] 4.2 确保 resize 时内容不会丢失
