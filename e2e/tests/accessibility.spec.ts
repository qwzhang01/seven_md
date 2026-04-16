import { test } from '../fixtures';
import { runA11yAudit } from '../helpers/a11y';

/**
 * Accessibility audit tests using axe-core.
 *
 * These tests run WCAG 2.1 AA checks on the main application window.
 * The .cm-editor subtree is excluded (see e2e/helpers/a11y.ts for rationale).
 *
 * Any axe violation will cause the test to fail, blocking the PR.
 */
test.describe('Accessibility - Main Window', () => {
  test('7.1 main window passes WCAG 2.1 AA audit (initial state)', async ({ appPage }) => {
    await runA11yAudit(appPage);
  });

  test('7.2 main window passes WCAG 2.1 AA audit with sidebar open', async ({ appPage }) => {
    // Ensure sidebar is visible (default state)
    await appPage.waitForSelector('[role="complementary"]', { state: 'visible' });
    await runA11yAudit(appPage);
  });

  test('7.3 main window passes WCAG 2.1 AA audit with editor focused', async ({ editorPage, appPage }) => {
    await editorPage.waitForEditor();
    await editorPage.focusEditor();
    // Audit the app shell (excluding the editor internals via shared config)
    await runA11yAudit(appPage);
  });

  test('7.4 status bar passes WCAG 2.1 AA audit', async ({ appPage }) => {
    await appPage.waitForSelector('[role="status"]', { state: 'visible' });
    await runA11yAudit(appPage, '[role="status"]');
  });

  test('7.5 toolbar region passes WCAG 2.1 AA audit', async ({ appPage }) => {
    await appPage.waitForSelector('[role="toolbar"]', { state: 'visible' });
    await runA11yAudit(appPage, '[role="toolbar"]');
  });
});
