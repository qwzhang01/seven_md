import { test, expect } from '@playwright/test'

/**
 * E2E 测试：编辑器核心工作流
 * 新建文件 → 编辑 → 查找替换 → 视图切换
 */
test.describe('编辑器工作流', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('Ctrl+N 新建文件并打开编辑器', async ({ page }) => {
    await page.keyboard.press('Control+n')
    // 编辑器应该出现
    await expect(page.locator('.cm-editor')).toBeVisible()
    // 空文件状态消失
    await expect(page.getByText('没有打开的文件')).not.toBeVisible()
  })

  test('新建文件后可以输入内容', async ({ page }) => {
    await page.keyboard.press('Control+n')
    const editor = page.locator('.cm-content')
    await editor.click()
    await page.keyboard.type('# Hello World')
    await expect(editor).toContainText('Hello World')
  })

  test('新建文件后状态栏显示光标位置', async ({ page }) => {
    await page.keyboard.press('Control+n')
    await expect(page.getByText(/行 \d+, 列 \d+/)).toBeVisible()
  })

  test('Ctrl+F 打开查找栏', async ({ page }) => {
    await page.keyboard.press('Control+n')
    await page.keyboard.press('Control+f')
    await expect(page.getByPlaceholder('查找...')).toBeVisible()
  })

  test('Esc 关闭查找栏', async ({ page }) => {
    await page.keyboard.press('Control+n')
    await page.keyboard.press('Control+f')
    await expect(page.getByPlaceholder('查找...')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByPlaceholder('查找...')).not.toBeVisible()
  })

  test('Ctrl+H 打开查找替换栏', async ({ page }) => {
    await page.keyboard.press('Control+n')
    await page.keyboard.press('Control+h')
    await expect(page.getByPlaceholder('查找...')).toBeVisible()
    await expect(page.getByPlaceholder('替换...')).toBeVisible()
  })

  test('视图菜单：切换到仅编辑器模式', async ({ page }) => {
    await page.keyboard.press('Control+n')
    await page.getByText('视图').click()
    await page.getByText('仅编辑器').click()
    // 预览区应消失
    await expect(page.getByText('预览')).not.toBeVisible()
    await expect(page.locator('.cm-editor')).toBeVisible()
  })

  test('视图菜单：切换到分栏视图', async ({ page }) => {
    await page.keyboard.press('Control+n')
    await page.getByText('视图').click()
    await page.getByText('仅编辑器').click()
    await page.getByText('视图').click()
    await page.getByText('分栏视图').click()
    // 预览区应再次出现
    await expect(page.getByText('预览')).toBeVisible()
  })

  test('工具栏 H1 按钮插入标题', async ({ page }) => {
    await page.keyboard.press('Control+n')
    const editor = page.locator('.cm-content')
    await editor.click()

    // 点击 H1 工具栏按钮
    await page.locator('[aria-label="标题 1"]').click()
    await expect(editor).toContainText('# ')
  })

  test('AI 助手按钮打开 AI 面板', async ({ page }) => {
    await page.locator('[aria-label="AI 助手"]').click()
    // AI 面板应显示模式标签
    await expect(page.getByText('对话')).toBeVisible()
    await expect(page.getByText('改写')).toBeVisible()
  })
})
