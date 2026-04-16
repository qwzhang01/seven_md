## Why

Seven MD currently has no export capability — users can only read and edit Markdown files in-app. Industry-standard Markdown editors (Typora, Obsidian, VS Code) all provide PDF and HTML export as a core workflow feature. Without it, Seven MD is a dead end for users who need to share or publish their documents.

## What Changes

- Add **Export to PDF** command that renders the current document as a styled PDF file using Tauri's WebView print API (or a Rust-side headless renderer).
- Add **Export to HTML** command that serializes the current rendered preview (with embedded CSS) to a standalone `.html` file.
- Add an **Export submenu** under the File menu (both native Tauri menu and the React MenuBar component).
- Add two new Tauri commands: `export_pdf` and `export_html` in the Rust backend.
- Add a new `useExport` hook in the frontend to orchestrate export actions and surface progress/error feedback.
- Add export keyboard shortcuts: `⌘⇧E` for HTML export, `⌘⇧P` for PDF export.
- Add export progress/status feedback in the status bar or a toast notification.

## Capabilities

### New Capabilities

- `export-pdf`: Export the current Markdown document to a PDF file with the same visual styling as the in-app preview (GFM tables, syntax highlighting, math via KaTeX).
- `export-html`: Export the current Markdown document to a self-contained HTML file with all CSS inlined or bundled, suitable for sharing without any external dependencies.

### Modified Capabilities

- `menubar`: Add Export submenu items to the File menu (both React component and native Tauri menu registration in `main.rs`).
- `keyboard-shortcuts`: Register `⌘⇧E` (HTML export) and `⌘⇧P` (PDF export) shortcuts.

## Impact

- **Frontend**: New `src/hooks/useExport.ts` hook; updates to `src/components/MenuBar/FileMenu.tsx`; updates to `src/hooks/useKeyboardShortcuts.ts`; new `src/utils/exportUtils.ts` for HTML serialization.
- **Backend (Rust)**: New `export_pdf` and `export_html` Tauri commands in `src-tauri/src/commands.rs`; `main.rs` updated to register commands and native menu items. PDF generation will use `tauri-plugin-dialog` for save-file dialog and the WebView `print` API (via `tauri::WebviewWindow::print`) or a crate like `headless_chrome` / `wkhtmltopdf` binding.
- **Dependencies**: Potentially add `tauri-plugin-shell` or a PDF crate (e.g., `printpdf`) to `Cargo.toml`; no new npm packages required (HTML export uses existing `react-markdown` + `rehype` pipeline output).
- **i18n**: New translation keys for export menu labels and error/success messages.
- **Tests**: New unit tests for `useExport` hook and `exportUtils`; new E2E tests for export workflows.
