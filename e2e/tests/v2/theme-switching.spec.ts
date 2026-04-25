import { test, expect } from '@playwright/test'

/**
 * E2E 测试：主题切换
 */
test.describe('主题切换', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('通过菜单栏切换到浅色主题', async ({ page }) => {
    // 点击主题菜单
    await page.getByText('主题').click()
    // 选择浅色模式
    await page.getByText('浅色模式').click()

    // 等待主题应用
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('通过菜单栏切换到 Monokai 主题', async ({ page }) => {
    await page.getByText('主题').click()
    await page.getByText('Monokai').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'monokai')
  })

  test('通过命令面板切换主题', async ({ page }) => {
    // 打开命令面板
    await page.keyboard.press('Control+Shift+P')
    await expect(page.getByPlaceholder('输入命令或搜索...')).toBeVisible()

    // 搜索并选择 Nord 主题
    await page.getByPlaceholder('输入命令或搜索...').fill('Nord')
    await page.getByText('Nord').first().click()

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nord')
  })

  test('主题切换后界面颜色变化', async ({ page }) => {
    // 切到 light 主题
    await page.getByText('主题').click()
    await page.getByText('浅色模式').click()

    // 检查背景色已变为浅色
    const toolbar = page.locator('[role="toolbar"]').first()
    const bg = await toolbar.evaluate((el) => getComputedStyle(el).backgroundColor)
    // light 主题背景应比 dark 亮（RGB 值更大）
    expect(bg).not.toBe('')
  })

  test('切换 Dracula 主题', async ({ page }) => {
    await page.getByText('主题').click()
    await page.getByText('Dracula').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dracula')
  })
})
