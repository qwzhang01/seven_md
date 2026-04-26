## Why

当前编辑器上下文菜单使用 Emoji 作为图标，不符合 Seven Markdown 的设计规范。原型要求使用 RemixIcon/lucide 风格图标，且交互说明中格式化文档应使用画笔图标 🖌️ 表示。此修复可提升 UI 一致性与专业感。

## What Changes

- 将上下文菜单中的 Emoji 图标替换为 lucide-react 图标组件
- 统一使用 `lucide-react` 作为图标库（项目已有依赖）
- 修正"格式化文档"图标：从 📝 改为对应的图标（如 Sparkles 或 Wand2）
- 确保所有菜单项图标风格一致

### 具体图标映射

| 当前 Emoji | 替换为 lucide-react | 用途 |
|------------|---------------------|------|
| ✂️ | Scissors | 剪切 |
| 📋 | Clipboard | 复制 |
| 📄 | FileText | 粘贴 |
| ➕ | Plus | 插入 |
| 🔤 | Type | 全选 |
| 🔍 | Search | 查找 |
| 📝 | Sparkles/Wand2 | 格式化文档 |
| 🤖 | Bot | AI 改写 |

## Capabilities

### Modified Capabilities

- `context-menu-format`: 更新图标规范，从 Emoji 改为 lucide-react 组件，并更新"格式化文档"图标的 emoji 为合适的图标组件

## Impact

- **受影响的文件**: `src/components/editor-v2/EditorContextMenu.tsx`
- **依赖变更**: 无新增依赖（项目已有 lucide-react）
- **API 变更**: MenuItem 接口的 `icon` 字段类型需调整为支持 React 组件
