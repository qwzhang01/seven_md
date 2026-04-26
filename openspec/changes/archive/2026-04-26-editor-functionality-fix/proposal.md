## Why

编辑器功能存在两个缺陷需要修复：

1. **查找栏匹配计数缺失**：交互说明明确要求显示 "无结果" 或 "N of M" 匹配计数，但当前实现中的 `<span>` 占位符为空，用户无法得知查找结果状态。
2. **自动配对功能不完整**：CodeMirror 的 `closeBrackets` 扩展默认只处理部分闭合场景，Markdown 编辑场景需要的括号/引号自动配对（如输入 `(` 自动插入 `()` 并将光标置于中间）未完整实现。

这两个问题影响核心编辑体验，需要按规范补全。

## What Changes

### D1 - 查找栏匹配计数显示
- **修改文件**：`src/components/editor-v2/FindReplaceBar.tsx`
- **添加状态**：引入 `matchCount` 状态存储当前匹配数量
- **监听匹配事件**：监听 CodeMirror search 扩展的匹配结果更新
- **显示逻辑**：
  - 无匹配时显示 "无结果"（灰色文字）
  - 有匹配时显示 "N of M"（如 "3 of 12"）
  - 高亮当前匹配项

### D4 - 自动配对括号/引号增强
- **修改文件**：`src/components/editor-v2/EditorPaneV2.tsx`
- **扩展配置**：增强 `closeBrackets` 配置，支持 Markdown 常用配对符号
- **配对符号**：
  - 圆括号：`(` → `(|)`
  - 方括号：`[` → `[|]`
  - 花括号：`{` → `{|}`
  - 双引号：`"` → `"|"`
  - 单引号：`'` → `'|'`
  - 反引号：`` ` `` → `` `|` ``（代码场景）
- **跳过已存在闭合**：当光标前已有闭合符号时，跳过插入

## Capabilities

### New Capabilities
- `find-match-count`: 查找栏实时显示匹配计数能力（跟随 search 扩展状态）

### Modified Capabilities
- `editor-core`（自动配对）：扩展现有 `editor-core` spec 中的自动配对需求，覆盖更完整的符号类型

## Impact

### 受影响代码
- `src/components/editor-v2/FindReplaceBar.tsx`：添加 matchCount 状态和显示逻辑
- `src/components/editor-v2/EditorPaneV2.tsx`：增强 closeBrackets 配置
- `src/stores/useUIStore.ts`：确保 findReplaceMode 和 findReplaceOpen 状态正确联动

### 测试影响
- E2E 测试：添加查找栏匹配计数显示验证
- E2E 测试：添加自动配对括号/引号功能验证
