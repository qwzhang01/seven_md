## 微信公众号导出功能移植方案

**来源**：[doocs/md](https://github.com/doocs/md)（`.ext/md` 临时目录）
**目标**：将微信公众号 HTML 导出能力内化到 seven_md 项目，`.ext` 目录删除后仍可独立运行

---

## 可行性结论

**完全可行**。doocs/md 的渲染引擎（`@md/core`、`@md/shared`）是**纯 TypeScript + 浏览器 API**，没有任何 Vue/Pinia 依赖，可以直接移植到 React 项目中。

---

## 核心原理

微信公众号不支持 `<style>` 标签，所有样式必须内联到元素的 `style` 属性中。doocs/md 的导出流程分三步：

```
Markdown
  → marked 渲染 → HTML（带 class）
  → 主题 CSS 生成（base + theme + 自定义）
  → juice 内联 CSS → 最终 HTML（所有样式内联）
  → 写入剪贴板（text/html 格式）
```

---

## 需要新增的 npm 依赖

```json
"marked": "^15.x",
"front-matter": "^4.0.2",
"juice": "^11.1.1"
```

> `highlight.js`、`mermaid`、`katex` 项目中已有，无需重复安装。

---

## 文件移植清单

从 `.ext/md` 中搬运 **11 个文件**，全部是纯逻辑，无框架依赖。移植时**只改 import 路径，逻辑代码一行不动**。

### 移植文件（改 import 路径即可）

| 来源（`.ext/md/`） | 目标（`src/wechat/`） | 说明 |
|---|---|---|
| `packages/shared/src/types/renderer-types.ts` | `types/renderer-types.ts` | IOpts、RendererAPI 类型定义 |
| `packages/shared/src/configs/theme-css/base.css` | `theme-css/base.css` | 基础样式（所有主题共用） |
| `packages/shared/src/configs/theme-css/default.css` | `theme-css/default.css` | 经典主题 |
| `packages/shared/src/configs/theme-css/grace.css` | `theme-css/grace.css` | 优雅主题 |
| `packages/shared/src/configs/theme-css/simple.css` | `theme-css/simple.css` | 简洁主题 |
| `packages/core/src/renderer/renderer-impl.ts` | `renderer/renderer-impl.ts` | marked 自定义渲染器 |
| `packages/core/src/theme/cssProcessor.ts` | `theme/cssProcessor.ts` | CSS var() 变量展开 |
| `packages/core/src/theme/cssVariables.ts` | `theme/cssVariables.ts` | CSS 变量字符串生成 |
| `packages/core/src/theme/cssScopeWrapper.ts` | `theme/cssScopeWrapper.ts` | CSS 作用域包装（加 #wechat-preview 前缀） |
| `packages/core/src/theme/selectorMapping.ts` | `theme/selectorMapping.ts` | HTML 标签 → CSS 选择器映射表 |
| `packages/core/src/utils/markdownHelpers.ts` | `utils/markdownHelpers.ts` | renderMarkdown 函数 |

### 新增文件（自行编写）

| 文件 | 说明 |
|---|---|
| `theme-css/index.ts` | 用 `?raw` 导入 CSS 文件，替代原来的 `@md/shared/configs` |
| `theme/themeApplicator.ts` | 简化版：去掉 DOM 注入，改为纯函数返回 CSS 字符串 |
| `services/wechatExport.ts` | 核心导出服务（`copyToWechat` 函数） |
| `stores/useWechatStore.ts` | Zustand store，管理主题/颜色/字体选择状态 |
| `components/WechatPanel.tsx` | 面板 UI（主题选择 + 实时预览 + 复制按钮） |
| `index.ts` | 统一导出 |

---

## 目标目录结构

```
src/
└── wechat/                          # 微信公众号导出模块（全新）
    ├── index.ts                     # 统一导出
    ├── types/
    │   └── renderer-types.ts        # 移植：IOpts、RendererAPI 类型
    ├── theme-css/                   # 移植：主题 CSS 文件
    │   ├── base.css
    │   ├── default.css
    │   ├── grace.css
    │   ├── simple.css
    │   └── index.ts                 # 新增：?raw 导入 + themeMap 导出
    ├── renderer/
    │   └── renderer-impl.ts         # 移植：marked 渲染器
    ├── theme/
    │   ├── cssProcessor.ts          # 移植：CSS var() 展开
    │   ├── cssVariables.ts          # 移植：CSS 变量生成
    │   ├── cssScopeWrapper.ts       # 移植：CSS 作用域包装
    │   ├── selectorMapping.ts       # 移植：选择器映射表
    │   └── themeApplicator.ts       # 新增：纯函数版主题 CSS 构建
    ├── utils/
    │   └── markdownHelpers.ts       # 移植：renderMarkdown 函数
    ├── services/
    │   └── wechatExport.ts          # 新增：核心导出服务
    ├── stores/
    │   └── useWechatStore.ts        # 新增：Zustand store
    └── components/
        └── WechatPanel.tsx          # 新增：面板 UI
```

---

## 关键设计决策

### 1. `themeApplicator.ts` 改为纯函数

原版 `applyTheme()` 会把 CSS 注入到 `document.head` 的 `<style id="md-theme">` 标签（Vue 响应式驱动），然后 `processClipboardContent` 再从 DOM 里读回来。

在 seven_md 中改为**纯函数**，直接返回 CSS 字符串，不操作 DOM，更符合 React 函数式风格：

```typescript
// src/wechat/theme/themeApplicator.ts
export function buildThemeCSS(config: ThemeConfig): string {
  const variablesCSS = generateCSSVariables(config.variables)
  const themeCSS = baseCSSContent + '\n\n' + (themeMap[config.themeName] ?? themeMap.default)
  const scopedCSS = wrapCSSWithScope(themeCSS, '#wechat-preview')
  const headingCSS = generateHeadingStyles(config.variables)
  const customCSS = config.customCSS
    ? wrapCSSWithScope(config.customCSS, '#wechat-preview')
    : ''
  const merged = [variablesCSS, scopedCSS, headingCSS, customCSS].filter(Boolean).join('\n\n')
  return processCSS(merged)  // 展开所有 var()
}
```

### 2. `theme-css/index.ts` 替代 `@md/shared/configs`

原来通过 monorepo 包导入 CSS 内容，移植后改用 Vite 的 `?raw` 导入：

```typescript
// src/wechat/theme-css/index.ts
import baseCSSContent from './base.css?raw'
import defaultCSS from './default.css?raw'
import graceCSS from './grace.css?raw'
import simpleCSS from './simple.css?raw'

export { baseCSSContent }

export const themeMap: Record<string, string> = {
  default: defaultCSS,
  grace: graceCSS,
  simple: simpleCSS,
}

export const themeOptions = [
  { label: '经典', value: 'default' },
  { label: '优雅', value: 'grace' },
  { label: '简洁', value: 'simple' },
]
```

### 3. `wechatExport.ts` 核心导出逻辑

```typescript
// src/wechat/services/wechatExport.ts
export async function copyToWechat(
  markdownContent: string,
  config: WechatExportConfig
): Promise<void> {
  // 1. 渲染 Markdown → HTML（带 class）
  const renderer = initRenderer({ opts: config.rendererOpts, env: {} })
  const { html } = renderMarkdown(markdownContent, renderer)

  // 2. 生成主题 CSS（纯字符串，不操作 DOM）
  const themeCSS = buildThemeCSS(config)

  // 3. juice 内联 CSS
  const htmlWithStyle = `<style>${themeCSS}</style><div id="wechat-preview">${html}</div>`
  const inlined = juice(htmlWithStyle, { resolveCSSVariables: false })

  // 4. 清理 CSS 变量残留，替换为实际颜色值
  const cleaned = inlined
    .replace(/var\(--md-primary-color\)/g, config.primaryColor)
    .replace(/--md-primary-color:[^;]+;/g, '')

  // 5. 写入剪贴板（text/html 格式，微信编辑器可直接粘贴）
  await navigator.clipboard.write([
    new ClipboardItem({
      'text/html': new Blob([cleaned], { type: 'text/html' }),
    }),
  ])
}
```

### 4. `useWechatStore.ts` 状态管理

```typescript
// src/wechat/stores/useWechatStore.ts
interface WechatState {
  isOpen: boolean
  themeName: string
  primaryColor: string
  fontFamily: string
  fontSize: string
  customCSS: string
  // actions
  setTheme: (name: string) => void
  setPrimaryColor: (color: string) => void
  open: () => void
  close: () => void
}
```

---

## 与现有项目的集成点

只需改动 **2 个现有文件**，侵入性极低：

### 1. `src/components/toolbar-v2/Toolbar.tsx`

在工具栏添加微信导出按钮（微信图标），点击后打开 `WechatPanel`：

```tsx
import { useWechatStore } from '@/wechat'

// 在工具栏右侧添加
<Button
  variant="ghost"
  size="sm"
  onClick={() => useWechatStore.getState().open()}
  title="导出到微信公众号"
>
  <WechatIcon className="h-4 w-4" />
</Button>
```

### 2. `src/AppV2.tsx`

挂载 `WechatPanel` 组件（侧边抽屉形式）：

```tsx
import { WechatPanel } from '@/wechat'

// 在 return 的 JSX 末尾添加
<WechatPanel />
```

---

## import 路径改动示例

移植的 11 个文件中，只需将 monorepo 内部路径改为相对路径：

```typescript
// 原来（doocs/md monorepo 路径）
import { baseCSSContent, themeMap } from '@md/shared/configs'
import type { IOpts } from '@md/shared/types'
import { renderMarkdown } from '@md/core/utils'

// 改为（seven_md 相对路径）
import { baseCSSContent, themeMap } from '../theme-css'
import type { IOpts } from '../types/renderer-types'
import { renderMarkdown } from '../utils/markdownHelpers'
```

---

## 实施步骤

### Step 1：安装依赖
```bash
pnpm add marked front-matter juice
pnpm add -D @types/front-matter @types/juice
```

### Step 2：复制 CSS 文件
从 `.ext/md/packages/shared/src/configs/theme-css/` 复制 `base.css`、`default.css`、`grace.css`、`simple.css` 到 `src/wechat/theme-css/`

### Step 3：移植纯逻辑文件（改 import 路径）
按移植清单逐一复制，修改 import 路径

### Step 4：编写新增文件
按顺序编写：`theme-css/index.ts` → `theme/themeApplicator.ts` → `services/wechatExport.ts` → `stores/useWechatStore.ts` → `components/WechatPanel.tsx` → `index.ts`

### Step 5：集成到现有项目
修改 `Toolbar.tsx` 和 `AppV2.tsx`

### Step 6：验证
- [ ] 编译无报错
- [ ] 基础 Markdown 能正确渲染为微信格式 HTML
- [ ] 复制到微信公众号编辑器后样式正常
- [ ] 主题切换生效
- [ ] 自定义颜色生效

---

## 工作量评估

| 维度 | 评估 |
|---|---|
| 移植文件（改路径） | 11 个文件，约 2-3 小时 |
| 新增文件（自行编写） | 6 个文件，约 400 行，约 3-4 小时 |
| 集成现有项目 | 2 个文件，约 30 分钟 |
| 联调验证 | 约 1-2 小时 |
| **合计** | **约 1 天** |

---

## 潜在风险

| 风险 | 说明 | 应对 |
|---|---|---|
| CSS 变量残留 | juice 不能完全展开 CSS 变量 | 导出后做字符串替换兜底 |
| Mermaid/SVG | 微信不支持 SVG 内联 | 先跳过，后续单独处理 |
| 微信图片要求 | 微信要求图片必须上传到微信服务器 | 提示用户手动处理图片 |
| marked 版本差异 | doocs/md 用 marked v15，需确认 API 兼容性 | 锁定版本 `^15.x` |
