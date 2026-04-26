## Context

编辑器功能存在两处缺陷：

1. **查找栏匹配计数**：交互说明要求显示 "无结果" 或 "N of M"，但 FindReplaceBar 组件中的 `<span>` 占位符为空。
2. **自动配对功能**：`closeBrackets` 扩展已启用，但配置不完整，Markdown 常用符号（如反引号）未包含。

当前状态：
- `FindReplaceBar.tsx` 有占位 `<span>` 但无匹配计数逻辑
- `EditorPaneV2.tsx` 已导入 `closeBrackets` 但配置默认

## Goals / Non-Goals

**Goals:**
- 查找栏实时显示匹配计数（跟随 search 扩展状态）
- 完整的自动配对符号支持（圆括号、方括号、花括号、引号、反引号）

**Non-Goals:**
- 不修改查找/替换的核心逻辑
- 不引入新的外部依赖
- 不改变现有 UI 布局和样式

## Decisions

### D1: 查找栏匹配计数

**方案**：监听 CodeMirror search 扩展的状态变化

- **选择理由**：CodeMirror search 扩展提供 `setSearchQuery` 和结果状态，直接监听编辑器更新事件获取匹配计数最可靠
- **实现方式**：
  1. 引入 `matchCount` 和 `currentMatch` 状态
  2. 在 `EditorView.updateListener` 中解析 search 扩展的匹配结果
  3. 将计数信息传递给 FindReplaceBar 显示

### D4: 自动配对增强

**方案**：扩展 `closeBrackets` 配置

- **选择理由**：`closeBrackets` 是 CodeMirror 官方扩展，开箱即用且性能良好
- **实现方式**：
  ```typescript
  closeBrackets({
    brackets: ['(', '[', '{', '"', "'", '`']
  })
  ```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| search 扩展状态获取方式变更 | 使用稳定的公共 API，避免直接访问私有属性 |
| 配对符号与 Markdown 语法冲突 | 仅在纯文本/代码块内启用，不干扰 Markdown 预览渲染 |
