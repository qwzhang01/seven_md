## Context

seven_md's preview pane (`src/components/editor-v2/PreviewPaneV2.tsx`) uses `react-markdown` with a plugin pipeline:

```
remark-gfm → remark-math → rehype-highlight → rehype-katex
```

Fenced code blocks are rendered via the `code` / `pre` component overrides. Currently, a ` ```mermaid ` block falls through to `rehype-highlight`, which treats it as unknown syntax and renders it as a styled `<pre><code>` block — no diagram is produced.

The app uses CSS variables (`var(--bg-primary)`, etc.) for theming. The active theme name is available from `useUIStore`.

## Goals / Non-Goals

**Goals:**
- Render ` ```mermaid ` fenced code blocks as SVG diagrams in the preview pane.
- Match diagram colors to the active application theme (light / dark).
- Show a friendly inline error message when Mermaid syntax is invalid.
- Keep the existing rendering pipeline for all other code blocks unchanged.

**Non-Goals:**
- Interactive diagram editing or live diagram syntax validation in the editor.
- Exporting Mermaid diagrams as standalone image files.
- Supporting Mermaid in the "open in new window" export (deferred — SVG is already embedded in the DOM so it will appear, but no extra work is done to guarantee it).
- Supporting every Mermaid diagram type beyond what `mermaid` v10+ ships by default.

## Decisions

### Decision 1: Use `mermaid` npm package directly (not a React wrapper)

**Chosen**: Import `mermaid` and call `mermaid.render(id, code)` inside a custom `code` component override in `ReactMarkdown`.

**Alternatives considered**:
- `react-mermaid2` / `@mermaid-js/react` — thin wrappers that add an extra dependency and lag behind the core `mermaid` release cycle. Not worth the indirection.
- Server-side rendering via a Tauri command — unnecessary complexity; Mermaid runs fine in the browser/WebView context.

**Rationale**: Direct usage gives full control over `initialize()` options (theme, security level) and avoids wrapper churn.

---

### Decision 2: Render inside a custom `pre` component override (not `code`)

**Chosen**: In the `components` prop of `<ReactMarkdown>`, intercept at the `pre` level using the hast `node` prop. Check if `node.children[0]` is a `code` element whose `className` includes `language-mermaid`, then extract the raw text and return `<MermaidBlock code={...} />`.

Also configure `rehype-highlight` with `plainText: ['mermaid']` so it skips mermaid blocks entirely, preserving the original `language-mermaid` className.

**Why not `code` override**: Returning a `<div>` (MermaidBlock) from the `code` override places it inside `<pre>`, which is invalid HTML (`<pre><div>` is not allowed). Browsers silently hoist the `<div>` out of the DOM tree, breaking the `containerRef` used by `mermaid.render()`.

**Why hast `node` prop**: In `react-markdown` v10, the `children` prop of `pre` is React elements, not hast nodes. Checking `child.props.className` is unreliable because `rehype-highlight` may transform classNames. The `node` prop exposes the raw hast tree, which is the authoritative source for `className` and text content.

**Alternatives considered**:
- A custom rehype plugin — more powerful but significantly more complex; overkill for a single language intercept.
- Pre-processing the markdown string before passing to `ReactMarkdown` — fragile string manipulation, hard to maintain.

**Rationale**: The `pre` override + hast node inspection is the minimal, correct change that avoids HTML structure violations and works reliably with react-markdown v10.

---

### Decision 3: Theme mapping via `useUIStore` theme name

**Chosen**: Read the current theme from `useUIStore` and map it to Mermaid's built-in themes:
- `dark` / `dark-*` themes → `mermaid` theme `'dark'`
- all others → `mermaid` theme `'default'`

Call `mermaid.initialize({ theme })` once when the theme changes (via `useEffect` in `MermaidBlock` or a top-level initializer).

**Alternatives considered**:
- Injecting custom CSS variables into Mermaid's `themeVariables` — possible but requires mapping every CSS variable, high maintenance cost.

**Rationale**: Mermaid's built-in `'default'` and `'dark'` themes are visually consistent with the app's light/dark modes with minimal effort.

---

### Decision 4: Error handling — inline error message

**Chosen**: Wrap `mermaid.render()` in a try/catch. On failure, render a styled `<div>` with a red border and the error message text instead of the diagram.

**Rationale**: Prevents a broken diagram from crashing the preview pane. The user sees actionable feedback without leaving the editor.

## Risks / Trade-offs

- **Bundle size**: `mermaid` v10 is ~2 MB minified. → Mitigate with dynamic `import('mermaid')` (lazy load on first mermaid block encountered) to avoid impacting initial load time.
- **WebView compatibility**: Mermaid uses `DOMParser` and SVG APIs. Tauri's WebView (WebKit/Chromium) supports both. → Low risk; no mitigation needed.
- **Re-render flicker**: `mermaid.render()` is async; the diagram slot may briefly show nothing. → Mitigate by showing a lightweight placeholder (e.g., the raw code in a `<pre>`) until the SVG is ready.
- **Unique IDs**: `mermaid.render()` requires a unique element ID per diagram. → Use a `useId()` hook (React 18) or a counter to generate stable IDs.

## Migration Plan

1. Add `mermaid` to `package.json` dependencies.
2. Create `src/components/editor-v2/MermaidBlock.tsx` — isolated component handling render + error state.
3. Modify `PreviewPaneV2.tsx` — add `language-mermaid` branch in the `code` component override.
4. Smoke-test with flowchart, sequence diagram, and ER diagram samples in both light and dark themes.
5. No data migration or rollback strategy needed — purely additive frontend change.

## Open Questions

- Should Mermaid diagrams also render in the "open in new window" popup? (The SVG is already in the DOM so it likely works, but the popup's inline `<style>` block may need Mermaid-specific CSS.) → Defer to a follow-up.
- Should we pin `mermaid` to a minor version to avoid unexpected diagram-type changes? → Yes, pin to `^10.x` in `package.json`.
