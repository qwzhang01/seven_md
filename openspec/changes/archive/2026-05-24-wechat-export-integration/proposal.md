## Why

seven_md 目前只能导出标准 HTML/PDF，无法直接输出微信公众号所需的**内联样式 HTML**。微信公众号编辑器不支持 `<style>` 标签，所有样式必须内联到元素的 `style` 属性中，导致用户需要借助第三方工具（如 doocs/md）中转，体验割裂。将该能力内化到 seven_md，可以让用户在编辑器内一键复制到微信公众号，无需离开应用。

## What Changes

- **新增** `src/wechat/` 模块：微信公众号导出的完整独立模块
- **新增** 主题 CSS 文件（base / default / grace / simple）及 `?raw` 导入层
- **新增** `copyToWechat()` 导出服务：Markdown → marked 渲染 → juice 内联 CSS → 写入剪贴板（`text/html`）
- **新增** `useWechatStore` Zustand store：管理主题、主色调、字体、自定义 CSS 状态
- **新增** `WechatPanel` 侧边抽屉组件：主题选择 + 实时预览 + 一键复制
- **修改** `Toolbar.tsx`：添加微信导出按钮（微信图标）
- **修改** `AppV2.tsx`：挂载 `WechatPanel` 组件
- **新增** npm 依赖：`marked`、`front-matter`、`juice`

## Capabilities

### New Capabilities

- `wechat-export`: 将当前编辑器中的 Markdown 内容渲染为微信公众号可用的内联样式 HTML，并写入系统剪贴板，用户可直接粘贴到微信公众号编辑器

### Modified Capabilities

<!-- 无现有 capability 的 spec-level 行为变更 -->

## Impact

- **新增文件**：`src/wechat/` 目录下约 17 个文件（11 个移植自 doocs/md，6 个新编写）
- **修改文件**：`src/components/toolbar-v2/Toolbar.tsx`、`src/AppV2.tsx`（各增加约 5-10 行）
- **新增依赖**：`marked ^15.x`、`front-matter ^4.0.2`、`juice ^11.1.1`（及对应 `@types`）
- **无 breaking change**：现有功能完全不受影响，新模块完全独立
- **浏览器 API**：使用 `navigator.clipboard.write`（需 HTTPS 或 localhost）
