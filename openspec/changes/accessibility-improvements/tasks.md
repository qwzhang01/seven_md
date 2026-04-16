## 1. Dependencies & Setup

- [x] 1.1 Install `@axe-core/playwright` as a dev dependency
- [x] 1.2 Create `tests/helpers/a11y.ts` with shared axe configuration (wcag2a + wcag2aa rules, `.cm-editor` exclusion)
- [x] 1.3 Document the axe exclusion rule and rationale in `tests/helpers/a11y.ts`

## 2. Color Contrast Fixes

- [x] 2.1 Audit all CSS custom properties in the theme token file and list combinations that fail WCAG 2.1 AA
- [x] 2.2 Rename raw-value token names to semantic names (e.g., `--color-text-primary`, `--color-bg-surface`)
- [x] 2.3 Adjust lightness of failing color tokens to meet 4.5:1 (normal text) and 3:1 (large text / UI) thresholds
- [x] 2.4 Verify toolbar foreground/background contrast passes 4.5:1
- [x] 2.5 Verify status bar foreground/background contrast passes 4.5:1
- [x] 2.6 Verify sidebar text and icon contrast passes 4.5:1
- [x] 2.7 Verify editor gutter text contrast passes 4.5:1
- [x] 2.8 Verify focus indicator contrast passes 3:1 against adjacent background

## 3. axe-core Automated Auditing

- [x] 3.1 Add `checkA11y()` call to the main window Playwright test using the shared axe config
- [x] 3.2 Add `checkA11y()` call to any additional page-level Playwright tests (e.g., settings, dialogs)
- [ ] 3.3 Confirm CI test job fails when a deliberate axe violation is introduced (smoke test the integration)
- [x] 3.4 Update `playwright.config.ts` if needed to ensure the accessibility test job is included in the required checks

## 4. Screen Reader Support (ARIA)

- [x] 4.1 Add `role="toolbar"` and `aria-label="Toolbar"` to the toolbar container component
- [x] 4.2 Add `role="navigation"` and `aria-label="File Explorer"` to the sidebar container component
- [x] 4.3 Add `role="main"` and `aria-label="Editor"` to the editor area container component
- [x] 4.4 Add `role="status"` and `aria-live="polite"` to the status bar container component
- [x] 4.5 Add `aria-label` to all icon-only buttons (toolbar actions, sidebar controls)
- [x] 4.6 Add `aria-pressed` state to all toggle buttons (sidebar toggle, preview toggle)
- [x] 4.7 Add `role="alert"` or `aria-live="assertive"` to error/warning notification components
- [x] 4.8 Ensure all form inputs (e.g., search, rename) have associated `<label>` or `aria-label`
- [ ] 4.9 Verify tab order matches visual layout (top-to-bottom, left-to-right) using keyboard-only navigation
- [ ] 4.10 Verify modal dialogs trap focus and return focus to trigger element on close

## 5. Missing Keyboard Shortcuts

- [x] 5.1 Wire `Cmd+O` / `Ctrl+O` to the Open File dialog in the global shortcut handler
- [x] 5.2 Wire `Cmd+S` / `Ctrl+S` to the save-current-file action in the global shortcut handler
- [x] 5.3 Confirm intended behavior of `Cmd+[` with product (navigate back vs. outdent) — resolve open question from design.md
- [x] 5.4 Wire `Cmd+[` / `Ctrl+[` to the confirmed action in the global shortcut handler
- [ ] 5.5 Test that `Cmd+[` does not conflict with Electron's built-in back-navigation on macOS and Linux

## 6. Testing & Verification

- [ ] 6.1 Run the full Playwright test suite and confirm zero axe violations
- [ ] 6.2 Manually test VoiceOver navigation through toolbar, sidebar, editor, and status bar on macOS
- [ ] 6.3 Verify VoiceOver announces status bar updates when word count or save status changes
- [ ] 6.4 Verify VoiceOver announces error notifications immediately
- [ ] 6.5 Manually test all three new keyboard shortcuts (`Cmd+O`, `Cmd+S`, `Cmd+[`) on macOS
- [ ] 6.6 Manually test all three new keyboard shortcuts (`Ctrl+O`, `Ctrl+S`, `Ctrl+[`) on Linux
- [ ] 6.7 Run a contrast ratio audit tool (e.g., browser DevTools accessibility panel) to confirm all tokens pass
