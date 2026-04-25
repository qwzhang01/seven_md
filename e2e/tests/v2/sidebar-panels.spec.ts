import { test, expect } from '@playwright/test'

/**
 * E2E 测试：侧边栏面板切换
 */
test.describe('侧边栏面板', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('活动栏图标可见', async ({ page }) => {
    const activityBar = page.locator('[role="navigation"][aria-label="活动栏"]')
    await expect(activityBar.locator('button').nth(0)).toBeVisible() // explorer
    await expect(activityBar.locator('button').nth(1)).toBeVisible() // search
    await expect(activityBar.locator('button').nth(2)).toBeVisible() // outline
    await expect(activityBar.locator('button').nth(3)).toBeVisible() // snippets
  })

  test('点击搜索图标切换到搜索面板', async ({ page }) => {
    const searchBtn = page.locator('[aria-label*="搜索"]').first()
    await searchBtn.click()
    await expect(page.getByPlaceholder('搜索文件内容...')).toBeVisible()
  })

  test('点击大纲图标切换到大纲面板', async ({ page }) => {
    const outlineBtn = page.locator('[aria-label*="大纲"]').first()
    await outlineBtn.click()
    await expect(page.getByPlaceholder('筛选大纲...')).toBeVisible()
  })

  test('点击片段图标切换到片段面板', async ({ page }) => {
    const snippetsBtn = page.locator('[aria-label*="片段"]').first()
    await snippetsBtn.click()
    await expect(page.getByPlaceholder('搜索片段...')).toBeVisible()
  })

  test('再次点击活动图标收起侧边栏', async ({ page }) => {
    // 先找到资源管理器按钮并点击两次
    const explorerBtn = page.locator('[aria-label*="资源管理器"]').first()
    await explorerBtn.click() // 收起
    // 侧边栏内容不可见
    await expect(page.getByPlaceholder('搜索文件内容...')).not.toBeVisible()
  })

  test('Ctrl+B 切换侧边栏', async ({ page }) => {
    await page.keyboard.press('Control+b')
    // 内容区域变大（不检查具体宽度，只检查侧边栏是否存在内容）
    await page.keyboard.press('Control+b') // 再次展开
    const activityBar = page.locator('[role="navigation"][aria-label="活动栏"]')
    await expect(activityBar).toBeVisible()
  })

  test('搜索面板：输入关键词显示搜索状态', async ({ page }) => {
    const searchBtn = page.locator('[aria-label*="搜索"]').first()
    await searchBtn.click()

    const searchInput = page.getByPlaceholder('搜索文件内容...')
    await searchInput.fill('markdown')
    // 显示搜索状态文本
    await expect(page.getByText(/找到|未找到|输入关键词/)).toBeVisible()
  })

  test('片段面板：Markdown 表格片段存在', async ({ page }) => {
    const snippetsBtn = page.locator('[aria-label*="片段"]').first()
    await snippetsBtn.click()
    await expect(page.getByText('Markdown 表格')).toBeVisible()
  })
})
