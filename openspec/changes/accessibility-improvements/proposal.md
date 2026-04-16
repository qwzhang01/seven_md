## Why

The application currently has significant accessibility gaps that prevent users with disabilities from effectively using the product. Color contrast ratios fail WCAG standards, screen readers cannot navigate the UI, keyboard-only users are blocked by missing shortcuts, and no automated accessibility auditing exists in the test suite — making regressions invisible.

## What Changes

- Audit and fix all color contrast ratios to meet WCAG 2.1 AA (minimum 4.5:1 for normal text, 3:1 for large text)
- Integrate axe-core into the Playwright test suite for automated accessibility auditing on every test run
- Add ARIA roles, labels, and live regions to support VoiceOver and other screen readers
- Implement missing keyboard shortcuts: `Cmd+O` (open file), `Cmd+S` (save file), `Cmd+[` (navigate back / outdent)

## Capabilities

### New Capabilities
- `color-contrast`: Defines contrast ratio requirements for all UI color tokens and components, ensuring WCAG 2.1 AA compliance
- `axe-core-audit`: Automated accessibility auditing integrated into the Playwright test suite using axe-core
- `screen-reader-support`: ARIA roles, labels, landmarks, and live regions enabling full VoiceOver / NVDA navigation

### Modified Capabilities
- `keyboard-shortcuts`: Add missing shortcuts `Cmd+O`, `Cmd+S`, and `Cmd+[` that are specified in the spec but not yet implemented

## Impact

- **UI components**: All components with hardcoded or theme colors need contrast review (`src/components/`, `src/styles/`)
- **Theme tokens**: Color palette in theme configuration must be updated to pass contrast checks
- **Test suite**: Playwright config and test helpers updated to run axe-core audits (`playwright.config.ts`, `tests/`)
- **Keyboard handler**: Global shortcut registration in the main process / renderer needs `Cmd+O`, `Cmd+S`, `Cmd+[` added
- **Dependencies**: `axe-core` and `@axe-core/playwright` added as dev dependencies
- **No breaking changes** to existing public APIs or file formats
