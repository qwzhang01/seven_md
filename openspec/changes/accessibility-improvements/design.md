## Context

The application is an Electron-based Markdown editor. Accessibility has not been a first-class concern: color tokens were chosen for aesthetics, ARIA attributes are sparse, and the keyboard shortcut handler has gaps. Three categories of issues exist:

1. **Visual**: Color contrast ratios below WCAG 2.1 AA thresholds in several UI areas (toolbar, status bar, sidebar, editor gutter).
2. **Automated testing**: No accessibility auditing in CI — regressions go undetected.
3. **Interaction**: Screen readers cannot navigate the app meaningfully; three keyboard shortcuts (`Cmd+O`, `Cmd+S`, `Cmd+[`) are specified but not wired up.

Stakeholders: all users, with particular impact on users with low vision, motor impairments, and screen-reader users.

## Goals / Non-Goals

**Goals:**
- All UI color combinations pass WCAG 2.1 AA contrast (4.5:1 normal text, 3:1 large/UI text)
- axe-core runs automatically in Playwright tests and fails the suite on new violations
- VoiceOver can navigate the main application regions (toolbar, sidebar, editor, status bar) and announce dynamic content changes
- `Cmd+O`, `Cmd+S`, and `Cmd+[` shortcuts are functional

**Non-Goals:**
- WCAG 2.1 AAA compliance (triple-A) — out of scope for this iteration
- Full NVDA / JAWS testing on Windows — VoiceOver (macOS) is the primary target
- Accessibility of third-party CodeMirror internals beyond what the editor exposes via its API
- Redesigning the visual theme or color palette beyond contrast fixes

## Decisions

### Decision 1: Use axe-core via `@axe-core/playwright` for automated auditing

**Chosen**: Inject `checkA11y()` from `@axe-core/playwright` into existing Playwright page-level tests.

**Alternatives considered**:
- `jest-axe` — requires JSDOM, not suitable for Electron renderer tests
- Manual Lighthouse CI — heavier setup, slower feedback loop, harder to scope to specific components

**Rationale**: `@axe-core/playwright` integrates directly with the existing Playwright infrastructure, runs in the real Electron renderer, and produces actionable violation reports with WCAG rule IDs.

### Decision 2: Fix contrast at the design-token level, not per-component

**Chosen**: Update CSS custom properties / theme tokens in the central theme file. Components consume tokens — no per-component color overrides needed.

**Alternatives considered**:
- Override colors inline per component — leads to drift and makes future theme changes harder.

**Rationale**: Single source of truth; all components automatically inherit the fix.

### Decision 3: ARIA landmarks + `aria-label` for screen reader support

**Chosen**: Add `role` attributes and `aria-label` / `aria-labelledby` to major layout regions. Use `aria-live="polite"` for status bar updates.

**Alternatives considered**:
- Full ARIA widget patterns (e.g., `role="application"`) — overly complex for a document editor; native HTML semantics + landmarks are sufficient.

**Rationale**: Landmarks give screen reader users a navigation map without requiring complex ARIA widget management.

### Decision 4: Wire missing shortcuts in the existing global shortcut handler

**Chosen**: Add `Cmd+O`, `Cmd+S`, `Cmd+[` to the existing keyboard event handler (renderer process) alongside the already-working shortcuts.

**Rationale**: Consistent with the current architecture; no new infrastructure needed.

## Risks / Trade-offs

- **[Risk] axe-core false positives from CodeMirror internals** → Mitigation: Scope axe audits to the application shell (exclude the `.cm-editor` subtree) and document the exclusion rule.
- **[Risk] Contrast fixes alter the visual design** → Mitigation: Review updated tokens with design before merging; changes are limited to lightness adjustments on existing hues.
- **[Risk] `Cmd+[` conflicts with browser/Electron back-navigation** → Mitigation: Intercept the event in the renderer before it bubbles; test on macOS and Linux.
- **[Risk] ARIA live regions cause excessive announcements** → Mitigation: Use `aria-live="polite"` (not `assertive`) and debounce status bar updates.

## Migration Plan

1. Install `@axe-core/playwright` as a dev dependency.
2. Update theme tokens — no user-facing migration needed (CSS-only change).
3. Add ARIA attributes to layout components — no API or file-format changes.
4. Register new keyboard shortcuts — additive change, no existing shortcuts removed.
5. Rollback: all changes are isolated to renderer code and test helpers; revert the PR to restore previous state.

## Open Questions

- Should `Cmd+[` trigger "navigate back in history" (like a browser) or "outdent list item"? The proposal lists it as a navigation shortcut — confirm intent with product before implementing.
- Are there additional color tokens used only in dark mode that also need contrast review?
