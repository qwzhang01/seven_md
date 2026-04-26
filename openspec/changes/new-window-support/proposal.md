## Why

根据交互规范，`Ctrl+Shift+N` 应打开新的 MD Mate 窗口。多窗口支持是桌面应用的重要功能，允许用户同时编辑多个工作区的文件，提升多任务处理效率。

## What Changes

- 实现 `Ctrl+Shift+N` 快捷键绑定到新建窗口
- 使用 Tauri 的窗口管理 API 创建新窗口实例
- 新窗口应独立运行，有独立的窗口状态
- 菜单项"新建窗口"也绑定到同一功能
- 新窗口打开后自动激活（聚焦）

## Capabilities

### New Capabilities

- `multi-window-support`: 多窗口支持，允许同时打开多个应用实例

## Impact

- 修改文件：`src/AppV2.tsx` 中的快捷键配置
- 修改文件：Tauri 配置文件（`src-tauri/tauri.conf.json`）添加窗口配置
- 可能需要修改：`src-tauri/src/main.rs` 添加窗口创建逻辑
- 依赖 Tauri 窗口管理 API
