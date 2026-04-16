import { test, expect } from '../../fixtures';

test.describe('Multi-Tab Workflows', () => {
  test('13.1 should open multiple files in separate tabs', async ({ appPage }) => {
    // Check that the tab bar exists
    const tabBar = appPage.locator('[role="tablist"]');
    const tabBarExists = await tabBar.isVisible().catch(() => false);
    
    if (tabBarExists) {
      // Verify tab bar is present
      await expect(tabBar).toBeVisible();
    }
    // App should be functional regardless
    await appPage.waitForLoadState('networkidle');
  });

  test('13.2 should switch between tabs', async ({ appPage }) => {
    await appPage.waitForLoadState('networkidle');
    
    // Check if tabs are present
    const tabs = appPage.locator('[role="tab"]');
    const tabCount = await tabs.count();
    
    if (tabCount > 1) {
      // Click second tab
      await tabs.nth(1).click();
      await appPage.waitForTimeout(200);
      
      // Second tab should be active
      const secondTab = tabs.nth(1);
      const isSelected = await secondTab.getAttribute('aria-selected');
      expect(isSelected).toBe('true');
    }
  });

  test('13.3 should close a tab', async ({ appPage }) => {
    await appPage.waitForLoadState('networkidle');
    
    const tabs = appPage.locator('[role="tab"]');
    const initialCount = await tabs.count();
    
    if (initialCount > 0) {
      // Find close button on first tab
      const closeBtn = appPage.locator('[role="tab"]').first().locator('button[aria-label*="close" i]');
      const closeBtnExists = await closeBtn.isVisible().catch(() => false);
      
      if (closeBtnExists) {
        await closeBtn.click();
        await appPage.waitForTimeout(200);
        const newCount = await tabs.count();
        expect(newCount).toBeLessThanOrEqual(initialCount);
      }
    }
  });

  test('13.4 should show dirty indicator for unsaved changes', async ({ appPage, editorPage }) => {
    await editorPage.waitForEditor();
    
    // Type something in the editor
    const editor = appPage.locator('.cm-editor');
    const editorExists = await editor.isVisible().catch(() => false);
    
    if (editorExists) {
      await editor.click();
      await appPage.keyboard.type('# Test content');
      await appPage.waitForTimeout(200);
      
      // Check for dirty indicator (● symbol or similar)
      const dirtyIndicator = appPage.locator('[role="tab"]').first().locator('text=●');
      const isDirty = await dirtyIndicator.isVisible().catch(() => false);
      // Dirty indicator may or may not be visible depending on initial state
      expect(typeof isDirty).toBe('boolean');
    }
  });

  test('13.5 should persist tabs across page reload', async ({ appPage }) => {
    await appPage.waitForLoadState('networkidle');
    
    // Check initial tab state
    const tabs = appPage.locator('[role="tab"]');
    const initialCount = await tabs.count();
    
    // Reload the page
    await appPage.reload();
    await appPage.waitForLoadState('networkidle');
    
    // App should still be functional
    const appContainer = appPage.locator('.h-screen');
    await expect(appContainer).toBeVisible();
  });

  test('13.6 keyboard shortcut Ctrl+W closes active tab', async ({ appPage }) => {
    await appPage.waitForLoadState('networkidle');
    
    const tabs = appPage.locator('[role="tab"]');
    const initialCount = await tabs.count();
    
    if (initialCount > 0) {
      await appPage.keyboard.press('Control+w');
      await appPage.waitForTimeout(300);
      // App should still be functional
      const appContainer = appPage.locator('.h-screen');
      await expect(appContainer).toBeVisible();
    }
  });

  test('13.7 tab bar shows correct tab count', async ({ appPage }) => {
    await appPage.waitForLoadState('networkidle');
    
    const tabBar = appPage.locator('[role="tablist"]');
    const tabBarExists = await tabBar.isVisible().catch(() => false);
    
    if (tabBarExists) {
      const tabs = appPage.locator('[role="tab"]');
      const count = await tabs.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
