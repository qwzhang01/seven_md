## Context

当前应用使用 Tauri + React 构建，窗口装饰（`decorations: true`）由 macOS 系统原生渲染。Tauri 通过 `data-tauri-drag-region` HTML 属性标记可拖动窗口的区域。

**当前问题根因分析：**

1. **拖动时白色区域 + 内容幽灵图像**：`Toolbar.tsx` 上设置了 `data-tauri-drag-region`，使整个工具栏成为窗口拖动区域。当用户拖动 Gutter（编辑/预览分隔条）或 Sidebar resize handle 时，鼠标移入 Toolbar 区域后，Tauri 的原生窗口拖动机制被触发，导致：
   - 窗口开始移动，露出底层白色桌面背景
   - 系统产生窗口内容的拖动幽灵图像（drag ghost）
   - 即使 `document.body.style.userSelect = 'none'` 也无法阻止 Tauri 原生拖动

2. **全屏后白色区域扩大**：`TitleBar` 组件（专门的拖动区域，38px 高）在 `AppV2.tsx` 中被 import 但从未渲染。`Toolbar` 承担了拖动区域的职责，但全屏时 macOS 会调整窗口 chrome，`Toolbar` 的 `data-tauri-drag-region` 在全屏模式下行为异常，导致白色区域扩大。

## Goals / Non-Goals

**Goals:**
- 移除 `Toolbar` 上的 `data-tauri-drag-region`，Toolbar 是交互工具栏，不应是窗口拖动区域
- 在 `AppV2.tsx` 中渲染 `TitleBar` 组件，作为唯一合法的窗口拖动区域
- 拖动 Gutter 或 Sidebar resize handle 期间，通过在 `document.documentElement` 上添加 CSS 类（如 `is-resizing`）来禁用所有 `data-tauri-drag-region` 的响应
- 全屏时隐藏 TitleBar（高度为 0），避免占用空间

**Non-Goals:**
- 不修改 Tauri 的 `decorations` 配置（保持 `true`）
- 不重构整体布局结构
- 不修改 macOS 原生交通灯按钮的行为

## Decisions

### Decision 1: 移除 Toolbar 的 data-tauri-drag-region

**选择**：直接删除 `Toolbar.tsx` 中的 `data-tauri-drag-region` 属性。

**理由**：Toolbar 包含大量可点击按钮，将其设为拖动区域是错误的设计。TitleBar 才是专门的拖动区域。

**替代方案**：在 Toolbar 内部添加一个专门的空白拖动区域 → 拒绝，因为 Toolbar 空间有限且按钮密集，没有合适的空白区域。

### Decision 2: 渲染 TitleBar 组件

**选择**：在 `AppV2.tsx` 的 Toolbar 上方渲染 `<TitleBar />`，作为唯一的 `data-tauri-drag-region`。

**理由**：TitleBar 已经正确实现了拖动区域，只是未被渲染。macOS 的原生交通灯按钮会自动覆盖在 TitleBar 左侧，不需要额外处理。

**全屏处理**：监听 Tauri 的 `tauri://resize` 事件或使用 `getCurrentWindow().isFullscreen()` 检测全屏状态，全屏时将 TitleBar 高度设为 0（`height: 0, overflow: hidden`）。

### Decision 3: 拖动期间禁用 Tauri drag region

**选择**：在 Gutter 和 Sidebar 的 `mousedown` 处理器中，向 `document.documentElement` 添加 `data-resizing` 属性；在 `mouseup` 时移除。通过 CSS 规则 `[data-resizing] [data-tauri-drag-region] { -webkit-app-region: no-drag; }` 临时禁用拖动区域。

**理由**：这是最轻量的方案，不需要修改 Tauri 配置，纯 CSS + DOM 属性控制，无副作用。

**替代方案**：使用 `pointer-events: none` 覆盖层 → 会阻止 mouseup 事件，导致拖动无法正常结束。

## Risks / Trade-offs

- [Risk] TitleBar 渲染后占用 38px 高度，减少编辑区域空间 → Mitigation: 全屏时隐藏 TitleBar，正常模式下 38px 是合理的标题栏高度，与 VS Code 一致
- [Risk] `[data-resizing]` CSS 方案依赖 `-webkit-app-region` 属性，仅在 WebKit/Blink 内核有效 → Mitigation: Tauri 使用 WebView（macOS 上为 WKWebView），支持 `-webkit-app-region`
- [Risk] 全屏检测的时机问题（resize 事件可能有延迟）→ Mitigation: 监听 Tauri 的 `tauri://resize` 事件，并在事件回调中异步查询 `isFullscreen()`
