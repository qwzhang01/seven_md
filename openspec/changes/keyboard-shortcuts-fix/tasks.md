# Keyboard Shortcuts Fix - Tasks

## 1. AppV2.tsx Shortcuts

- [x] 1.1 实现 `Ctrl+I` 斜体快捷键 (`handleItalic`)
- [x] 1.2 实现 `Ctrl+W` 关闭标签快捷键
- [x] 1.3 修正 `Ctrl+Shift+E` 绑定到资源管理器

## 2. Implementation Details

- [x] 2.1 `handleItalic`: 编辑器焦点时插入 `*`
- [x] 2.2 `handleCloseTab`: 复用 dirty check 逻辑
- [x] 2.3 添加快捷键描述

## 3. Verification

- [x] 3.1 测试 `Ctrl+I` 在编辑器中插入斜体
- [x] 3.2 测试 `Ctrl+W` 关闭当前标签
- [x] 3.3 测试 `Ctrl+Shift+E` 打开资源管理器
