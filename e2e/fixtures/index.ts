import { test as base, Page } from '@playwright/test';
import { EditorPage } from '../pages/EditorPage';
import { PreviewPage } from '../pages/PreviewPage';
import { SettingsPage } from '../pages/SettingsPage';
import { FileDialogPage } from '../pages/FileDialogPage';
import { PageObjectFactory } from '../pages/PageObjectFactory';

// Test data constants
export const TEST_MARKDOWN = {
  simple: '# Hello World\n\nThis is a test.',
  withFormatting: '**bold** _italic_ ~~strikethrough~~',
  withHeadings: '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6',
  withList: '- Item 1\n- Item 2\n- Item 3',
  withOrderedList: '1. First\n2. Second\n3. Third',
  withCode: '```javascript\nconsole.log("hello");\n```',
  withLink: '[Google](https://www.google.com)',
  withImage: '![Alt text](https://example.com/image.png)',
  empty: '',
  longContent: Array(100).fill('This is a line of content.').join('\n'),
};

/**
 * Inject Tauri API mocks into the page before the app loads.
 * Tauri uses window.__TAURI_INTERNALS__ for all IPC communication.
 */
async function injectTauriMocks(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Mock window.__TAURI_INTERNALS__ - required by @tauri-apps/api
    (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
      transformCallback: (callback: (arg: unknown) => unknown, _once?: boolean) => {
        const id = Math.floor(Math.random() * 1000000);
        (window as unknown as Record<string, unknown>)[`_tauri_cb_${id}`] = callback;
        return id;
      },
      unregisterCallback: (_id: number) => {},
      invoke: async (cmd: string, _args?: unknown, _options?: unknown) => {
        // Mock Tauri commands
        if (cmd === 'read_file') return '';
        if (cmd === 'save_file') return null;
        if (cmd === 'read_directory') return [];
        if (cmd === 'plugin:dialog|open') return null;
        if (cmd === 'plugin:dialog|save') return null;
        console.log('[Tauri Mock] unhandled invoke:', cmd);
        return null;
      },
      convertFileSrc: (src: string) => src,
    };

    // Mock @tauri-apps/api/event listen function
    // The event module uses __TAURI_INTERNALS__.invoke with 'plugin:event|listen'
    const originalInternals = (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ as Record<string, unknown>;
    const originalInvoke = originalInternals.invoke as Function;
    originalInternals.invoke = async (cmd: string, args?: unknown, options?: unknown) => {
      if (cmd === 'plugin:event|listen') return 1; // Return event handler ID
      if (cmd === 'plugin:event|unlisten') return null;
      if (cmd === 'plugin:event|emit') return null;
      return originalInvoke(cmd, args, options);
    };
  });
}

// Extended test fixtures type
type TestFixtures = {
  editorPage: EditorPage;
  previewPage: PreviewPage;
  settingsPage: SettingsPage;
  fileDialogPage: FileDialogPage;
  pageFactory: PageObjectFactory;
  appPage: Page;
};

/**
 * Extended test with page object fixtures and Tauri mocks
 */
export const test = base.extend<TestFixtures>({
  appPage: async ({ page }, use) => {
    // Inject Tauri mocks before the app loads
    await injectTauriMocks(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Wait for the app to initialize
    await page.waitForTimeout(500);
    // Create a new tab by dispatching keyboard event (Ctrl+N / Cmd+N)
    // The app's useKeyboardShortcuts listens on document for keydown
    await page.evaluate(() => {
      // Dispatch both Ctrl+N and Meta+N to handle both platforms
      ['ctrlKey', 'metaKey'].forEach(modifier => {
        const event = new KeyboardEvent('keydown', {
          key: 'n',
          code: 'KeyN',
          [modifier]: true,
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(event);
      });
    });
    // Wait for the editor to appear
    await page.locator('.cm-editor').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      // If editor doesn't appear, the tab may not have been created
      console.warn('Editor not visible after tab creation attempt');
    });
    await use(page);
  },

  editorPage: async ({ appPage }, use) => {
    const editorPage = new EditorPage(appPage);
    await use(editorPage);
  },

  previewPage: async ({ appPage }, use) => {
    const previewPage = new PreviewPage(appPage);
    await use(previewPage);
  },

  settingsPage: async ({ appPage }, use) => {
    const settingsPage = new SettingsPage(appPage);
    await use(settingsPage);
  },

  fileDialogPage: async ({ appPage }, use) => {
    const fileDialogPage = new FileDialogPage(appPage);
    await use(fileDialogPage);
  },

  pageFactory: async ({ appPage }, use) => {
    const factory = new PageObjectFactory(appPage);
    await use(factory);
  },
});

export { expect } from '@playwright/test';
