import { test, expect } from '@playwright/test'

/**
 * E2E 测试：应用启动与基础布局
 */
test.describe('应用启动', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 等待应用加载完成
    await page.waitForLoadState('networkidle')
  })

  test('标题栏正确渲染', async ({ page }) => {
    // 标题栏容器存在
    await expect(page.locator('[data-tauri-drag-region]').first()).toBeVisible()
  })

  test('工具栏渲染', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="编辑工具栏"]')
    await expect(toolbar).toBeVisible()
  })

  test('活动栏渲染 4 个图标', async ({ page }) => {
    const activityBar = page.locator('[role="navigation"][aria-label="活动栏"]')
    await expect(activityBar).toBeVisible()
    const buttons = activityBar.locator('button')
    await expect(buttons).toHaveCount(4)
  })

  test('状态栏渲染', async ({ page }) => {
    const statusBar = page.locator('[role="status"]')
    await expect(statusBar).toBeVisible()
    await expect(page.getByText('main')).toBeVisible()
    await expect(page.getByText(/Markdown/)).toBeVisible()
  })

  test('空状态提示正确显示', async ({ page }) => {
    await expect(page.getByText('没有打开的文件')).toBeVisible()
  })

  test('页面应用了 dark 主题', async ({ page }) => {
    const html = page.locator('html')
    const theme = await html.getAttribute('data-theme')
    expect(theme).toBe('dark')
  })
})
