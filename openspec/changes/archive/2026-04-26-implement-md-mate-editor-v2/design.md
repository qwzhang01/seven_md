## Context

Seven Markdown 是一个基于 **Tauri v2 + React 19 + TypeScript + CodeMirror 6** 构建的 macOS 原生 Markdown 编辑器。当前版本功能较为基础，主要作为 Markdown 阅读器使用。

**当前技术栈**:
- 前端: React 19 + TypeScript + Vite 5 + Tailwind CSS 3 + CodeMirror 6
- 后端: Tauri v2 (Rust)
- Markdown 渲染: react-markdown + rehype-highlight + remark-gfm + remark-math + rehype-katex
- 图标: lucide-react
- 国际化: i18next + react-i18next
- 测试: Vitest + Playwright

**现有组件**: TitleBar, MenuBar, TabBar, Sidebar, FileTree, SearchPanel, StatusBar, CodeMirrorEditor, PreviewPane, Toolbar, Modal 等

本次变更的目标是将 MD Mate 升级为**工业级 AI 驱动的 Markdown 编辑器**，实现类似 VS Code 的专业编辑体验。交互设计参考 `docs/md1auumt_7d0ffc5e329f9e62178ae1a147077869ba9b3d10/interaction-spec.md`。

## Goals / Non-Goals

**Goals:**

1. 实现完整的 VS Code 风格编辑器布局（标题栏 + 菜单栏 + 工具栏 + 活动栏 + 侧边栏 + 编辑器 + 预览 + 状态栏）
2. 提供专业的 Markdown 编辑能力（语法高亮、自动补全、格式化工具、右键菜单）
3. 实现多主题系统（7 种内置主题，全局切换带过渡动画）
4. 构建命令面板（Command Palette）作为核心交互入口
5. 集成 AI 助手能力（对话 / 改写 / 翻译 / 解释）
6. 完善文件管理（资源管理器、搜索、大纲导航）
7. 实现通知系统和模态对话框
8. 支持响应式布局适配桌面端和移动端

**Non-Goals:**

1. 不实现云端同步功能（留待后续版本）
2. 不实现协作编辑功能（实时多人协作）
3. 不实现插件系统（本期不开放扩展能力）
4. 不重写 Tauri 后端（仅在必要时新增命令）
5. 不支持非 Markdown 文件类型的完整编辑

## Decisions

### Decision 1: 状态管理方案 - 使用 Zustand + Context 混合模式

**选择**: Zustand（全局状态）+ React Context（局部状态）混合架构

**理由**:
- Zustand 轻量（~1KB），API 简洁，适合管理跨组件共享状态
- 相比 Redux，样板代码少 80%，开发效率高
- 支持 devtools，便于调试复杂状态流转
- React Context 用于组件树内部的局部状态传递（如编辑器实例）

**备选方案**:
- Redux Toolkit: 过于重量级，对于编辑器应用来说过度设计
- Jotai: 原子化状态管理，但学习曲线较陡
- 纯 Context: 性能问题，容易导致不必要的重渲染

**状态域划分**:

| Store | 职责 |
|-------|------|
| `useEditorStore` | 编辑器状态（内容、光标、选区、撤销栈） |
| `useFileStore` | 文件管理（打开的文件、标签页、活动文件） |
| `useUISStore` | UI 状态（侧边栏、面板显隐、视图模式） |
| `useThemeStore` | 主题配置（当前主题、自定义变量） |
| `useCommandStore` | 命令面板（打开状态、搜索词、匹配结果） |
| `useAIStore` | AI 助手（对话历史、模式、加载状态） |
| `useNotificationStore` | 通知队列（通知列表、显示/隐藏逻辑） |
| `useSettingsStore` | 用户设置（字体大小、快捷键映射等） |

### Decision 2: 编辑器引擎 - 继续使用 CodeMirror 6 并增强

**选择**: CodeMirror 6 作为核心编辑器引擎

**理由**:
- 项目已集成 CodeMirror 6，生态成熟稳定
- 原生支持 Markdown 语法高亮（@codemirror/lang-markdown）
- 强大的扩展系统，可自定义行号、括号匹配、自动补全等
- 性能优秀，支持大文件编辑
- 与 react-markdown 预览形成良好的编辑/预览分离架构

**增强点**:
- 行号显示（@codemirror/gutter）
- 自动配对括号/引号（@codemirror/autocomplete）
- 右键上下文菜单（自定义 EditorView 插件）
- 列表自动续行（自定义 StateField）
- 搜索替换高亮（@codemirror/search）

**备选方案**:
- Monaco Editor: 功能强大但体积过大（~2MB），且为 VS Code 专用
- Slate.js: 更底层，需要自行实现大量编辑功能
- ProseMirror: 偏向富文本编辑，与 Markdown 源码编辑理念不符

### Decision 3: 组件架构 - Feature-Based 模块化

**选择**: 按 Feature 模块组织组件目录结构

**目录结构**:

```
src/
├── components/
│   ├── titlebar/           # 标题栏模块
│   │   ├── TitleBar.tsx
│   │   ├── TrafficLights.tsx
│   │   ├── TabBar.tsx
│   │   └── TabItem.tsx
│   ├── menubar/            # 菜单栏模块
│   │   ├── MenuBar.tsx
│   │   ├── MenuItem.tsx
│   │   └── MenuDivider.tsx
│   ├── toolbar/            # 工具栏模块
│   │   ├── Toolbar.tsx
│   │   ├── ToolbarGroup.tsx
│   │   └── ToolbarButton.tsx
│   ├── activitybar/        # 活动栏模块
│   │   ├── ActivityBar.tsx
│   │   └── ActivityItem.tsx
│   ├── sidebar/            # 侧边栏模块
│   │   ├── Sidebar.tsx
│   │   ├── ExplorerPanel.tsx
│   │   ├── SearchPanel.tsx
│   │   ├── OutlinePanel.tsx
│   │   └── SnippetsPanel.tsx
│   ├── editor/             # 编辑器模块
│   │   ├── EditorPane.tsx
│   │   ├── CodeMirrorEditor.tsx
│   │   ├── LineNumbers.tsx
│   │   ├── EditorContextMenu.tsx
│   │   └── Minimap.tsx     # 未来可选
│   ├── preview/            # 预览区模块
│   │   ├── PreviewPane.tsx
│   │   └── PreviewToolbar.tsx
│   ├── command-palette/    # 命令面板模块
│   │   ├── CommandPalette.tsx
│   │   ├── CommandInput.tsx
│   │   └── CommandList.tsx
│   ├── ai-assistant/       # AI 助手模块
│   │   ├── AIPanel.tsx
│   │   ├── ChatMode.tsx
│   │   ├── RewriteMode.tsx
│   │   ├── TranslateMode.tsx
│   │   └── ExplainMode.tsx
│   ├── statusbar/          # 状态栏模块
│   │   ├── StatusBar.tsx
│   │   └── StatusItem.tsx
│   ├── notification/       # 通知系统模块
│   │   ├── NotificationContainer.tsx
│   │   └── Notification.tsx
│   ├── find-replace/       # 查找替换模块
│   │   ├── FindReplaceBar.tsx
│   │   └── SearchOptions.tsx
│   ├── modal/              # 模态对话框模块
│   │   ├── Modal.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── AlertDialog.tsx
│   └── common/             # 通用组件
│       ├── Tooltip.tsx
│       ├── Icon.tsx
│       ├── Button.tsx
│       └── Divider.tsx
├── stores/                 # Zustand stores
│   ├── useEditorStore.ts
│   ├── useFileStore.ts
│   ├── useUIStore.ts
│   ├── useThemeStore.ts
│   ├── useCommandStore.ts
│   ├── useAIStore.ts
│   ├── useNotificationStore.ts
│   └── useSettingsStore.ts
├── hooks/                  # 自定义 Hooks
│   ├── useEditor.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useTheme.ts
│   ├── useFileSystem.ts
│   └── useAI.ts
├── commands/               # 命令注册表
│   ├── registry.ts
│   ├── fileCommands.ts
│   ├── editCommands.ts
│   ├── viewCommands.ts
│   ├── insertCommands.ts
│   ├── themeCommands.ts
│   └── aiCommands.ts
├── themes/                 # 主题定义
│   ├── index.ts
│   ├── dark.ts
│   ├── light.ts
│   ├── monokai.ts
│   ├── solarized.ts
│   ├── nord.ts
│   ├── dracula.ts
│   └── github.ts
└── types/                  # TypeScript 类型
    ├── editor.ts
    ├── file.ts
    ├── theme.ts
    ├── ai.ts
    └── command.ts
```

**理由**:
- 每个功能模块独立封装，职责清晰
- 便于团队协作，减少代码冲突
- 符合 React 最佳实践（Co-located Components）
- 利于 Tree Shaking 和按需加载

### Decision 4: 主题系统 - CSS Variables + TypeScript Theme Objects

**选择**: CSS 自定义属性（CSS Variables）+ TypeScript 主题对象双驱动

**实现方式**:

```typescript
// themes/dark.ts
export const darkTheme = {
  name: 'Dark',
  id: 'dark',
  isDefault: true,
  colors: {
    // 基础色
    background: {
      primary: '#1e1e1e',
      secondary: '#252526',
      tertiary: '#2d2d30',
      hover: '#2a2d2e',
      active: '#094771',
    },
    text: {
      primary: '#cccccc',
      secondary: '#858585',
      disabled: '#5a5a5a',
      accent: '#007acc',
      link: '#3794ff',
    },
    border: {
      default: '#3c3c3c',
      active: '#007acc',
    },
    // 语义色
    success: '#4ec9b0',
    warning: '#dcdcaa',
    error: '#f14c4c',
    info: '#3794ff',
  },
  editor: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    lineHighlight: '#2a2d2e',
    selection: '#264f78',
    gutterBackground: '#1e1e1e',
    gutterForeground: '#858585',
  },
};
```

```css
/* styles/themes.css */
:root[data-theme="dark"] {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --bg-tertiary: #2d2d30;
  --text-primary: #cccccc;
  --text-secondary: #858585;
  --accent-color: #007acc;
  --border-color: #3c3c3c;
  /* ... */
}
```

**切换机制**:
1. 修改 `<html data-theme="dark">` 属性
2. CSS 变量自动生效，所有组件响应变化
3. 同时触发过渡动画（`transition: all 200ms ease`）
4. 通过 Zustand persist 中间件持久化到 localStorage

**备选方案**:
- CSS Modules + 动态 import: 复杂度高，切换有闪烁
- Styled-Components theme prop: 运行时开销大
- Tailwind dark mode: 仅支持明暗两种，不够灵活

### Decision 5: 命令面板架构 - 注册表模式

**选择**: 命令注册表模式（Command Registry Pattern）

**实现**:

```typescript
// commands/registry.ts
interface Command {
  id: string;
  title: string;
  category: 'file' | 'edit' | 'view' | 'insert' | 'format' | 'theme' | 'ai' | 'help';
  icon?: string;
  shortcut?: string;
  when?: () => boolean;  // 条件可见
  execute: () => void | Promise<void>;
}

class CommandRegistry {
  private commands = new Map<string, Command>();
  
  register(command: Command): void { ... }
  execute(id: string): void { ... }
  query(search: string): Command[] { ... }  // 模糊搜索
}
```

**理由**:
- 解耦命令定义与 UI 渲染
- 支持动态注册（插件预留）
- 便于单元测试
- 支持条件显示（when 函数）
- 快捷键绑定自然统一

### Decision 6: AI 助手集成 - 抽象 Provider 接口

**选择**: 定义 AI Provider 抽象接口，默认实现对接 OpenAI 兼容 API

**接口设计**:

```typescript
interface AIProvider {
  name: string;
  chat(messages: Message[]): AsyncGenerator<AIStreamChunk>;
  rewrite(text: string, style: RewriteStyle): Promise<string>;
  translate(text: string, targetLang: string): Promise<string>;
  explain(text: string): Promise<string>;
}

// 默认实现：OpenAI Compatible API
class OpenAIProvider implements AIProvider {
  constructor(private apiKey: string, private baseURL: string, private model: string) {}
  // ...
}
```

**理由**:
- 用户可自建 AI 服务或接入第三方
- 支持未来扩展（Claude、Gemini、本地模型等）
- 接口清晰，易于测试 Mock

## Risks / Trade-offs

### Risk 1: 组件数量膨胀导致包体积增大
**风险**: 20+ 新组件 + 多主题 + AI SDK 可能显著增加应用体积
**缓解措施**:
- 使用 Tree Shaking 确保未使用的代码被移除
- 主题样式通过 CSS 变量运行时切换，不打包多份样式
- AI 相关代码懒加载（dynamic import）
- 目标：主包增量控制在 200KB 以内（gzip 后）

### Risk 2: CodeMirror 6 与 React 集成复杂度
**风险**: CodeMirror 6 的 state management 与 React 存在阻抗失配
**缓解措施**:
- 使用 @codemirror/react-view 或自定义 React wrapper
- 编辑器状态由 CodeMirror 内部管理，React 只做单向数据流同步
- 关键操作（保存、撤销）通过 EditorView.dispatch 触发
- 参考 CodeMirror 官方 React 示例最佳实践

### Risk 3: 主题切换性能（全量重渲染）
**风险**: 7 种主题、数十个 CSS 变量，切换时可能造成卡顿
**缓解措施**:
- 使用 CSS 变量而非 JS 直接操作 DOM 样式
- GPU 加速过渡动画（transform/opacity）
- 避免在 transition 期间触发布局重算
- 对大文档预览区做防抖处理

### Risk 4: AI 功能依赖外部服务可用性
**风险**: AI 助手功能依赖网络和 API 服务稳定性
**缓解措施**:
- 优雅降级：网络不可用时显示友好提示
- 本地缓存常用改写/翻译结果
- 设置中允许用户配置 API endpoint 和 key
- 超时处理和错误重试机制

### Trade-off: 功能丰富度 vs 开发周期
**取舍**: 本次实现聚焦核心编辑体验，部分高级功能延后
- **本期包含**: 全部 UI 交互、基础 AI 对话、7 种主题
- **延后至 V2**: 插件系统、协作编辑、云同步、Minimap、多窗口

## Migration Plan

### Phase 0: 基础设施搭建（预计 2-3 天）
1. 安装新依赖（zustand 等）
2. 创建目录结构骨架
3. 配置 Zustand stores
4. 实现 CSS 变量主题系统
5. 建立命令注册表框架

### Phase 1: 外壳布局（预计 3-4 天）
1. 重构标题栏（交通灯 + 标签页）
2. 实现菜单栏（7 大菜单）
3. 构建工具栏（分组按钮）
4. 创建活动栏 + 侧边栏容器
5. 实现状态栏增强版
6. 响应式布局适配

### Phase 2: 核心编辑能力（预计 4-5 天）
1. 增强 CodeMirror 编辑器（行号、语法高亮、自动配对）
2. 实现编辑器右键菜单
3. 增强预览区（实时渲染、独立滚动）
4. 实现查找替换栏
5. 实现分隔条拖拽调整

### Phase 3: 侧边栏面板（预计 3-4 天）
1. 资源管理器（文件树）
2. 搜索面板（全文搜索）
3. 大纲面板（标题导航）
4. 片段面板（模板插入）

### Phase 4: 高级交互（预计 3-4 天）
1. 命令面板（模糊搜索、快捷执行）
2. AI 助手面板（四模式）
3. 通知系统
4. 模态对话框
5. 键盘快捷键体系完善

### Phase 5: 打磨优化（预计 2-3 天）
1. 交互动画调优
2. 性能优化（虚拟滚动、防抖节流）
3. 可访问性（ARIA 标签、键盘导航）
4. E2E 测试补充
5. 文档更新

**回滚策略**:
- 每个 Phase 通过 Git 分支隔离，可独立回滚
- 保持 `main` 分支始终可构建运行
- 新功能通过 feature flag 控制，可随时关闭

## Open Questions

1. **AI Provider 选择**: 默认对接哪家 AI 服务？（OpenAI / Claude / 国内服务？）→ 建议 OpenAI 兼容接口，用户自填 API Key
2. **文件存储策略**: 是否需要支持工作区（Workspace）概念？ → 建议本期仅支持单文件夹浏览，暂不引入工作区
3. **国际化范围**: 首期是否只支持中英文？ → 建议先完成中文，英文后续迭代
4. **性能基线**: 大文件（>1MB Markdown）编辑流畅度目标？ → 建议目标：100ms 内完成渲染，输入延迟 <50ms
