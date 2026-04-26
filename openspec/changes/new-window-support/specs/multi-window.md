# Multi-Window Support

## Overview

支持通过 `Ctrl+Shift+N` 或菜单创建新的应用窗口。

## Behavior

1. 触发新建窗口
   - 创建新的 Tauri WebviewWindow
   - 新窗口独立运行
   - 窗口标题：Seven Markdown

2. 窗口配置
   - 默认大小：1200x800
   - 居中显示
   - 可独立调整大小

## Technical

使用 `@tauri-apps/api/webviewWindow` 创建新窗口实例。
