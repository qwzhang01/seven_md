## Context

当前 `Ctrl+Shift+N` 快捷键和"新建窗口"菜单项均显示"开发中"提示，未实现多窗口功能。Tauri 支持通过 API 创建多个窗口实例。

## Goals / Non-Goals

**Goals:**
- 实现 `Ctrl+Shift+N` 创建新窗口
- 实现"新建窗口"菜单项
- 新窗口独立运行，有独立状态

**Non-Goals:**
- 不实现窗口间通信
- 不实现窗口状态同步

## Decisions

### Tauri 窗口 API

使用 `@tauri-apps/api/window` 创建新窗口：

```typescript
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

const createNewWindow = async () => {
  const webview = new WebviewWindow('main-' + Date.now(), {
    title: 'Seven Markdown',
    width: 1200,
    height: 800,
    center: true,
  })
  
  webview.once('tauri://created', () => {
    console.log('新窗口已创建')
  })
  
  webview.once('tauri://error', (e) => {
    console.error('创建窗口失败', e)
  })
}
```

### 标签页 vs 多窗口

| 方案 | 优点 | 缺点 |
|------|------|------|
| 标签页（当前） | 资源占用少，切换方便 | 不能同时查看两个工作区 |
| 多窗口 | 完全独立，可多显示器 | 资源占用多 |

**决策**: 保留标签页机制，多窗口作为补充（新窗口可包含自己的标签页）

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 窗口过多导致资源占用大 | 用户需手动管理窗口数量 |
| 窗口状态不同步 | 新窗口从空白状态开始（而非复制当前状态） |

## Open Questions

- 新窗口是否需要加载相同的 workspace？
- 是否需要"关闭窗口"菜单项（除关闭标签外）？
