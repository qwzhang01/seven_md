import { Page, Locator, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Wait for an element to be visible and stable
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<Locator> {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

/**
 * Wait for text to appear in an element
 */
export async function waitForText(
  page: Page,
  selector: string,
  text: string,
  timeout = 5000
): Promise<void> {
  await expect(page.locator(selector)).toContainText(text, { timeout });
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  options?: { fullPage?: boolean }
): Promise<Buffer> {
  const screenshotDir = path.resolve('./test-results/screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const filename = `${name}-${Date.now()}.png`;
  const filepath = path.join(screenshotDir, filename);

  return await page.screenshot({
    path: filepath,
    fullPage: options?.fullPage ?? false,
  });
}

/**
 * Assert that an element has specific text content
 */
export async function assertText(
  page: Page,
  selector: string,
  expectedText: string
): Promise<void> {
  await expect(page.locator(selector)).toHaveText(expectedText);
}

/**
 * Assert that an element contains specific text
 */
export async function assertContainsText(
  page: Page,
  selector: string,
  expectedText: string
): Promise<void> {
  await expect(page.locator(selector)).toContainText(expectedText);
}

/**
 * Assert that an element is visible
 */
export async function assertVisible(page: Page, selector: string): Promise<void> {
  await expect(page.locator(selector)).toBeVisible();
}

/**
 * Assert that an element is hidden
 */
export async function assertHidden(page: Page, selector: string): Promise<void> {
  await expect(page.locator(selector)).toBeHidden();
}

/**
 * Type text into an element with a delay to simulate real typing
 */
export async function typeText(
  page: Page,
  selector: string,
  text: string,
  delay = 50
): Promise<void> {
  await page.locator(selector).click();
  await page.keyboard.type(text, { delay });
}

/**
 * Clear an input field and type new text
 */
export async function clearAndType(
  page: Page,
  selector: string,
  text: string
): Promise<void> {
  const locator = page.locator(selector);
  await locator.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.type(text);
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Retry an action multiple times
 */
export async function retry<T>(
  action: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Get the current URL
 */
export async function getCurrentUrl(page: Page): Promise<string> {
  return page.url();
}

/**
 * Scroll to an element
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded();
}
