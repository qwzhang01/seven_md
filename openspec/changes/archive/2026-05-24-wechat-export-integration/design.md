## Context

seven_md 是一个基于 React 19 + Zustand + react-markdown 的桌面 Markdown 编辑器（Electron + Tauri 双端）。当前导出能力仅支持标准 HTML 和 PDF。

doocs/md 是一个成熟的微信公众号 Markdown 编辑器（Vue 3），其核心渲染引擎（`@md/core`、`@md/shared`）是**纯 TypeScript + 浏览器 API**，无任何 Vue 依赖，可直接移植到 React 项目。

本次设计目标是将 doocs/md 的渲染引擎内化到 seven_md，以 `src/wechat/` 独立模块的形式存在，不依赖 `.ext/` 临时目录。

## Goals / Non-Goals

**Goals:**
- 将 Markdown 渲染为微信公众号可用的内联样式 HTML，并写入系统剪贴板
- 支持多套主题（default / grace / simple）和主色调自定义
- 提供实时预览面板，所见即所得
- 对现有代码侵入性最低（只改 2 个文件）
- 移植后 `.ext/` 目录可安全删除

**Non-Goals:**
- 不处理微信图片上传（图片需用户手动处理）
- 不支持 Mermaid 图表导出（微信不支持 SVG，后续单独处理）
- 不实现微信公众号 API 直接发布
- 不修改现有 HTML/PDF 导出逻辑

## Decisions

### 决策 1：以独立模块 `src/wechat/` 组织代码，而非分散到现有目录

**选择**：新建 `src/wechat/` 作为完全独立的功能模块，内含 types / theme-css / renderer / theme / utils / services / stores / components 子目录。

**理由**：
- 移植代码与原有代码边界清晰，便于后续维护和升级
- 模块内部依赖关系自洽，不污染现有 `src/services`、`src/stores` 等目录
- 若未来需要移除该功能，只需删除 `src/wechat/` 目录和 2 处集成点

**备选方案**：将文件分散到现有 `src/services/`、`src/stores/`、`src/components/` 中 → 拒绝，因为会与现有代码混杂，难以追踪移植来源。

---

### 决策 2：`themeApplicator` 改为纯函数，不操作 DOM

**选择**：`buildThemeCSS(config)` 直接返回 CSS 字符串，不向 `document.head` 注入 `<style>` 标签。

**理由**：
- 原版 doocs/md 用 Vue 响应式驱动 DOM 注入，React 中无此机制
- 纯函数更易测试，无副作用
- 预览组件可直接用 `<style>` 标签或 `dangerouslySetInnerHTML` 消费 CSS 字符串

**备选方案**：保留 DOM 注入方式，用 `useEffect` 驱动 → 拒绝，因为会引入不必要的副作用，且与 React 渲染周期耦合。

---

### 决策 3：用 Vite `?raw` 导入替代 monorepo `@md/shared/configs`

**选择**：在 `src/wechat/theme-css/index.ts` 中用 `import baseCSSContent from './base.css?raw'` 导入 CSS 文件内容为字符串。

**理由**：
- 彻底消除对 `.ext/` monorepo 包的依赖
- Vite 原生支持 `?raw`，无需额外配置
- CSS 内容在构建时静态内联，无运行时 fetch 开销

**备选方案**：将 CSS 内容硬编码为 TypeScript 字符串常量 → 拒绝，维护成本高，CSS 文件无法独立编辑。

---

### 决策 4：juice 内联 CSS 后做字符串替换兜底 CSS 变量

**选择**：juice 处理后，对残留的 `var(--md-primary-color)` 做字符串替换，用实际颜色值填充。

**理由**：
- juice 的 `resolveCSSVariables` 选项对跨规则的 CSS 变量支持不完整
- 字符串替换简单可靠，覆盖 juice 的盲区
- 微信编辑器不支持 CSS 变量，必须确保所有变量都被展开

---

### 决策 5：剪贴板使用 `ClipboardItem` 写入 `text/html` 类型

**选择**：使用 `navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })])` 写入富文本。

**理由**：
- 微信公众号编辑器识别 `text/html` 格式，可保留样式粘贴
- 若只写 `text/plain`，粘贴后样式全部丢失
- 现代浏览器（Chrome 86+）和 Electron/Tauri WebView 均支持

**备选方案**：`execCommand('copy')` → 已废弃，不推荐。

## Risks / Trade-offs

| 风险 | 说明 | 缓解措施 |
|---|---|---|
| CSS 变量残留 | juice 无法展开所有 `var()` | 导出后做字符串替换兜底 |
| marked 版本 API 差异 | doocs/md 使用 marked v15，API 与旧版不同 | 锁定 `marked ^15.x`，移植时验证 renderer API |
| 剪贴板权限 | `navigator.clipboard.write` 需要用户授权或 HTTPS | Electron/Tauri 环境默认有权限；Web 端需 HTTPS |
| Mermaid/SVG | 微信不支持 SVG 内联，含图表的文档导出会有问题 | 本期跳过，后续单独处理；文档中注明限制 |
| 微信图片限制 | 微信要求图片必须上传到微信服务器才能显示 | 在 UI 中提示用户手动处理图片 |

## Migration Plan

本次变更为**纯新增**，无需数据迁移或回滚策略：

1. 安装新依赖（`marked`、`front-matter`、`juice`）
2. 创建 `src/wechat/` 模块（不影响现有代码）
3. 修改 `Toolbar.tsx` 和 `AppV2.tsx`（各增加约 5-10 行）
4. 验证编译通过、功能正常
5. 删除 `.ext/md/` 临时目录

**回滚**：若需回滚，删除 `src/wechat/` 目录，还原 `Toolbar.tsx` 和 `AppV2.tsx` 的修改即可，无任何数据影响。

## Open Questions

- [ ] 是否需要支持自定义 CSS 输入框（高级用户）？当前方案预留了 `customCSS` 字段，UI 上可选做
- [ ] 主题列表是否需要支持用户自定义主题导入？本期不做，后续可扩展 `themeMap`
- [ ] `WechatPanel` 以侧边抽屉（Sheet）还是模态框（Dialog）形式呈现？建议用 Sheet，与编辑器并排预览体验更好
