import { AxeBuilder } from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Shared axe-core configuration for accessibility auditing.
 *
 * Rules: wcag2a + wcag2aa (WCAG 2.1 Level AA)
 *
 * Exclusions:
 * - `.cm-editor`: CodeMirror manages its own ARIA patterns
 * - `aria-required-children`: Known issue with role="tree" containing role="status"
 * - `color-contrast`: Known issue with app name color in light mode
 */
export const AXE_TAGS = ['wcag2a', 'wcag2aa'];
export const AXE_EXCLUDE = ['.cm-editor'];

// Known violations to disable until fixed in the app
export const KNOWN_VIOLATIONS = [
  'aria-required-children', // role="tree" contains role="status" - needs app fix
  'color-contrast',         // App name color contrast - needs app fix
];

/**
 * Run an accessibility audit on the page using axe-core.
 *
 * @param page - Playwright Page object
 * @param context - Optional CSS selector to scope the audit (defaults to full page)
 */
export async function runA11yAudit(page: Page, context?: string): Promise<void> {
  let builder = new AxeBuilder({ page })
    .withTags(AXE_TAGS)
    .exclude(AXE_EXCLUDE)
    .disableRules(KNOWN_VIOLATIONS);

  if (context) {
    builder = builder.include(context);
  }

  const results = await builder.analyze();
  expect(results.violations).toEqual([]);
}
