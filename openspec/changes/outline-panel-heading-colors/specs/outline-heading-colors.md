# Outline Panel Heading Colors

## Overview

大纲面板中 H1-H4 使用不同颜色区分层级。

## Styles

| 级别 | 颜色 | 字号 | 缩进 |
|------|------|------|------|
| H1 | 强调色 (accent) | 最大 | 0 |
| H2 | H2 专用色 | 中等 | 0 |
| H3 | H3 专用色 | 较小 | 16px |
| H4 | H4 专用色 | 最小 | 32px |

## CSS Variables

```css
--heading-h1: var(--accent);
--heading-h2: #8b5cf6;
--heading-h3: var(--text-secondary);
--heading-h4: var(--text-tertiary);
```
