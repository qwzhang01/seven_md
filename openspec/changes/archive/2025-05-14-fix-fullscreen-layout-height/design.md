## Context

当前应用使用 Tauri v2 + React + Tailwind CSS 构建，窗口装饰（`decorations: true`）由 macOS 系统原生渲染。

**当前问题根因分析：**

1. **`isFullscreen` 状态丢失**：之前 `2026-04-30-fix-drag-whitespace-and-fullscreen-layout` 已实现全屏检测和 TitleBar 渲染，但当前 `AppV2.tsx` 中不存在 `isFullscreen` 状态变量，也没有 `<TitleBar />` 的渲染——说明后续代码改动丢失了这些修复。

2. **根容器高度问题**：`AppV2.tsx` 根 `<div>` 使用 `className="h-screen"`（`height: 100vh`），在 macOS 全屏模式下，`100vh` 的计算可能与 Tauri WebView 的实际可视区域不一致，导致底部出现空白。macOS 全屏时系统菜单栏会隐藏/显示，影响 viewport 高度计算。

3. **TitleBar 未渲染**：`TitleBar.tsx` 组件存在但未在 `AppV2.tsx` 中渲染。正常模式下需要 TitleBar 作为窗口拖动区域（`data-tauri-drag-region`），全屏时应隐藏。

**当前布局结构（自上而下）：**
- Toolbar（40px）
- Main Area（flex-1）：ActivityBar + Sidebar + Editor Area
- StatusBar（24px）

**缺失的：** TitleBar（38px）应在 Toolbar 上方。

## Goals / Non-Goals

**Goals:**
- 修复全屏模式下底部出现大片暗色空白区域的问题
- 恢复 `TitleBar` 在 `AppV2.tsx` 中的渲染
- 恢复 `isFullscreen` 状态检测，全屏时隐藏 TitleBar
- 确保根容器在全屏和非全屏模式下都能正确填满窗口高度
- 将 `isFullscreen` 状态存入 `useUIStore` 以便其他组件（如 AI Panel）复用

**Non-Goals:**
- 不修改 Tauri 的 `decorations` 配置（保持 `true`）
- 不重构整体布局架构
- 不修改 macOS 原生交通灯按钮行为
- 不修改 Gutter/Sidebar 拖动时的 `data-resizing` 逻辑（已工作正常）

## Decisions

### Decision 1: 根容器高度使用 `h-dvh` 替代 `h-screen`

**选择**：将 `AppV2.tsx` 根 `<div>` 的 `className` 从 `h-screen` 改为 `h-dvh`（`height: 100dvh`），Tailwind CSS v3 支持 `h-dvh`。

**理由**：`100dvh`（dynamic viewport height）会随着浏览器/系统 UI 的动态变化而更新（如 macOS 全屏时系统菜单栏隐藏），而 `100vh` 在某些情况下使用的是初始 viewport 高度，不会动态更新。在 Tauri 的 WebView 容器中，`100dvh` 更精准地反映实际可用高度。

**替代方案**：使用 `height: 100%` + `html, body { height: 100% }` → 可行但需要额外修改 index.html 或全局 CSS，`h-dvh` 更简洁。

**Fallback**：如果 Tailwind v3 不支持 `h-dvh`，则使用 inline style `height: '100dvh'`，并添加 CSS fallback `height: 100vh` 给不支持的环境。

### Decision 2: 恢复 TitleBar 渲染及全屏隐藏

**选择**：在 `AppV2.tsx` Toolbar 上方渲染 `<TitleBar isFullscreen={isFullscreen} />`。TitleBar 接受 `isFullscreen` prop，全屏时设 `height: 0; overflow: hidden`。

**理由**：TitleBar 提供 `data-tauri-drag-region` 作为窗口拖动区域，macOS 的原生交通灯按钮自动覆盖在 TitleBar 左侧。全屏时交通灯消失、不需要拖动区域，应隐藏 TitleBar。

### Decision 3: 在 useUIStore 中维护 isFullscreen 状态

**选择**：在 `useUIStore` 中新增 `isFullscreen: boolean` 状态和 `setIsFullscreen` action。在 `AppV2.tsx` 的 Tauri 事件监听 `useEffect` 中，监听 `tauri://resize` 事件，异步查询 `getCurrentWindow().isFullscreen()` 并更新 store。

**理由**：将 `isFullscreen` 放入全局 store 而非组件 local state，便于其他组件（如 AI Panel 的 top 计算引用了 `--titlebar-height`）复用。不持久化（不加入 `partialize`），因为全屏是运行时状态。

**替代方案**：使用组件 local state `useState` → 只有 AppV2 能访问，其他组件如需要还得 prop drilling。

### Decision 4: 初始化时也检测全屏状态

**选择**：在 `AppV2.tsx` 的 setup `useEffect` 中，除了监听 `tauri://resize` 事件，还在启动时立即调用一次 `getCurrentWindow().isFullscreen()` 设置初始状态。

**理由**：如果应用在全屏状态下重新加载（开发模式 HMR），需要立即反映正确的全屏状态，而不是等到下一次 resize 事件。

## Risks / Trade-offs

- [Risk] `100dvh` 在较旧的 WebView 版本中可能不受支持 → Mitigation: Tauri v2 在 macOS 上使用 WKWebView（Safari 15.4+），已支持 `dvh`；额外添加 `100vh` 作为 fallback
- [Risk] `tauri://resize` 事件可能在全屏动画进行中触发，此时 `isFullscreen()` 返回值可能不准确 → Mitigation: 使用 `requestAnimationFrame` 或短延时（50ms）后再查询全屏状态
- [Risk] AI Panel 的 `top` 计算引用了 `--titlebar-height`，全屏隐藏 TitleBar 后可能错位 → Mitigation: AI Panel 应根据 `isFullscreen` 调整 top 计算，或使用动态 CSS 变量
