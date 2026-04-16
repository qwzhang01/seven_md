## Context

Seven MD is a Tauri v2 + React 19 desktop app. The frontend renders Markdown via `react-markdown` with `remark-gfm`, `remark-math`, `rehype-katex`, and `rehype-highlight`. The preview pane (`PreviewPane.tsx`) produces a fully-rendered HTML DOM at runtime. The Rust backend currently exposes only `read_file`, `save_file`, and `read_directory` commands.

There is no existing export infrastructure. The Tauri WebView (WebKit on macOS, WebView2 on Windows) provides a `print()` API that can produce PDFs natively. The frontend already has all the rendered HTML needed for HTML export.

**Constraints:**
- Must work on macOS (primary), Windows, and Linux.
- No new heavy npm dependencies (bundle size matters for a desktop app).
- PDF output must faithfully reproduce the preview styles (syntax highlighting, KaTeX math, GFM tables).
- HTML output must be self-contained (no external CDN links) so it can be shared as a single file.

## Goals / Non-Goals

**Goals:**
- Export the current document to PDF via a native save-file dialog.
- Export the current document to a standalone HTML file via a native save-file dialog.
- Surface export actions in the File menu (React MenuBar + native Tauri menu).
- Register `⌘⇧P` (PDF) and `⌘⇧E` (HTML) keyboard shortcuts.
- Show success/error feedback after export.

**Non-Goals:**
- Custom PDF page size / margin configuration (v1 uses system defaults).
- Batch export of multiple files.
- Export to DOCX, EPUB, or other formats.
- Print preview UI (the existing preview pane serves this purpose).
- Pandoc integration (adds a system dependency).

## Decisions

### Decision 1: PDF via Tauri WebView `print()` API

**Choice:** Use `tauri::WebviewWindow::print()` (Tauri v2 built-in) to trigger the OS print dialog with "Save as PDF" as the default destination.

**Rationale:** Zero additional dependencies; leverages the same rendering engine that powers the preview pane, so output is pixel-perfect. The OS print dialog handles page size, margins, and orientation natively.

**Alternatives considered:**
- **`printpdf` crate (pure Rust):** Would require re-implementing the full HTML→PDF rendering pipeline (CSS, math, code highlighting). Enormous scope, fragile.
- **`headless_chrome` / `chromium` binding:** Requires bundling or installing Chromium — unacceptable for a lightweight desktop app.
- **`wkhtmltopdf` system binary:** External system dependency, not available on all platforms without manual install.

**Trade-off:** The OS print dialog appears before the file is saved (user must click "Save" in the dialog). This is acceptable UX for v1 and matches how VS Code handles PDF export on some platforms.

### Decision 2: HTML export via frontend serialization + Rust file write

**Choice:** The frontend (`exportUtils.ts`) serializes the rendered preview DOM to an HTML string, inlines all required CSS (KaTeX, highlight.js, app styles), and passes the string to a new `export_html` Tauri command that writes it to disk via a save-file dialog.

**Rationale:** The frontend already has the fully-rendered DOM and knows which stylesheets are active (theme, KaTeX, highlight.js). Inlining CSS on the frontend avoids the Rust side needing to know about asset paths. The Rust command is a thin file-writer.

**Alternatives considered:**
- **Rust-side HTML generation (re-render Markdown in Rust):** Would require a Rust Markdown parser + CSS bundler. Duplicates the frontend rendering logic and risks style drift.
- **Save the raw `.html` from the WebView via `webview.html()`:** Tauri v2 does not expose a stable API to capture the full rendered HTML of a specific DOM subtree from Rust.

**CSS inlining strategy:** Use `document.querySelectorAll('style, link[rel="stylesheet"]')` to collect all active stylesheets, then prepend them as `<style>` blocks in the exported HTML. This captures Tailwind utilities, KaTeX, and highlight.js without any build-time bundling step.

### Decision 3: `useExport` hook owns all export orchestration

**Choice:** A single `useExport` hook encapsulates both export actions, loading state, and error handling. Components (FileMenu, keyboard shortcut handler) call `exportPdf()` and `exportHtml()` from this hook.

**Rationale:** Keeps export logic out of UI components; makes the hook independently testable; consistent with the existing pattern (`useFileOperations`, `useRecentFiles`).

### Decision 4: Feedback via status bar message (not a toast)

**Choice:** On export success/failure, update the status bar with a transient message (e.g., "Exported to ~/Desktop/doc.html") that auto-clears after 4 seconds.

**Rationale:** The app already has a status bar. Adding a separate toast library is unnecessary. Matches the lightweight feedback pattern used for save operations.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `WebviewWindow::print()` behavior differs across OS (macOS shows print panel, Windows shows print dialog) | Document the UX difference; v1 accepts OS-native behavior |
| CSS inlining may miss dynamically injected styles (e.g., CodeMirror editor styles leaking into preview) | Scope the CSS collection to the `<head>` only; preview pane uses its own stylesheet scope |
| Large documents with many images (base64 or external URLs) may produce very large HTML files | Add a warning in the status bar if exported HTML exceeds 10 MB; out-of-scope for v1 to embed images |
| KaTeX fonts are loaded from a CDN in some configurations | Audit the KaTeX CSS import path; if fonts are bundled (they are via the npm package), they will be inlined as data URIs |
| `⌘⇧P` conflicts with "Print" on macOS system level | Tauri intercepts shortcuts before the OS; test on macOS to confirm no conflict |

## Migration Plan

1. Add `export_html` Tauri command to `src-tauri/src/commands.rs`.
2. Register `export_html` in `invoke_handler` in `main.rs`; add native menu items for Export submenu.
3. Create `src/utils/exportUtils.ts` with `serializePreviewToHtml()`.
4. Create `src/hooks/useExport.ts`.
5. Update `FileMenu.tsx` to add Export submenu.
6. Update `useKeyboardShortcuts.ts` to register `⌘⇧P` and `⌘⇧E`.
7. Update i18n translation files with new keys.
8. Write unit tests for `useExport` and `exportUtils`.
9. Write E2E tests for both export flows.

**Rollback:** All changes are additive (new commands, new hook, new menu items). Removing the feature requires reverting the above files; no data migration needed.

## Open Questions

1. **PDF file naming:** Should the default save-file name be derived from the document title (first `# heading`) or the file name? → Propose: use file name if saved, "Untitled" otherwise.
2. **Image embedding in HTML export:** Should linked images (`![](./image.png)`) be base64-embedded in the HTML output? → Defer to v2; v1 exports with original `src` paths intact.
3. **Theme in PDF:** Should PDF always use the light theme (for print readability) or respect the current app theme? → Propose: always use light theme for PDF (add a `@media print` CSS override).
