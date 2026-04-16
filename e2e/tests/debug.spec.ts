import { test, expect } from '../fixtures';

/**
 * Smoke test to verify the application loads correctly with Tauri mocks
 */
test.describe('Application Smoke Tests', () => {
  test('should load the application successfully', async ({ appPage }) => {
    // Verify the app loaded without errors
    const bodyExists = await appPage.evaluate(() => !!document.body);
    expect(bodyExists).toBe(true);
  });

  test('should have editor and preview regions', async ({ appPage }) => {
    const editorRegion = appPage.locator('[role="region"][aria-label="Markdown editor"]');
    const previewRegion = appPage.locator('[role="region"][aria-label="Markdown preview"]');
    await expect(editorRegion).toBeVisible();
    await expect(previewRegion).toBeVisible();
  });

  test('should have CodeMirror editor', async ({ appPage }) => {
    await expect(appPage.locator('.cm-editor')).toBeVisible();
  });

  test('should render markdown in preview', async ({ appPage }) => {
    await appPage.locator('.cm-content').click();
    await appPage.keyboard.type('# Smoke Test');
    await appPage.waitForTimeout(1500);
    const h1 = appPage.locator('.markdown-body h1');
    await expect(h1).toContainText('Smoke Test');
  });
});
