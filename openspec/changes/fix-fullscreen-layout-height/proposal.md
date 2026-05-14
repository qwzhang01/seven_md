## Why

macOS 全屏模式下，应用布局未能正确填满整个屏幕高度——底部出现大片暗色空白区域。根因是之前修复的 `isFullscreen` 状态检测和 `TitleBar` 全屏隐藏逻辑已从 `AppV2.tsx` 中丢失，且根容器使用 `h-screen`（`100vh`）在 macOS 全屏切换时存在视口高度计算不准确的问题。

## What Changes

- **恢复全屏状态检测**：在 `AppV2.tsx` 中重新添加 `isFullscreen` 状态，通过监听 Tauri 的 `tauri://resize` 事件和 `getCurrentWindow().isFullscreen()` 检测全屏状态变化
- **恢复 TitleBar 渲染及全屏隐藏**：在 `AppV2.tsx` 布局中重新渲染 `<TitleBar />` 组件，并在全屏时隐藏（高度为 0）以避免占用空间
- **修复根容器高度策略**：将根容器从 `h-screen`（`100vh`）改为使用 `100dvh`（dynamic viewport height）或 Tauri 窗口实际尺寸，确保全屏切换时布局正确填满窗口
- **TitleBar 组件支持 fullscreen prop**：`TitleBar` 接受 `isFullscreen` prop，全屏时通过 `height: 0; overflow: hidden` 隐藏

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `titlebar-system`: TitleBar 需要在 AppV2 中实际渲染，并支持通过 `isFullscreen` prop 在全屏时自动隐藏
- `view-layout`: 根布局容器高度策略需支持全屏模式，确保布局填满整个窗口高度
- `responsive-layout`: 全屏状态变化时布局需平滑适配，不产生空白区域

## Impact

- `src/AppV2.tsx`：添加 `isFullscreen` 状态、`tauri://resize` 事件监听、`<TitleBar />` 渲染、根容器高度修复
- `src/components/titlebar-v2/TitleBar.tsx`：接受 `isFullscreen` prop，全屏时隐藏
- `src/stores/useUIStore.ts`：可选添加 `isFullscreen` 到 UI store 以供其他组件使用
- `src/index.css` 或 `src/styles/themes.css`：可能需要添加全屏相关 CSS 规则
