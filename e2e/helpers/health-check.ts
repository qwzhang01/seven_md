import { chromium } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:1420';

/**
 * Check if the application is running and accessible
 */
export async function checkAppHealth(): Promise<boolean> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const response = await page.goto(BASE_URL, { timeout: 10000 });
    return response?.ok() ?? false;
  } catch {
    return false;
  } finally {
    await browser.close();
  }
}

/**
 * Wait for the application to be ready
 */
export async function waitForAppReady(timeout = 30000): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const isHealthy = await checkAppHealth();
    if (isHealthy) return;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Application at ${BASE_URL} is not ready after ${timeout}ms`);
}

/**
 * Verify the editor component is loaded
 */
export async function verifyEditorLoaded(page: import('@playwright/test').Page): Promise<boolean> {
  try {
    await page.waitForSelector('.cm-editor', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify the preview component is loaded
 */
export async function verifyPreviewLoaded(page: import('@playwright/test').Page): Promise<boolean> {
  try {
    await page.waitForSelector('[data-testid="preview-pane"]', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
