## Context

当前 Seven Markdown 的侧边栏功能在规范（openspec/specs/）中已有明确定义，但代码实现与规范存在差异：

1. **ActivityBar.tsx (第44行)**：当前 `onClick` 只调用 `setActiveSidebarPanel(item.id)`，缺少再次点击已激活图标时收起侧边栏的逻辑
2. **Sidebar.tsx**：已实现 resize handle，但视觉反馈不够明显，缺少悬停高亮效果
3. **ExplorerPanel.tsx**："打开的文件" section 缺少悬停操作按钮（新建文件/文件夹/刷新/折叠）

相关规范文件：
- `openspec/specs/activity-bar/spec.md` (第38-41行)
- `openspec/specs/sidebar-resize/spec.md`
- `openspec/specs/sidebar-explorer/spec.md` (第52-67行)

## Goals / Non-Goals

**Goals:**
- 修复 ActivityBar 再次点击已激活图标时收起侧边栏的交互
- 增强 Sidebar resize handle 的视觉反馈
- 补全 ExplorerPanel 所有 section header 的悬停操作按钮

**Non-Goals:**
- 不重新设计侧边栏的整体架构
- 不修改 Store 的状态管理结构
- 不添加新的快捷键或命令面板条目

## Decisions

### D1: ActivityBar 点击逻辑修复

**方案**：修改 `onClick` 逻辑，添加条件判断：
```typescript
onClick={() => {
  if (activeSidebarPanel === item.id && sidebarVisible) {
    setSidebarVisible(false)
  } else {
    setActiveSidebarPanel(item.id)
  }
}}
```

**替代方案**：依赖 `setActiveSidebarPanel` 内部的 sidebarVisible 切换逻辑

**选择理由**：当前 store 中的逻辑存在边界情况问题（如上分析），显式处理更清晰可靠

### D2: Resize Handle 视觉增强

**方案**：将 handle 从 1px 改为 4px 区域，添加更明显的 hover 高亮

**选择理由**：当前 1px handle 太小不易发现，需要更大的可操作区域和更明显的视觉反馈

### D3: Explorer 操作按钮补全

**方案**：在"打开的文件" section header 添加与"工作区"一致的按钮组

**选择理由**：保持 UI 一致性，两处 section 都应提供相同的操作能力

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 修改 ActivityBar 影响其他依赖 `setActiveSidebarPanel` 的地方 | 仅修改 ActivityBar 的 onClick，Store 逻辑保持不变 |
| resize handle 区域增大可能遮挡内容 | 设置合适的 z-index 和透明背景 |
| Explorer 按钮过多导致视觉拥挤 | 按钮仅在 group-hover 时显示 |
