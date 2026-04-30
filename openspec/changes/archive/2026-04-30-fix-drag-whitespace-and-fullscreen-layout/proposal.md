## Why

拖动 Gutter（编辑/预览分隔条）或侧边栏 resize handle 时，顶部出现白色区域并显示拖动内容的幽灵图像；全屏后白色区域进一步扩大。这两个问题严重影响使用体验，需要立即修复。

## What Changes

- **移除 `Toolbar` 上的 `data-tauri-drag-region` 属性**：Toolbar 包含大量可交互按钮，不应作为窗口拖动区域；该属性导致拖动 Gutter/Sidebar 时鼠标进入 Toolbar 区域触发 Tauri 原生窗口拖动，产生白色区域和拖动内容幽灵图像
- **在 `AppV2.tsx` 中渲染 `TitleBar` 组件**：TitleBar 是专门的窗口拖动区域（已有 `data-tauri-drag-region`），但当前未被渲染，导致没有合法的拖动区域，Tauri 可能回退到其他区域
- **拖动时禁用 Tauri 拖动区域**：在 Gutter 和 Sidebar resize handle 拖动期间，通过动态添加 CSS 类或覆盖层来阻止 Tauri 的原生窗口拖动响应
- **全屏时隐藏 TitleBar**：全屏模式下 TitleBar 不需要显示，避免占用空间和产生白色区域

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `view-layout`: 拖动 Gutter 时需要阻止 Tauri 原生窗口拖动干扰，全屏时布局需正确适配
- `toolbar-system`: 移除 Toolbar 上不应存在的 `data-tauri-drag-region`，Toolbar 是工具栏不是拖动区域
- `titlebar-system`: TitleBar 需要在 AppV2 中实际渲染，并在全屏时隐藏
- `sidebar-resize`: 侧边栏拖动时同样需要阻止 Tauri 原生窗口拖动干扰

## Impact

- `src/AppV2.tsx`：添加 `<TitleBar />` 渲染，全屏状态检测
- `src/components/toolbar-v2/Toolbar.tsx`：移除 `data-tauri-drag-region`
- `src/components/editor-v2/Gutter.tsx`：拖动期间禁用 Tauri drag region
- `src/components/sidebar-v2/Sidebar.tsx`：拖动期间禁用 Tauri drag region
- `src/components/titlebar-v2/TitleBar.tsx`：支持全屏时隐藏
