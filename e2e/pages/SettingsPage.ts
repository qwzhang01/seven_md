import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Settings Dialog
 * Handles all settings-related interactions
 */
export class SettingsPage extends BasePage {
  // Selectors
  private readonly settingsDialogSelector = '[data-testid="settings-dialog"]';
  private readonly themeSelectSelector = '[data-testid="theme-select"]';
  private readonly fontSizeSelector = '[data-testid="font-size-input"]';
  private readonly languageSelectSelector = '[data-testid="language-select"]';
  private readonly saveButtonSelector = '[data-testid="settings-save"]';
  private readonly cancelButtonSelector = '[data-testid="settings-cancel"]';
  private readonly resetButtonSelector = '[data-testid="settings-reset"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Open the settings dialog
   */
  async openSettings(): Promise<void> {
    // Try keyboard shortcut first
    await this.page.keyboard.press('Control+,');
    await this.waitForVisible(this.settingsDialogSelector);
  }

  /**
   * Close the settings dialog
   */
  async closeSettings(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.waitForHidden(this.settingsDialogSelector);
  }

  /**
   * Select a theme
   */
  async selectTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    await this.page.locator(this.themeSelectSelector).selectOption(theme);
  }

  /**
   * Set font size
   */
  async setFontSize(size: number): Promise<void> {
    await this.page.locator(this.fontSizeSelector).fill(String(size));
  }

  /**
   * Select language
   */
  async selectLanguage(language: string): Promise<void> {
    await this.page.locator(this.languageSelectSelector).selectOption(language);
  }

  /**
   * Save settings
   */
  async saveSettings(): Promise<void> {
    await this.page.locator(this.saveButtonSelector).click();
    await this.waitForHidden(this.settingsDialogSelector);
  }

  /**
   * Cancel settings changes
   */
  async cancelSettings(): Promise<void> {
    await this.page.locator(this.cancelButtonSelector).click();
    await this.waitForHidden(this.settingsDialogSelector);
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<void> {
    await this.page.locator(this.resetButtonSelector).click();
  }

  /**
   * Assert the settings dialog is open
   */
  async assertSettingsOpen(): Promise<void> {
    await expect(this.page.locator(this.settingsDialogSelector)).toBeVisible();
  }

  /**
   * Assert the settings dialog is closed
   */
  async assertSettingsClosed(): Promise<void> {
    await expect(this.page.locator(this.settingsDialogSelector)).toBeHidden();
  }

  /**
   * Get the current theme value
   */
  async getCurrentTheme(): Promise<string> {
    return await this.page.locator(this.themeSelectSelector).inputValue();
  }
}
