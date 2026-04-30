## 1. 补全 themes.css 中缺失的 editor 专属 CSS 变量

- [x] 1.1 在 `src/styles/themes.css` 的 `[data-theme="light"]` 块中添加 `--editor-bg`、`--editor-fg`、`--editor-line-highlight`、`--editor-selection`、`--editor-gutter-bg`、`--editor-gutter-fg`、`--editor-cursor` 变量（值参照 `themes/index.ts` 中 `lightTheme.editor`）
- [x] 1.2 在 `src/styles/themes.css` 的 `[data-theme="monokai"]` 块中添加上述 7 个 editor 专属变量（值参照 `monokaiTheme.editor`）
- [x] 1.3 在 `src/styles/themes.css` 的 `[data-theme="solarized"]` 块中添加上述 7 个 editor 专属变量（值参照 `solarizedTheme.editor`）
- [x] 1.4 在 `src/styles/themes.css` 的 `[data-theme="nord"]` 块中添加上述 7 个 editor 专属变量（值参照 `nordTheme.editor`）
- [x] 1.5 在 `src/styles/themes.css` 的 `[data-theme="dracula"]` 块中添加上述 7 个 editor 专属变量（值参照 `draculaTheme.editor`）
- [x] 1.6 在 `src/styles/themes.css` 的 `[data-theme="github"]` 块中添加上述 7 个 editor 专属变量（值参照 `githubTheme.editor`）

## 2. 修复 EditorPaneV2 的主题感知逻辑

- [x] 2.1 在 `src/components/editor-v2/EditorPaneV2.tsx` 中，修改 `buildHighlightStyle` 函数签名：`buildHighlightStyle(isDark: boolean)` → `buildHighlightStyle(themeId: ThemeId)`
- [x] 2.2 在 `buildHighlightStyle` 函数内部，调用 `getThemeById(themeId)` 获取 `ThemeDefinition`，将所有硬编码颜色替换为 `theme.syntax.*` 字段引用
- [x] 2.3 在文件顶部添加 `import { getThemeById } from '../../themes'` 和 `import type { ThemeId } from '../../stores/useThemeStore'` 的导入（如尚未存在）
- [x] 2.4 将初始化编辑器的 `useEffect` 依赖数组从 `[isDark, zoomLevel]` 改为 `[currentTheme, zoomLevel]`
- [x] 2.5 将 `useEffect` 内部调用 `buildHighlightStyle(isDark)` 改为 `buildHighlightStyle(currentTheme)`
- [x] 2.6 确认 `isDark` 变量是否还有其他用途；若无，删除该变量声明

## 3. 验证

- [ ] 3.1 手动测试：依次切换所有 7 个主题，确认编辑区背景色与整体 UI 一致
- [ ] 3.2 手动测试：在每个主题下检查语法高亮颜色（标题、粗体、代码、链接）与主题定义匹配
- [ ] 3.3 手动测试：确认主题切换后编辑器内容保持不变（仅样式更新）
- [x] 3.4 运行现有单元测试确保无回归：`npm run test`
