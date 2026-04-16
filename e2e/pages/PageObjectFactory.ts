import { Page } from '@playwright/test';
import { EditorPage } from './EditorPage';
import { PreviewPage } from './PreviewPage';
import { MenuBarPage } from './MenuBarPage';
import { SettingsPage } from './SettingsPage';
import { FileDialogPage } from './FileDialogPage';

/**
 * Factory for creating page objects
 * Provides a convenient way to instantiate all page objects
 */
export class PageObjectFactory {
  private readonly page: Page;

  // Cached instances
  private _editorPage?: EditorPage;
  private _previewPage?: PreviewPage;
  private _menuBarPage?: MenuBarPage;
  private _settingsPage?: SettingsPage;
  private _fileDialogPage?: FileDialogPage;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get or create an EditorPage instance
   */
  get editor(): EditorPage {
    if (!this._editorPage) {
      this._editorPage = new EditorPage(this.page);
    }
    return this._editorPage;
  }

  /**
   * Get or create a PreviewPage instance
   */
  get preview(): PreviewPage {
    if (!this._previewPage) {
      this._previewPage = new PreviewPage(this.page);
    }
    return this._previewPage;
  }

  /**
   * Get or create a MenuBarPage instance
   */
  get menuBar(): MenuBarPage {
    if (!this._menuBarPage) {
      this._menuBarPage = new MenuBarPage(this.page);
    }
    return this._menuBarPage;
  }

  /**
   * Get or create a SettingsPage instance
   */
  get settings(): SettingsPage {
    if (!this._settingsPage) {
      this._settingsPage = new SettingsPage(this.page);
    }
    return this._settingsPage;
  }

  /**
   * Get or create a FileDialogPage instance
   */
  get fileDialog(): FileDialogPage {
    if (!this._fileDialogPage) {
      this._fileDialogPage = new FileDialogPage(this.page);
    }
    return this._fileDialogPage;
  }

  /**
   * Create a fresh set of page objects (no caching)
   */
  static create(page: Page): {
    editor: EditorPage;
    preview: PreviewPage;
    menuBar: MenuBarPage;
    settings: SettingsPage;
    fileDialog: FileDialogPage;
  } {
    return {
      editor: new EditorPage(page),
      preview: new PreviewPage(page),
      menuBar: new MenuBarPage(page),
      settings: new SettingsPage(page),
      fileDialog: new FileDialogPage(page),
    };
  }
}
