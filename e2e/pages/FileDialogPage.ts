import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for File Dialog interactions
 * Handles file open/save dialog mocking and interactions
 */
export class FileDialogPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Mock a file open dialog to return a specific file path
   * This intercepts the Tauri file dialog API
   */
  async mockFileOpen(filePath: string): Promise<void> {
    await this.page.evaluate((path) => {
      // Mock the Tauri dialog plugin
      (window as unknown as Record<string, unknown>).__TAURI_MOCK_FILE_PATH__ = path;
    }, filePath);
  }

  /**
   * Mock a file save dialog to return a specific file path
   */
  async mockFileSave(filePath: string): Promise<void> {
    await this.page.evaluate((path) => {
      (window as unknown as Record<string, unknown>).__TAURI_MOCK_SAVE_PATH__ = path;
    }, filePath);
  }

  /**
   * Trigger file open via keyboard shortcut
   */
  async openFileWithShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+O');
  }

  /**
   * Trigger file save via keyboard shortcut
   */
  async saveFileWithShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+S');
  }

  /**
   * Trigger new file via keyboard shortcut
   */
  async newFileWithShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+N');
  }

  /**
   * Simulate dropping a file onto the application
   */
  async dropFile(filePath: string, targetSelector: string): Promise<void> {
    const target = this.page.locator(targetSelector);
    const targetBox = await target.boundingBox();
    if (!targetBox) throw new Error(`Target element not found: ${targetSelector}`);

    // Create a DataTransfer with the file
    await this.page.evaluate(async (path) => {
      const response = await fetch(`file://${path}`);
      const blob = await response.blob();
      const file = new File([blob], path.split('/').pop() || 'file.md', { type: 'text/markdown' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      return dataTransfer;
    }, filePath);

    // Dispatch drag events
    await target.dispatchEvent('dragover');
    await target.dispatchEvent('drop');
  }

  /**
   * Wait for a file to be loaded in the editor
   */
  async waitForFileLoad(timeout = 5000): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const editor = document.querySelector('.cm-content');
        return editor && editor.textContent && editor.textContent.length > 0;
      },
      { timeout }
    );
  }
}
