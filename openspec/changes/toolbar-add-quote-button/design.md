## Context

工具栏当前包含：撤销/重做、标题(H1-H3)、加粗/斜体/删除线、行内代码/代码块、链接/图片、无序列表/有序列表/任务列表、水平线、AI按钮。缺少"引用"按钮。

## Goals / Non-Goals

**Goals:**
- 添加引用按钮到工具栏
- 点击插入 Markdown 引用语法 `> `
- 有选中文本时包裹为引用格式

**Non-Goals:**
- 不修改现有按钮的行为
- 不改变工具栏的整体布局

## Decisions

### 按钮组件复用

参考现有按钮实现：

```tsx
<ToolbarButton
  icon={Quote}
  tooltip="引用 (Quote)"
  onClick={() => insertMarkdown('> ')}
/>
```

### 插入逻辑

使用已有的 `editor:insert` 自定义事件：

```tsx
const handleInsertQuote = () => {
  window.dispatchEvent(new CustomEvent('editor:insert', { 
    detail: '> ' 
  }))
}
```

### 样式和位置

- 使用 Lucide React 的 `Quote` 图标
- 位置：在"水平线"按钮之前，"表格"按钮之后
- 使用 `separator` 分隔符与相邻按钮区分

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 与其他格式按钮行为不一致 | 统一使用 `editor:insert` 事件模式 |
