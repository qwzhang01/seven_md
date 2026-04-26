# Context Menu Hover Expand

## Overview

右键菜单的"插入"子菜单支持鼠标 hover 展开。

## Behavior

1. 鼠标移入"插入"菜单项
   - 子菜单立即展开

2. 鼠标移出"插入"菜单项和子菜单区域
   - 子菜单关闭

3. 点击"插入"菜单项
   - 子菜单展开（点击行为保持）

## Implementation

- 使用 `onMouseEnter` 和 `onMouseLeave` 事件
- 状态管理：`openSubmenu: string | null`
