## Context

`OutlinePanel.tsx` 当前解析并显示文档标题，但所有标题使用相同的文字颜色。交互规范要求 H1-H4 使用不同颜色区分层级。

## Goals / Non-Goals

**Goals:**
- H1 使用主色调（强调色），最大字号
- H2 使用次要强调色，中等字号
- H3-H4 使用更浅的颜色和更大缩进
- 保持悬停和点击功能

**Non-Goals:**
- 不修改大纲面板的整体布局
- 不添加 H5-H6 的特殊处理

## Decisions

### 样式实现方案

使用 Tailwind CSS 工具类：

```tsx
const headingStyles = {
  h1: 'text-base font-bold text-accent',
  h2: 'text-sm font-semibold text-[var(--heading-h2)]',
  h3: 'text-xs font-medium text-[var(--heading-h3)]',
  h4: 'text-xs font-normal text-[var(--heading-h4)] pl-2',
}

<div className={`${headingStyles[heading.level]} ${headingStyles[heading.level + heading.level] || ''}`}>
```

### CSS 变量定义

在全局 CSS 中添加：

```css
[data-theme="dark"] {
  --heading-h1: var(--accent);
  --heading-h2: #8b5cf6;
  --heading-h3: var(--text-secondary);
  --heading-h4: var(--text-tertiary);
}
```

### 层级缩进

```tsx
const getIndent = (level: number) => {
  const baseIndent = 0
  const indentPerLevel = 16 // px
  return baseIndent + (level - 1) * indentPerLevel
}

<div style={{ paddingLeft: `${getIndent(heading.level)}px` }}>
```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 深色/浅色主题颜色不协调 | 为每个主题单独定义 heading 颜色变量 |
