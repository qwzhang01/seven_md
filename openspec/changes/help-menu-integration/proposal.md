## Why

帮助菜单是用户获取应用信息和帮助的重要入口。当前帮助菜单下拉项的点击事件未正确绑定或处理，导致用户无法使用欢迎页、检查更新等功能。需要全面检查并修复帮助菜单的交互功能。

## What Changes

### 需要检查和修复的菜单项

1. **欢迎页** (`menu-welcome`)
   - 当前：显示"开发中"提示
   - 目标：实现欢迎引导页（首次启动时显示，或通过菜单打开）

2. **Markdown 指南** (`menu-markdown-guide`)
   - 当前：打开 markdownguide.org
   - 目标：确认正常工作

3. **快捷键参考** (`menu-keyboard-shortcuts`)
   - 当前：打开快捷键对话框
   - 目标：确认正常工作

4. **关于 MD Mate** (`menu-about`)
   - 当前：打开关于对话框
   - 目标：确认正常工作

5. **检查更新** (`menu-check-update`)
   - 当前：显示"开发中"提示
   - 目标：实现版本检查功能（可使用 Tauri updater 或手动检查）

### 技术修复

- 检查 `AppV2.tsx` 中的 menu 事件监听器是否正确绑定
- 确认 Tauri 原生菜单项的事件能够正确触发
- 添加必要的状态管理和回调处理

## Capabilities

### Modified Capabilities

- `help-menu`: 修复帮助菜单各下拉项的点击功能

## Impact

- 修改文件：`src/AppV2.tsx` 中的菜单事件处理
- 可能新增：`src/components/dialogs/WelcomeDialog.tsx`（欢迎页）
- 可能新增：检查更新逻辑
