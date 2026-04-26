# E2E 测试指南

本文档说明 Seven MD 的端到端（E2E）测试体系。

---

## 概述

Seven MD 使用 [Playwright](https://playwright.dev/) 进行 E2E 测试，验证用户完整操作流程。

---

## 快速开始

### 前置依赖

- Node.js ≥ 18
- npm ≥ 9

### 安装

```bash
# 安装依赖（包含 Playwright）
npm install

# 安装 Playwright 浏览器
npx playwright install chromium
```

### 运行测试

```bash
# 运行全部 E2E 测试
npm run test:e2e

# 交互式 UI 模式
npm run test:e2e:ui

# 有头浏览器模式（可视化）
npm run test:e2e:headed

# 运行指定文件
npx playwright test e2e/tests/editor/editor.spec.ts

# 按名称匹配运行
npx playwright test --grep "加粗格式"

# 调试模式
npm run test:e2e:debug

# 录制测试脚本
npm run test:e2e:codegen
```

---

## 目录结构

```
e2e/
├── tests/                  # 测试用例
│   ├── editor/            # 编辑器相关测试
│   ├── file/              # 文件操作测试
│   ├── preview/           # 预览面板测试
│   └── settings/          # 设置相关测试
├── pages/                  # Page Object Model
│   ├── BasePage.ts        # 基础页面对象
│   ├── EditorPage.ts      # 编辑器交互
│   ├── PreviewPage.ts     # 预览面板交互
│   ├── MenuBarPage.ts     # 菜单栏交互（通过 Tauri 菜单事件触发）
│   ├── SettingsPage.ts    # 设置交互
│   ├── FileDialogPage.ts  # 文件对话框交互
│   └── PageObjectFactory.ts # 页面对象工厂
├── fixtures/               # 测试夹具
│   └── index.ts           # 主夹具文件（扩展 Playwright test）
├── helpers/                # 辅助工具
│   ├── test-helpers.ts    # 通用测试辅助函数
│   ├── test-data.ts       # 测试数据管理
│   └── health-check.ts    # 环境健康检查
└── setup/                  # 测试环境设置
    ├── global-setup.ts    # 全部测试前执行
    └── global-teardown.ts # 全部测试后清理
```

---

## 编写测试

### 基本结构

```typescript
import { test, expect } from '../../fixtures'

test.describe('功能名称', () => {
  test('应能完成某操作', async ({ editorPage, previewPage }) => {
    // Arrange - 准备
    await editorPage.waitForEditor()
    
    // Act - 执行
    await editorPage.typeInEditor('# Hello World')
    
    // Assert - 验证
    await previewPage.waitForUpdate()
    await previewPage.assertHeading(1, 'Hello World')
  })
})
```

### 使用 Page Object

项目采用 **Page Object Model (POM)** 模式，将页面交互封装到独立的 Page 类中：

```typescript
import { test } from '../../fixtures'

test('编辑器测试', async ({ editorPage }) => {
  await editorPage.waitForEditor()
  await editorPage.typeInEditor('Some text')
  await editorPage.assertContains('Some text')
})
```

### 使用 Page Object Factory

```typescript
import { test } from '@playwright/test'
import { PageObjectFactory } from '../../pages/PageObjectFactory'

test('工厂模式', async ({ page }) => {
  await page.goto('/')
  const { editor, preview } = PageObjectFactory.create(page)
  
  await editor.typeInEditor('# 测试')
  await preview.assertHeading(1, '测试')
})
```

---

## 测试数据管理

使用辅助工具管理临时测试文件：

```typescript
import { createTempMarkdownFile, deleteTempFile } from '../../helpers/test-data'

test('文件测试', async ({ editorPage }) => {
  const filePath = createTempMarkdownFile('# 测试内容', 'test.md')
  
  try {
    // 使用临时文件进行测试
  } finally {
    deleteTempFile(filePath) // 务必清理
  }
})
```

---

## 调试 E2E 测试

### 查看测试报告

```bash
# 打开 HTML 报告
npm run test:e2e:report
# 或
npx playwright show-report
```

### Trace Viewer

```bash
# 查看 trace 文件
npx playwright show-trace test-results/trace.zip
```

### 截图

测试失败时自动截图，保存至 `test-results/screenshots/`。

---

## CI/CD 集成

E2E 测试在以下场景自动运行：

- 每次推送到 `main` 或 `develop` 分支
- 每个 Pull Request

测试结果和报告作为 CI Artifact 上传。

---

## 常见问题

### 测试不稳定（Flaky）

1. 添加显式等待：`await page.waitForSelector('.element')`
2. 使用 `waitForVisible` 而非直接断言
3. 检查异步操作是否有竞态条件

### 浏览器未找到

```bash
npx playwright install --with-deps
```

### 端口被占用

修改 `playwright.config.ts` 中的端口号，或设置环境变量 `E2E_BASE_URL`。

### 截图对比失败

1. 确认是否有视觉变更（可能是预期的）
2. 使用 `npx playwright test --update-snapshots` 更新快照
