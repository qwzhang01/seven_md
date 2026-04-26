## Why

macOS 上运行 Seven MD 时，窗口同时出现两套交通灯按钮（关闭/最小化/最大化）和两套顶部菜单栏。原因是 Tauri 后端（`decorations: true` + `tauri::menu` 原生菜单）和前端 React 层（`TrafficLights.tsx` + `MenuBar.tsx`）分别实现了各自独立的窗口控件和菜单系统，两层叠加导致视觉重复和交互混乱。

Seven MD 是一个高频使用的 Markdown 工具，用户对窗口操作的响应速度和一致性要求极高。经过技术调研和对比分析，决定采用 **「保留原生、移除前端」** 方案：

- **原生交通灯**由 macOS 系统直接渲染，动画流畅、响应即时、无需 JS bridge 调用
- **原生菜单栏**位于 macOS 系统顶部，符合用户的平台使用习惯（与 Finder、Safari 等系统应用一致），且支持系统级快捷键、VoiceOver 无障碍、系统全局搜索（Help → Search）
- 主流 Tauri/Electron 桌面应用（如 Zed、Warp、iTerm2）均优先使用原生窗口装饰和菜单

## What Changes

- **保留系统原生窗口装饰**：`tauri.conf.json5` 中 `decorations` 保持 `true`，macOS 系统自动渲染原生交通灯和标题栏
- **重写 Rust 原生菜单，100% 覆盖前端功能**：以前端菜单（7 个菜单、57 个功能项）为准，重写 `main.rs` 中的原生菜单。当前原生菜单仅有 File/Edit/View/Help 共 16 项，需扩展为 File/Edit/View/Insert/Format/Theme/Help 共 60 项（含原生独有的 CloseFolder/SelectAll/Quit），逐项对齐前端菜单的每一个功能
- **添加前端 Tauri 事件监听**：在前端添加对全部 60 个原生菜单项的 `menu-*` 事件监听和处理（当前前端未监听这些事件），桥接到现有的 store action 和 editor 自定义事件
- **删除前端 MenuBar 组件**：删除整个 `src/components/menubar-v2/` 目录（10 个文件），从 `AppV2.tsx` 中移除 `<MenuBar />` 渲染
- **删除前端 TrafficLights 组件**：删除 `src/components/titlebar-v2/TrafficLights.tsx`，从 `TitleBar.tsx` 中移除 `<TrafficLights />` 引用
- **删除前端菜单状态管理**：删除 `src/hooks/useMenuState.tsx` 和对应测试文件
- **清理 CSS**：移除 `--menubar-height` 变量、`[data-component="menubar"]` 响应式样式、`[class*="MenuBar"]` 打印样式等
- **更新 E2E 测试**：更新或移除依赖前端 MenuBar 的 E2E 测试页面对象和用例
- **不做向后兼容**：不用的代码直接删除，不保留切换开关或 fallback

## Capabilities

### New Capabilities
- `native-window-chrome`: 使用系统原生窗口装饰（交通灯 + 标题栏）和原生菜单栏，配合前端 TitleBar（TabBar + Actions）提供完整的窗口交互体验

### Modified Capabilities
（无现有 spec 需要修改）

## Impact

- **Rust 后端** (`src-tauri/src/main.rs`)：重写菜单区域，从 4 个菜单 16 项扩展为 7 个菜单 60 项（100% 覆盖前端菜单全部功能），代码量从约 130 行增长到约 350 行
- **Tauri 配置** (`src-tauri/tauri.conf.json5`)：`decorations` 保持 `true`（无需修改）
- **前端组件 — 删除**：
  - `src/components/menubar-v2/` 整个目录（10 个文件）
  - `src/components/titlebar-v2/TrafficLights.tsx`
  - `src/hooks/useMenuState.tsx` + `src/hooks/useMenuState.test.tsx`
- **前端组件 — 修改**：
  - `src/AppV2.tsx`：移除 MenuBar 导入和渲染、添加原生菜单事件监听
  - `src/components/titlebar-v2/TitleBar.tsx`：移除 TrafficLights 引用
  - `src/components/titlebar-v2/index.ts`：移除 TrafficLights 导出
- **CSS 清理**：`src/styles/themes.css`、`src/index.css` 中的 menubar 相关样式
- **E2E 测试**：`e2e/pages/MenuBarPage.ts`、`e2e/fixtures/index.ts`、`e2e/pages/PageObjectFactory.ts` 及相关测试用例
- **跨平台**：Windows 上同样使用原生窗口装饰；原生菜单在 Windows 上显示为窗口内嵌菜单栏（Tauri v2 默认行为），交通灯不显示（Windows 使用系统自带的最小化/最大化/关闭按钮）
- **无 Breaking Change**：用户层面功能不变，菜单内容完全覆盖且更符合平台规范
