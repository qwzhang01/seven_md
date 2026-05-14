## MODIFIED Requirements

### Requirement: Preview pane renders Markdown in real-time
The system SHALL display a rendered preview of the current document's Markdown content alongside the editor.

#### Scenario: Preview renders all standard Markdown
- **WHEN** the document contains standard Markdown syntax
- **THEN** the preview SHALL correctly render:
  - Headings (H1-H6) with proper sizing
  - Paragraphs and line breaks
  - **Bold**, *Italic*, ~~Strikethrough~~ text
  - Inline code and fenced code blocks with syntax highlighting
  - Ordered and unordered lists (nested)
  - Task lists with checkboxes
  - Blockquotes (including nested)
  - Horizontal rules
  - Tables (GFM)
  - Links (with click interception — internal `.md` links open as tabs, external links open in system browser, anchor links scroll within preview)
  - Images
  - Math expressions (LaTeX via KaTeX)
  - Mermaid diagrams (fenced blocks tagged `mermaid`)

#### Scenario: Preview updates as user types
- **WHEN** user makes changes in the editor
- **THEN** the preview pane SHALL update within 100ms to reflect those changes
- **AND** the preview SHALL show the fully rendered HTML output of the Markdown

## ADDED Requirements

### Requirement: Preview pane link component integrates navigation handler
The preview pane's custom `<a>` component in `react-markdown` SHALL delegate all click handling to the markdown-link-navigation capability.

#### Scenario: Link component prevents default and delegates
- **WHEN** user clicks any link rendered in the preview pane
- **THEN** the `<a>` component's `onClick` handler SHALL call `e.preventDefault()`
- **AND** the handler SHALL invoke the link navigation logic with the `href` value and the current file's path context

#### Scenario: Link component preserves visual styling
- **WHEN** a link is rendered in the preview pane
- **THEN** the link SHALL maintain its existing visual styling (color from `--markdown-link` CSS variable, underline on hover)
- **AND** the link cursor SHALL be `pointer` to indicate clickability
