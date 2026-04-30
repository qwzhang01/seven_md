## Why

seven_md currently renders standard Markdown, GFM tables, and LaTeX math in the preview pane, but has no support for Mermaid diagrams. Technical writers and developers increasingly embed Mermaid code blocks (flowcharts, sequence diagrams, ER diagrams, etc.) in their Markdown documents, and without rendering support these blocks appear as raw text, degrading the preview experience.

## What Changes

- **New**: The preview pane renders fenced code blocks tagged ` ```mermaid ` as interactive SVG diagrams instead of raw code.
- **New**: Mermaid diagrams respect the active application theme (light / dark) so diagram colors match the editor UI.
- **New**: Syntax errors in a Mermaid block display a friendly inline error message rather than crashing the preview.
- The existing `preview-pane` capability's rendering list is extended to include Mermaid diagrams.

## Capabilities

### New Capabilities
- `mermaid-rendering`: Detect and render Mermaid fenced code blocks in the preview pane as SVG diagrams, with theme-aware styling and graceful error handling.

### Modified Capabilities
- `preview-pane`: Extend the "renders all standard Markdown" requirement to include Mermaid diagram blocks.

## Impact

- **Frontend**: `src/components/editor-v2/` preview renderer — add `mermaid` npm package, integrate rendering pipeline.
- **Dependencies**: Add `mermaid` (v10+) to `package.json`.
- **Theme system**: Read current theme token to pass `theme: 'default' | 'dark'` to Mermaid's `initialize()`.
- **No breaking changes**: Existing Markdown rendering is unaffected; only ` ```mermaid ` fenced blocks gain new behavior.
