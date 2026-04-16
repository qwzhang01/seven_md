import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Menu Bar and Toolbar
 * Handles all menu and toolbar interactions
 */
export class MenuBarPage extends BasePage {
  // Selectors - based on actual DOM structure
  // Menu container has aria-label on the parent div, button inside
  private readonly menuBarSelector = '[role="menubar"]';
  private readonly toolbarSelector = '[data-testid="toolbar"]';
  private readonly fileMenuSelector = '[aria-label="File menu"] button';
  private readonly editMenuSelector = '[aria-label="Edit menu"] button';
  private readonly viewMenuSelector = '[aria-label="View menu"] button';
  private readonly helpMenuSelector = '[aria-label="Help menu"] button';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Wait for the menu bar to be ready
   */
  async waitForMenuBar(): Promise<void> {
    await this.page.waitForSelector(this.menuBarSelector, { timeout: 10000 });
    await this.page.waitForTimeout(300);
  }

  /**
   * Open the File menu
   */
  async openFileMenu(): Promise<void> {
    await this.waitForMenuBar();
    const fileMenu = this.page.locator(this.fileMenuSelector);
    await fileMenu.waitFor({ state: 'visible', timeout: 5000 });
    await fileMenu.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Open the Edit menu
   */
  async openEditMenu(): Promise<void> {
    await this.page.locator(this.editMenuSelector).click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Open the View menu
   */
  async openViewMenu(): Promise<void> {
    await this.page.locator(this.viewMenuSelector).click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Open the Help menu
   */
  async openHelpMenu(): Promise<void> {
    await this.page.locator(this.helpMenuSelector).click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Click a menu item by its text
   */
  async clickMenuItem(text: string): Promise<void> {
    await this.page.getByRole('menuitem', { name: text }).click();
  }

  /**
   * Click "New File" from the File menu
   */
  async clickNewFile(): Promise<void> {
    await this.openFileMenu();
    await this.clickMenuItem('New File');
  }

  /**
   * Click "Open File" from the File menu
   */
  async clickOpenFile(): Promise<void> {
    await this.openFileMenu();
    await this.clickMenuItem('Open File');
  }

  /**
   * Click "Save" from the File menu
   */
  async clickSave(): Promise<void> {
    await this.openFileMenu();
    await this.clickMenuItem('Save');
  }

  /**
   * Click "Save As" from the File menu
   */
  async clickSaveAs(): Promise<void> {
    await this.openFileMenu();
    await this.clickMenuItem('Save As');
  }

  /**
   * Click "Export as PDF" from the File menu
   */
  async clickExportPdf(): Promise<void> {
    await this.openFileMenu();
    await this.clickMenuItem('Export as PDF');
  }

  /**
   * Click "Export as HTML" from the File menu
   */
  async clickExportHtml(): Promise<void> {
    await this.openFileMenu();
    await this.clickMenuItem('Export as HTML');
  }

  /**
   * Check if Export menu items are disabled
   */
  async isExportPdfDisabled(): Promise<boolean> {
    await this.openFileMenu();
    const item = this.page.getByRole('menuitem', { name: 'Export as PDF' });
    const disabled = await item.getAttribute('aria-disabled');
    await this.closeMenu();
    return disabled === 'true';
  }

  /**
   * Check if Export as HTML menu item is disabled
   */
  async isExportHtmlDisabled(): Promise<boolean> {
    await this.openFileMenu();
    const item = this.page.getByRole('menuitem', { name: 'Export as HTML' });
    const disabled = await item.getAttribute('aria-disabled');
    await this.closeMenu();
    return disabled === 'true';
  }

  /**
   * Click a toolbar button by its aria-label
   */
  async clickToolbarButton(label: string): Promise<void> {
    await this.page.locator(`${this.toolbarSelector} button[aria-label="${label}"]`).click();
  }

  /**
   * Toggle the sidebar
   */
  async toggleSidebar(): Promise<void> {
    await this.clickToolbarButton('Toggle Sidebar');
  }

  /**
   * Toggle the preview pane
   */
  async togglePreview(): Promise<void> {
    await this.clickToolbarButton('Toggle Preview');
  }

  /**
   * Switch theme (light/dark)
   */
  async toggleTheme(): Promise<void> {
    await this.clickToolbarButton('Toggle Theme');
  }

  /**
   * Assert the menu bar is visible
   */
  async assertMenuBarVisible(): Promise<void> {
    await expect(this.page.locator(this.menuBarSelector)).toBeVisible();
  }

  /**
   * Assert a menu item is visible
   */
  async assertMenuItemVisible(text: string): Promise<void> {
    await expect(this.page.getByRole('menuitem', { name: text })).toBeVisible();
  }

  /**
   * Close any open menu by pressing Escape
   */
  async closeMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }
}
