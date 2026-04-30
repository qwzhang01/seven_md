## Why

切换整体主题时，编辑区（CodeMirror）的背景色和语法高亮颜色没有跟随更新，导致编辑区与整体 UI 风格不一致（如截图所示：整体切换为深色主题后，编辑区仍显示浅色背景）。这是一个视觉一致性 bug，影响所有非 dark/light 主题（monokai、solarized、nord、dracula、github）以及在同类主题之间切换时的体验。

## What Changes

- **修复 `EditorPaneV2` 的主题感知逻辑**：将 `isDark` 二值判断替换为 `currentTheme` 字符串，使 `useEffect` 依赖数组能正确感知任意主题切换，触发编辑器重建
- **修复 `buildHighlightStyle` 函数**：接收完整的 `ThemeId` 而非 `isDark` 布尔值，从 `themes/index.ts` 的 `ThemeDefinition` 中读取各主题的精确语法高亮颜色，消除硬编码颜色值
- **补全 `themes.css` 中缺失的 `--editor-bg` 等 editor 专属 CSS 变量**：为 monokai、solarized、nord、dracula、github、light 主题补充 `--editor-bg`、`--editor-fg`、`--editor-gutter-bg`、`--editor-gutter-fg`、`--editor-cursor`、`--editor-line-highlight`、`--editor-selection` 变量，与 `themes/index.ts` 中的 `editor` 字段保持一致

## Capabilities

### New Capabilities
- `editor-theme-sync`: 编辑区（CodeMirror）在任意主题切换时，背景色、文字色、行高亮、选区色、gutter 色、光标色及语法高亮颜色均与当前主题完全同步

### Modified Capabilities
- `editor-core`: 编辑器主题感知逻辑从二值 `isDark` 升级为完整 `ThemeId`，`buildHighlightStyle` 从 `themes/index.ts` 读取精确颜色
- `theme-system`: `themes.css` 补全所有主题的 editor 专属 CSS 变量

## Impact

- **修改文件**：
  - `src/components/editor-v2/EditorPaneV2.tsx`：`buildHighlightStyle` 签名变更，`useEffect` 依赖数组从 `[isDark, zoomLevel]` 改为 `[currentTheme, zoomLevel]`
  - `src/styles/themes.css`：为 6 个主题补充 editor 专属 CSS 变量（约 +42 行）
- **不影响**：预览区（`PreviewPaneV2`）、主题 store、主题切换逻辑、其他 UI 组件
- **无 breaking change**：纯 bug 修复，对外 API 不变
