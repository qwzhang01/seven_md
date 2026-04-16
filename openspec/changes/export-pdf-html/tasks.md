## 1. Rust Backend — Export Commands

- [x] 1.1 Add `export_html` command to `src-tauri/src/commands.rs` that accepts an HTML string and a suggested file name, opens a native save-file dialog (`.html` filter), and writes the file to the chosen path
- [x] 1.2 Register `export_html` in the `invoke_handler` macro in `src-tauri/src/main.rs`
- [x] 1.3 Add native "Export" submenu to the Tauri menu in `src-tauri/src/main.rs` with "Export as PDF" and "Export as HTML" items
- [x] 1.4 Emit `menu-export-pdf` and `menu-export-html` events in the `on_menu_event` handler in `src-tauri/src/main.rs`
- [x] 1.5 Write Rust unit tests for `export_html` command (valid path, cancelled dialog, write permission error)

## 2. Frontend — Export Utilities

- [x] 2.1 Create `src/utils/exportUtils.ts` with a `serializePreviewToHtml(markdown: string, title: string): string` function
- [x] 2.2 Implement CSS collection logic in `serializePreviewToHtml`: query all `<style>` and `<link rel="stylesheet">` elements from `document.head` and inline them as `<style>` blocks
- [x] 2.3 Render the Markdown to an HTML string using the same `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex` + `rehype-highlight` pipeline (use `renderToStaticMarkup`)
- [x] 2.4 Assemble the final HTML document with `<!DOCTYPE html>`, `<meta charset="UTF-8">`, `<meta name="viewport">`, `<title>`, inlined `<style>`, and the rendered body content
- [x] 2.5 Add a `extractDocumentTitle(markdown: string, fallback: string): string` utility that returns the first `# heading` text or the fallback
- [x] 2.6 Add a `deriveExportFileName(filePath: string | null, extension: 'pdf' | 'html'): string` utility that returns `<basename>.<ext>` or `Untitled.<ext>`
- [x] 2.7 Write unit tests for `serializePreviewToHtml`, `extractDocumentTitle`, and `deriveExportFileName` in `src/utils/exportUtils.test.ts`

## 3. Frontend — `useExport` Hook

- [x] 3.1 Create `src/hooks/useExport.ts` hook that exposes `exportPdf()`, `exportHtml()`, `isExporting: boolean`, and `exportError: string | null`
- [x] 3.2 Implement `exportHtml()`: call `serializePreviewToHtml`, invoke the `export_html` Tauri command, handle success/cancel/error states
- [x] 3.3 Implement `exportPdf()`: call `deriveExportFileName` for the suggested name, then invoke `WebviewWindow.getCurrent().print()` (Tauri v2 WebviewWindow print API)
- [x] 3.4 On export success, dispatch a status bar message event (transient, 4-second auto-clear) with the exported file path
- [x] 3.5 On export error, dispatch a status bar error message event
- [x] 3.6 Guard both export functions: if no document is open or content is empty, return early without triggering any dialog
- [x] 3.7 Write unit tests for `useExport` hook covering: successful HTML export, successful PDF export, cancelled dialog, error handling, empty document guard

## 4. Frontend — Menu Integration

- [x] 4.1 Add `Export as PDF` and `Export as HTML` items to `src/components/MenuBar/FileMenu.tsx` inside a new Export submenu section (between Save As and Recent Files separators)
- [x] 4.2 Wire both items to `exportPdf()` and `exportHtml()` from `useExport` hook
- [x] 4.3 Disable both export menu items when `currentFilePath` is null and content is empty
- [x] 4.4 Add export shortcut labels (`⌘⇧P` / `⌘⇧E`) to the menu item display
- [x] 4.5 Add i18n translation keys: `menu.exportAsPdf`, `menu.exportAsHtml`, `menu.export` in all locale files (`src/i18n/`)
- [x] 4.6 Listen for `menu-export-pdf` and `menu-export-html` Tauri events in `FileMenu.tsx` (or in `useExport`) to handle native menu triggers

## 5. Frontend — Keyboard Shortcuts

- [x] 5.1 Register `⌘⇧P` / `Ctrl+Shift+P` shortcut in `src/hooks/useKeyboardShortcuts.ts` to call `exportPdf()`
- [x] 5.2 Register `⌘⇧E` / `Ctrl+Shift+E` shortcut in `src/hooks/useKeyboardShortcuts.ts` to call `exportHtml()`
- [x] 5.3 Verify no conflict with existing shortcuts (audit `useKeyboardShortcuts.ts` and `src-tauri/src/main.rs` menu shortcuts)
- [x] 5.4 Update keyboard shortcuts help documentation / modal to include the two new export shortcuts
- [x] 5.5 Write unit tests for the new shortcut registrations in `src/hooks/useKeyboardShortcuts.test.ts`

## 6. Print Styles

- [x] 6.1 Add `@media print` CSS rules to `src/index.css` (or a dedicated `src/styles/print.css`): force light background, hide sidebar/toolbar/editor pane, prevent code block page-break mid-line
- [x] 6.2 Ensure KaTeX and highlight.js styles are included in the `@media print` scope (verify they are not excluded by existing media queries)
- [ ] 6.3 Manually test PDF output on macOS: verify tables, code blocks, and math render correctly in the generated PDF

## 7. Status Bar Integration

- [x] 7.1 Verify the status bar component (`src/components/StatusBar/`) supports transient message display with auto-clear; add this capability if not present
- [x] 7.2 Connect `useExport` success/error messages to the status bar transient message API
- [x] 7.3 Add i18n keys for export status messages: `export.successHtml`, `export.successPdf`, `export.error`, `export.cancelled`

## 8. Testing

- [x] 8.1 Write E2E test: open a Markdown file → File menu → Export as HTML → verify `.html` file is created and contains expected content
- [x] 8.2 Write E2E test: open a Markdown file → keyboard shortcut `⌘⇧E` → verify HTML export dialog appears
- [x] 8.3 Write E2E test: verify Export menu items are disabled when no document is open
- [x] 8.4 Write E2E test: verify status bar shows success message after HTML export
- [x] 8.5 Write integration test: `serializePreviewToHtml` output is valid HTML with inlined styles and correct `<title>`
- [x] 8.6 Run full unit test suite (`vitest run`) and fix any regressions
- [x] 8.7 Run E2E test suite (`playwright test`) and fix any regressions

## 9. Polish and Documentation

- [ ] 9.1 Test export on Windows (verify `Ctrl+Shift+P` / `Ctrl+Shift+E` shortcuts and native dialogs work)
- [ ] 9.2 Test export on Linux
- [ ] 9.3 Verify exported HTML opens correctly in Chrome, Firefox, and Safari
- [x] 9.4 Add inline code comments to `exportUtils.ts` and `useExport.ts` explaining the CSS inlining strategy
- [x] 9.5 Update `docs/API-REFERENCE.md` with `useExport` hook API documentation
