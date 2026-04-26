## Why

根据交互规范，大纲面板中的 H1-H4 标题应用不同颜色标识，以便用户快速识别文档结构层级。当前实现虽然解析了标题，但没有按级别区分颜色，影响用户体验和文档导航效率。

## What Changes

- 为 `OutlinePanel.tsx` 中的标题项添加级别对应的颜色样式
- H1: 主色调（强调色），最大字号
- H2: 次要强调色，中等字号
- H3: 普通文字色 + 左边距缩进
- H4 及以下: 更浅的文字色 + 更大缩进
- 使用 CSS 变量或 Tailwind 工具类实现颜色区分
- 保持悬停高亮和点击跳转功能

## Capabilities

### Modified Capabilities

- `outline-panel`: 为标题列表添加级别颜色区分

## Impact

- 修改文件：`src/components/sidebar-v2/OutlinePanel.tsx`
- 无需新增能力，纯样式增强
