import { test, expect } from '@playwright/test'

/**
 * E2E 测试：命令面板
 */
test.describe('命令面板', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('Ctrl+Shift+P 打开命令面板', async ({ page }) => {
    await page.keyboard.press('Control+Shift+P')
    await expect(page.getByPlaceholder('输入命令或搜索...')).toBeVisible()
  })

  test('Esc 关闭命令面板', async ({ page }) => {
    await page.keyboard.press('Control+Shift+P')
    await expect(page.getByPlaceholder('输入命令或搜索...')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByPlaceholder('输入命令或搜索...')).not.toBeVisible()
  })

  test('命令面板渲染命令列表', async ({ page }) => {
    await page.keyboard.press('Control+Shift+P')
    // 应显示多个命令
    const items = page.locator('[class*="cursor-pointer"]:has-text("文件")')
    await expect(items.first()).toBeVisible()
  })

  test('搜索过滤命令', async ({ page }) => {
    await page.keyboard.press('Control+Shift+P')
    await page.getByPlaceholder('输入命令或搜索...').fill('主题')
    // 应显示主题相关命令
    await expect(page.getByText(/深色模式|浅色模式/).first()).toBeVisible()
  })

  test('通过标题栏按钮打开命令面板', async ({ page }) => {
    // 标题栏操作按钮
    const cmdBtn = page.locator('[aria-label="命令面板"]').first()
    await cmdBtn.click()
    await expect(page.getByPlaceholder('输入命令或搜索...')).toBeVisible()
  })

  test('点击遮罩层关闭命令面板', async ({ page }) => {
    await page.keyboard.press('Control+Shift+P')
    // 点击命令面板外的遮罩
    await page.mouse.click(10, 10)
    await expect(page.getByPlaceholder('输入命令或搜索...')).not.toBeVisible()
  })

  test('通过视图菜单打开命令面板', async ({ page }) => {
    await page.getByText('视图').click()
    await page.getByText('命令面板').click()
    await expect(page.getByPlaceholder('输入命令或搜索...')).toBeVisible()
  })
})
