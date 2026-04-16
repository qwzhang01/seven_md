import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Preview Pane
 * Handles all preview-related interactions
 */
export class PreviewPage extends BasePage {
  // Selectors - based on actual DOM: role="region" aria-label="Markdown preview"
  private readonly previewSelector = '[role="region"][aria-label="Markdown preview"]';
  private readonly previewContentSelector = '[role="region"][aria-label="Markdown preview"] .markdown-body';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Wait for the preview pane to be ready
   */
  async waitForPreview(): Promise<void> {
    await this.waitForVisible(this.previewSelector);
  }

  /**
   * Get the HTML content of the preview pane
   */
  async getPreviewHTML(): Promise<string> {
    return await this.page.locator(this.previewContentSelector).innerHTML();
  }

  /**
   * Get the text content of the preview pane
   */
  async getPreviewText(): Promise<string> {
    return await this.page.locator(this.previewContentSelector).innerText();
  }

  /**
   * Assert the preview contains specific text
   */
  async assertContains(text: string): Promise<void> {
    await expect(this.page.locator(this.previewSelector)).toContainText(text);
  }

  /**
   * Assert the preview contains a heading
   */
  async assertHeading(level: 1 | 2 | 3 | 4 | 5 | 6, text: string): Promise<void> {
    await expect(
      this.page.locator(`${this.previewContentSelector} h${level}`)
    ).toContainText(text);
  }

  /**
   * Assert the preview contains bold text
   */
  async assertBoldText(text: string): Promise<void> {
    await expect(
      this.page.locator(`${this.previewContentSelector} strong`)
    ).toContainText(text);
  }

  /**
   * Assert the preview contains italic text
   */
  async assertItalicText(text: string): Promise<void> {
    await expect(
      this.page.locator(`${this.previewContentSelector} em`)
    ).toContainText(text);
  }

  /**
   * Assert the preview contains a code block
   */
  async assertCodeBlock(code: string): Promise<void> {
    await expect(
      this.page.locator(`${this.previewContentSelector} pre code`)
    ).toContainText(code);
  }

  /**
   * Assert the preview contains a link
   */
  async assertLink(text: string, href?: string): Promise<void> {
    const linkLocator = this.page.locator(`${this.previewContentSelector} a`).filter({ hasText: text });
    await expect(linkLocator).toBeVisible();
    if (href) {
      await expect(linkLocator).toHaveAttribute('href', href);
    }
  }

  /**
   * Assert the preview contains an image
   */
  async assertImage(alt: string): Promise<void> {
    await expect(
      this.page.locator(`${this.previewContentSelector} img[alt="${alt}"]`)
    ).toBeVisible();
  }

  /**
   * Assert the preview contains a list item
   */
  async assertListItem(text: string): Promise<void> {
    await expect(
      this.page.locator(`${this.previewContentSelector} li`).filter({ hasText: text }).first()
    ).toBeVisible();
  }

  /**
   * Get the scroll position of the preview pane
   */
  async getScrollPosition(): Promise<{ scrollTop: number; scrollHeight: number }> {
    return await this.page.locator(this.previewSelector).evaluate(el => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
    }));
  }

  /**
   * Scroll the preview pane to a specific position
   */
  async scrollTo(position: number): Promise<void> {
    await this.page.locator(this.previewSelector).evaluate((el, pos) => {
      el.scrollTop = pos;
    }, position);
  }

  /**
   * Assert the preview is visible
   */
  async assertPreviewVisible(): Promise<void> {
    await expect(this.page.locator(this.previewSelector)).toBeVisible();
  }

  /**
   * Assert the preview is hidden
   */
  async assertPreviewHidden(): Promise<void> {
    await expect(this.page.locator(this.previewSelector)).toBeHidden();
  }

  /**
   * Wait for preview to update after editor changes
   * CodeMirror has a 300ms debounce + React render time
   */
  async waitForUpdate(timeout = 1500): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }
}
