## Context

### 当前状态

应用使用 `data-theme` attribute 挂载在 `<html>` 上，通过 CSS 变量（`--bg-primary`、`--editor-bg` 等）驱动整体 UI 主题。`useThemeStore` 负责切换主题，`themes.css` 定义各主题的 CSS 变量。

编辑区使用 CodeMirror 6（`@codemirror/view`），其主题通过 `EditorView.theme()` 和 `HighlightStyle` 在 `EditorState.create()` 时静态注入。当前实现存在两个独立缺陷：

**缺陷 1：`useEffect` 依赖数组不完整**

```tsx
// EditorPaneV2.tsx
const isDark = !['light', 'github'].includes(currentTheme)
// ...
useEffect(() => {
  // 创建 EditorState，注入 EditorView.theme() 和 buildHighlightStyle(isDark)
}, [isDark, zoomLevel])  // ← 问题所在
```

当主题从 `dark` 切换到 `monokai` 时，`isDark` 仍为 `true`，`useEffect` 不触发，编辑器不重建，视觉上无变化。

**缺陷 2：`themes.css` 缺少 editor 专属变量**

`EditorView.theme()` 中使用 `var(--editor-bg, var(--bg-primary))`，但 `themes.css` 只在 `dark` 主题下定义了 `--editor-bg` 等变量，其他主题（light、monokai、solarized、nord、dracula、github）均未定义，导致 fallback 到 `--bg-primary`，而 `--bg-primary` 在 light/github 主题下是白色，在深色主题下是各自的背景色——这部分实际上是正确的，但 `--editor-gutter-bg`、`--editor-cursor` 等细粒度变量缺失，导致 gutter 和光标颜色不准确。

**缺陷 3：`buildHighlightStyle` 使用硬编码颜色**

```tsx
function buildHighlightStyle(isDark: boolean) {
  return HighlightStyle.define([
    { tag: tags.strong, color: isDark ? '#cc6699' : '#e50000' },  // 硬编码
    // ...
  ])
}
```

这些颜色只对 dark/light 两个主题准确，对 monokai、nord 等主题颜色不匹配。

### 约束

- CodeMirror 6 的 `EditorState` 是不可变的，主题变更必须通过销毁并重建 `EditorView` 来实现（或使用 `Compartment` 动态切换，但成本更高）
- 现有架构已通过 `useEffect` 依赖数组控制重建时机，只需修正依赖项即可
- `themes/index.ts` 中已有完整的每主题颜色定义（`ThemeDefinition.editor` 和 `ThemeDefinition.syntax`），可直接复用

## Goals / Non-Goals

**Goals:**
- 切换任意主题时，编辑区背景色、gutter 色、光标色、行高亮色、选区色与当前主题完全一致
- 切换任意主题时，编辑区语法高亮颜色（标题、粗体、斜体、代码、链接等）与当前主题的 syntax 定义一致
- 修复对所有 7 个主题（dark、light、monokai、solarized、nord、dracula、github）均有效

**Non-Goals:**
- 不引入 CodeMirror `Compartment` 动态主题切换（成本高，当前重建方案已足够）
- 不修改预览区（`PreviewPaneV2`）的主题逻辑
- 不新增主题或修改主题颜色定义

## Decisions

### 决策 1：将 `useEffect` 依赖从 `isDark` 改为 `currentTheme`

**选择**：将 `[isDark, zoomLevel]` 改为 `[currentTheme, zoomLevel]`，同时将 `buildHighlightStyle` 的参数从 `isDark: boolean` 改为 `themeId: ThemeId`。

**理由**：`currentTheme` 是字符串，任意主题切换都会触发 `useEffect`，是最小改动、最直接的修复。

**备选方案**：使用 CodeMirror `Compartment` 实现热替换，无需重建整个编辑器。但这需要重构初始化逻辑，引入额外复杂度，且当前重建方案在性能上完全可接受（重建耗时 < 50ms）。

### 决策 2：`buildHighlightStyle` 从 `getThemeById` 读取颜色

**选择**：在 `buildHighlightStyle(themeId)` 中调用 `getThemeById(themeId)` 获取 `ThemeDefinition`，从 `theme.syntax` 字段读取各语法元素颜色。

**理由**：`themes/index.ts` 已有完整的每主题颜色定义，是单一数据源（Single Source of Truth）。避免在 `EditorPaneV2.tsx` 中再次硬编码颜色，减少维护负担。

**备选方案**：继续使用 `isDark` 二值判断，为每个主题单独写 if/else。代码冗余，不可维护。

### 决策 3：在 `themes.css` 中补全 editor 专属 CSS 变量

**选择**：为 light、monokai、solarized、nord、dracula、github 主题补充 `--editor-bg`、`--editor-fg`、`--editor-line-highlight`、`--editor-selection`、`--editor-gutter-bg`、`--editor-gutter-fg`、`--editor-cursor` 变量，值与 `themes/index.ts` 中对应主题的 `editor` 字段保持一致。

**理由**：CSS 变量作为 fallback 机制，即使 JS 侧已通过重建解决了主要问题，CSS 变量的完整性也能保证在 SSR、测试或 JS 失效场景下的正确渲染。同时消除 `--editor-bg` 缺失导致的 fallback 链不准确问题。

## Risks / Trade-offs

- **[Risk] 编辑器重建导致光标位置丢失** → 主题切换是用户主动操作，重建时内容通过 `content` prop 同步，光标位置重置到文档开头是可接受的行为（与 VS Code 行为一致）
- **[Risk] 重建期间短暂闪烁** → 现有 `themes.css` 中已有 `transition: background-color 200ms ease` 全局过渡，视觉上平滑
- **[Trade-off] `buildHighlightStyle` 每次重建都调用 `getThemeById`** → `getThemeById` 是纯函数，O(n) 数组查找（n=7），性能影响可忽略

## Migration Plan

1. 修改 `src/styles/themes.css`：为 6 个主题补充 editor 专属 CSS 变量
2. 修改 `src/components/editor-v2/EditorPaneV2.tsx`：
   - `buildHighlightStyle(isDark: boolean)` → `buildHighlightStyle(themeId: ThemeId)`
   - 函数内部从 `getThemeById(themeId).syntax` 读取颜色
   - `useEffect` 依赖数组 `[isDark, zoomLevel]` → `[currentTheme, zoomLevel]`
   - 删除 `isDark` 变量（或保留用于其他用途）
3. 验证：手动切换所有 7 个主题，确认编辑区背景色和语法高亮正确更新

**回滚**：git revert，无数据迁移，无风险。

## Open Questions

无。根因明确，修复方案直接。
