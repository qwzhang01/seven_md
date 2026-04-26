## Context

当前应用使用 Tauri 原生菜单，但菜单配置分散在 Rust 代码中。需要全面检查和补充菜单功能，参照 VS Code 和主流 macOS 软件的菜单设计。

## Goals / Non-Goals

**Goals:**
- 完整的应用菜单栏（文件、编辑、插入、视图、主题、窗口、帮助）
- 所有菜单项正确绑定事件处理
- macOS 原生菜单风格

**Non-Goals:**
- 不实现 HTML/CSS 模拟的菜单栏
- 不实现右键上下文菜单（已有专门 issue）

## Decisions

### 菜单配置架构

```typescript
// src-tauri/src/menu.rs 或前端配置文件

const menuTemplate: MenuItem[] = [
  {
    label: '文件',
    submenu: [
      { label: '新建文件', shortcut: 'CmdOrCtrl+N', action: 'menu-new-file' },
      { label: '新建窗口', shortcut: 'CmdOrCtrl+Shift+N', action: 'menu-new-window' },
      { type: 'separator' },
      { label: '打开文件...', shortcut: 'CmdOrCtrl+O', action: 'menu-open-file' },
      // ...
    ]
  },
  // ...
]
```

### 事件统一处理

所有菜单事件通过 Tauri 事件系统分发：

```typescript
// Rust 端
menu.on_click(|id| {
  app.emit(id, ());
})

// React 端
listen('menu-new-file', () => handleNewFile())
listen('menu-save', () => handleSave())
```

### macOS 特定菜单

macOS 要求特定菜单位置：
- 应用名称菜单（"Seven Markdown"）包含关于、偏好设置
- 窗口菜单包含最小化、缩放等

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 跨平台菜单差异 | 使用条件编译或运行时检测平台 |
| 菜单项过多 | 使用子菜单分组，保持简洁 |

## Open Questions

- 是否需要"格式"菜单（与"插入"合并还是分开）？
- 是否需要"编辑"菜单下的"查找"子菜单？
