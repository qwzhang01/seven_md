## Context

**当前布局：**
```
┌─────────────────────────────────────────────────────────────┐
│ [●][○][○]  Tab1 | Tab2 | Tab3           [Cmd] [Side] [AI] │  <- TitleBar
├─────────────────────────────────────────────────────────────┤
│ [Undo][Redo] | [Bold][Italic] | [H1][H2] | [Code]         │  <- Toolbar
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      Editor / Preview                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**目标布局：**
```
┌─────────────────────────────────────────────────────────────┐
│ [●][○][○]                                                  │  <- TitleBar (仅交通灯)
├─────────────────────────────────────────────────────────────┤
│ [Undo][Redo] | [Bold][Italic] | [H1][H2] | [Cmd][Side][AI] │  <- Toolbar
├─────────────────────────────────────────────────────────────┤
│ Tab1 | Tab2 | Tab3                                         │  <- TabBar (Toolbar 下方)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      Editor / Preview                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**关键组件：**
- `TitleBar.tsx`：当前包含 TabBar + TitleBarActions，需精简为仅交通灯区域
- `TitleBarActions.tsx`：包含命令面板、侧边栏切换按钮，需删除（功能移至 Toolbar）
- `Toolbar.tsx`：需添加右侧操作按钮组
- `TabBar.tsx`：需移动到窗口底部

## Goals / Non-Goals

**Goals:**
- 将 TabBar 从窗口顶部移动到窗口底部
- 将 TitleBarActions 按钮整合到 Toolbar 右侧
- 保持所有现有功能（拖拽重排、未保存指示器、悬停关闭）不变
- 简化 TitleBar 组件，只保留交通灯

**Non-Goals:**
- 不改变按钮的图标、样式、交互行为
- 不修改功能逻辑
- 不改变编辑器、预览区域的布局

## Decisions

### Decision 1: TabBar 组件重用

**选择：** 重用现有的 `TabBar.tsx` 组件，只修改其挂载位置

**理由：**
- TabBar 已有完整的交互功能（拖拽、未保存指示器等）
- 只需调整布局位置，不需要重写组件逻辑
- 减少代码重复和维护成本

### Decision 2: TitleBarActions 整合到 Toolbar

**选择：** 将 TitleBarActions 的按钮移动到 Toolbar 最右边，作为最后一个 ToolbarGroup

**理由：**
- 保持按钮的功能逻辑不变，只需移动位置
- Toolbar 已有良好的分组结构，易于添加新按钮组
- 减少组件数量，简化代码结构

### Decision 3: 按钮顺序

**选择：** 从左到右顺序为：编辑工具按钮... | 命令面板 | 侧边栏切换 | AI

**理由：**
- 命令面板（Ctrl+Shift+P）是最常用的全局操作
- AI 助手是特色功能，放在最右边便于识别
- 符合大多数编辑器的操作习惯

### Decision 4: App.tsx 布局结构调整

**选择：** 在 `App.tsx` 中调整布局结构

```tsx
// 新的布局结构
<div className="h-screen flex flex-col">
  {/* 顶部：TitleBar (仅交通灯) */}
  <TitleBar />
  
  {/* Toolbar */}
  <Toolbar />
  
  {/* 中间：Editor + Preview (flex-1 占据剩余空间) */}
  <div className="flex-1 overflow-hidden">
    {editorContent}
  </div>
  
  {/* 底部：TabBar */}
  <TabBar />
</div>
```

**理由：**
- TabBar 放在 flex-1 元素之后，自然占据底部
- 保持编辑区域 flex-1 确保占据所有可用空间
- 布局清晰，层级分明

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| TabBar 移动后可能影响拖拽区域 | 用户可能无法正常拖拽窗口 | 确保 TitleBar 保持 data-tauri-drag-region |
| 按钮过多导致 Toolbar 拥挤 | 工具栏可能超出屏幕宽度 | 使用 overflow 处理，必要时水平滚动 |
| 删除 TitleBarActions 影响现有功能 | 可能遗漏某些功能 | 仔细对比按钮功能，确保全部迁移到 Toolbar |

## Migration Plan

1. **Phase 1**: 在 `App.tsx` 中添加底部 TabBar，保持原有 TitleBar TabBar 不变
2. **Phase 2**: 将 TitleBarActions 按钮添加到 Toolbar 右侧
3. **Phase 3**: 从 `TitleBar.tsx` 移除 TabBar 和 TitleBarActions
4. **Phase 4**: 删除 `TitleBarActions.tsx` 文件
5. **Phase 5**: 验证所有功能正常

## Open Questions

1. TabBar 移到窗口底部后，底部与窗口边缘的间距应该是多少？（需要参考原型图确定）
2. 是否需要为底部 TabBar 添加额外的样式调整以区分顶部 TitleBar？
