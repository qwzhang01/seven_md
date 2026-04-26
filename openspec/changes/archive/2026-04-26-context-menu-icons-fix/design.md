## Context

当前 `EditorContextMenu.tsx` 使用 Emoji 作为菜单项图标，不符合 Seven Markdown 的视觉规范。原型要求使用 RemixIcon 风格的图标，项目中已使用 `lucide-react` 作为图标库，因此将 Emoji 替换为 lucide-react 组件可保持 UI 一致性。

## Goals / Non-Goals

**Goals:**
- 将上下文菜单中的所有 Emoji 图标替换为 lucide-react 图标组件
- 保持图标大小、颜色与现有 lucide 图标使用方式一致
- 修正"格式化文档"图标以符合交互说明

**Non-Goals:**
- 不修改菜单结构、排序或功能逻辑
- 不添加新的菜单项
- 不修改子菜单的图标样式（子菜单项当前无图标）

## Decisions

### 图标选择

| Emoji | lucide-react | 尺寸 | 用途 |
|-------|--------------|------|------|
| ✂️ | `Scissors` | 14px | 剪切 |
| 📋 | `Clipboard` | 14px | 复制 |
| 📄 | `FileText` | 14px | 粘贴 |
| ➕ | `Plus` | 14px | 插入 |
| 🔤 | `Type` | 14px | 全选 |
| 🔍 | `Search` | 14px | 查找 |
| 📝 | `Sparkles` | 14px | 格式化文档 |
| 🤖 | `Bot` | 14px | AI 改写 |

### 实现方式

1. 从 `lucide-react` 导入所需的图标组件
2. 在 MenuItem 接口中添加可选的 `iconComponent` 字段（React 组件类型）
3. 在渲染时使用 `<Component size={14} />` 方式渲染图标
4. 保持现有 `icon` 字段用于快捷键显示文本

### 备选方案

**方案 A（采用）**: 替换为 lucide-react 组件
- 优点：与项目现有图标方案一致，减少依赖
- 缺点：需要更新 MenuItem 类型定义

**方案 B**: 保留 Emoji，添加 CSS 样式使其更美观
- 缺点：不解决规范不一致问题，与其他组件风格不统一

## Risks / Trade-offs

- **兼容性风险**: lucide-react 可能在不同版本间有图标名称变更
  - 缓解：使用稳定的核心图标，避免实验性图标
- **图标大小不一致**: 需要确保所有图标视觉大小一致
  - 缓解：统一使用 `size={14}` 并依赖 lucide 的默认 stroke width
