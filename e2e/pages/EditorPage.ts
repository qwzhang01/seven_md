import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Markdown Editor
 * Handles all editor-related interactions
 */
export class EditorPage extends BasePage {
  // Selectors
  private readonly editorSelector = '.cm-editor';
  private readonly editorContentSelector = '.cm-content';
  private readonly editorLineSelector = '.cm-line';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Wait for the editor to be ready
   */
  async waitForEditor(): Promise<void> {
    await this.waitForVisible(this.editorSelector);
  }

  /**
   * Click on the editor to focus it
   */
  async focusEditor(): Promise<void> {
    await this.click(this.editorContentSelector);
  }

  /**
   * Type text into the editor
   */
  async typeInEditor(text: string): Promise<void> {
    await this.focusEditor();
    await this.page.keyboard.type(text);
  }

  /**
   * Set the editor content (replaces all existing content)
   */
  async setContent(content: string): Promise<void> {
    await this.focusEditor();
    // Select all and replace
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.type(content);
  }

  /**
   * Get the current editor content
   */
  async getContent(): Promise<string> {
    return await this.page.evaluate(() => {
      const editorView = (window as unknown as { __editorView?: { state: { doc: { toString: () => string } } } }).__editorView;
      if (editorView) {
        return editorView.state.doc.toString();
      }
      // Fallback: get text from editor lines
      const lines = document.querySelectorAll('.cm-line');
      return Array.from(lines).map(l => l.textContent || '').join('\n');
    });
  }

  /**
   * Clear the editor content
   */
  async clearContent(): Promise<void> {
    await this.focusEditor();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Delete');
  }

  /**
   * Apply bold formatting (Ctrl+B)
   */
  async applyBold(): Promise<void> {
    await this.focusEditor();
    await this.page.keyboard.press('Control+B');
  }

  /**
   * Apply italic formatting (Ctrl+I)
   */
  async applyItalic(): Promise<void> {
    await this.focusEditor();
    await this.page.keyboard.press('Control+I');
  }

  /**
   * Select all text in the editor
   */
  async selectAll(): Promise<void> {
    await this.focusEditor();
    await this.page.keyboard.press('Control+A');
  }

  /**
   * Select text by typing and using keyboard shortcuts
   */
  async selectText(startOffset: number, length: number): Promise<void> {
    await this.focusEditor();
    // Move to start of document
    await this.page.keyboard.press('Control+Home');
    // Move forward by startOffset characters
    for (let i = 0; i < startOffset; i++) {
      await this.page.keyboard.press('ArrowRight');
    }
    // Select length characters
    for (let i = 0; i < length; i++) {
      await this.page.keyboard.press('Shift+ArrowRight');
    }
  }

  /**
   * Undo last action (Ctrl+Z)
   */
  async undo(): Promise<void> {
    await this.focusEditor();
    await this.page.keyboard.press('Control+Z');
  }

  /**
   * Redo last action (Ctrl+Y or Ctrl+Shift+Z)
   */
  async redo(): Promise<void> {
    await this.focusEditor();
    await this.page.keyboard.press('Control+Y');
  }

  /**
   * Move cursor to the beginning of the document
   */
  async moveCursorToStart(): Promise<void> {
    await this.focusEditor();
    await this.page.keyboard.press('Control+Home');
  }

  /**
   * Move cursor to the end of the document
   */
  async moveCursorToEnd(): Promise<void> {
    await this.focusEditor();
    await this.page.keyboard.press('Control+End');
  }

  /**
   * Press Enter to create a new line
   */
  async pressEnter(): Promise<void> {
    await this.focusEditor();
    await this.page.keyboard.press('Enter');
  }

  /**
   * Assert the editor is visible
   */
  async assertEditorVisible(): Promise<void> {
    await expect(this.page.locator(this.editorSelector)).toBeVisible();
  }

  /**
   * Assert the editor contains specific text
   */
  async assertContains(text: string): Promise<void> {
    await expect(this.page.locator(this.editorContentSelector)).toContainText(text);
  }

  /**
   * Get the number of lines in the editor
   */
  async getLineCount(): Promise<number> {
    return await this.page.locator(this.editorLineSelector).count();
  }

  /**
   * Scroll the editor to the top
   */
  async scrollToTop(): Promise<void> {
    await this.page.locator(this.editorSelector).evaluate(el => {
      el.scrollTop = 0;
    });
  }

  /**
   * Scroll the editor to the bottom
   */
  async scrollToBottom(): Promise<void> {
    await this.page.locator(this.editorSelector).evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });
  }
}
