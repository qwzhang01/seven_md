## Context

当前 `AppV2.tsx` 中定义的快捷键配置缺少部分规范要求的快捷键：
- `Ctrl+I` 斜体：未实现
- `Ctrl+W` 关闭标签：未实现
- `Ctrl+Shift+E` 资源管理器：当前绑定为 `Ctrl+Shift+O`

## Goals / Non-Goals

**Goals:**
- 实现 `Ctrl+I` 斜体快捷键
- 实现 `Ctrl+W` 关闭标签快捷键
- 修正 `Ctrl+Shift+E` 绑定到资源管理器

**Non-Goals:**
- 不修改已正确实现的快捷键
- 不添加规范之外的快捷键

## Decisions

### 实现方式

在现有快捷键配置数组中添加/修改条目：

```tsx
// AppV2.tsx shortcuts 配置
{ key: 'i', ctrlKey: true, action: handleItalic, description: '斜体' },
{ key: 'w', ctrlKey: true, action: handleCloseTab, description: '关闭标签' },
{ key: 'e', ctrlKey: true, shiftKey: true, action: () => ui.setActiveSidebarPanel('explorer'), description: '资源管理器' },
```

### handleItalic 实现

```tsx
const handleItalic = useCallback(() => {
  if (ui.editorFocused) {
    window.dispatchEvent(new CustomEvent('editor:insert', { detail: '*' }))
  }
}, [ui.editorFocused])
```

### handleCloseTab 实现

复用现有的 dirty check 逻辑：

```tsx
const handleCloseTab = useCallback((tabId: string) => {
  const tab = tabs.find(t => t.id === tabId)
  if (!tab) return
  if (tab.isDirty) {
    setDirtyTabId(tabId)
  } else {
    closeTab(tabId)
  }
}, [tabs, closeTab])
```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| `Ctrl+W` 可能与其他系统快捷键冲突 | macOS 上 Cmd+W 是标准关闭快捷键， Ctrl+W 冲突概率低 |

## Open Questions

- 是否需要为 `Ctrl+W` 添加关闭前 dirty check？
