## MODIFIED Requirements

### Requirement: Preview renders all standard Markdown
The system SHALL correctly render all standard Markdown syntax elements in the preview pane.

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
  - Links (clickable) and images
  - Math expressions (LaTeX via KaTeX)
  - Mermaid diagrams (fenced blocks tagged `mermaid`)
