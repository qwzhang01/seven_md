## ADDED Requirements

### Requirement: Preview pane renders Markdown in real-time
The system SHALL display a rendered preview of the current document's Markdown content alongside the editor.

#### Scenario: Preview updates as user types
- **WHEN** user makes changes in the editor
- **THEN** the preview pane SHALL update within 100ms to reflect those changes
- **AND** the preview SHALL show the fully rendered HTML output of the Markdown

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
  - Links (with click interception — internal .md links open as tabs, external links open in system browser, anchor links scroll within preview) and images
  - Math expressions (LaTeX via KaTeX)
  - Mermaid diagrams (fenced blocks tagged `mermaid`)

### Requirement: Preview pane intercepts link clicks with smart navigation
The system SHALL intercept all link clicks in the preview pane to prevent WebView navigation and provide intelligent link handling.

#### Scenario: Internal Markdown link opens in new tab
- **WHEN** user clicks a link to a `.md` file (e.g., `./other.md`, `../docs/readme.md`)
- **THEN** the system SHALL resolve the relative path against the current file's directory
- **AND** the resolved file SHALL be opened in a new editor tab via `openFileByPath`
- **AND** if the file cannot be found, a warning notification SHALL be displayed

#### Scenario: External link opens in system browser
- **WHEN** user clicks a link starting with `http://` or `https://`
- **THEN** the system SHALL invoke the `open_external_url` Rust command
- **AND** the link SHALL open in the user's system default browser
- **AND** the preview pane SHALL NOT navigate away from the current content

#### Scenario: Anchor link scrolls within preview
- **WHEN** user clicks a link starting with `#` (e.g., `#heading-title`)
- **THEN** the preview pane SHALL smooth-scroll to the element with the matching `id`
- **AND** no new tab SHALL be created

#### Scenario: Link type classification
- **WHEN** a link is clicked
- **THEN** the system SHALL classify it using `classifyLink()` into one of: `anchor`, `external`, `internal-md`, `unknown`
- **AND** dispatch the appropriate handler based on the classification

### Requirement: Preview pane has header toolbar
The system SHALL provide a toolbar at the top of the preview pane.

#### Scenario: Preview header layout
- **WHEN** the preview pane is visible
- **THEN** a header bar SHALL be displayed at the top containing:
  - Left side: "预览" label
  - Right side: "在新窗口打开" button

#### Scenario: Open preview in new window
- **WHEN** user clicks "在新窗口打开" in the preview header
- **THEN** the current document's rendered preview SHALL open in a new browser/native window
- **AND** the new window SHALL show only the preview content (no editor controls)

### Requirement: Preview pane scrolls independently
The system SHALL allow independent scrolling of the preview pane.

#### Scenario: Independent scroll
- **WHEN** the user scrolls within the preview pane
- **THEN** only the preview content SHALL scroll
- **AND** the editor scroll position SHALL remain unchanged

#### Scenario: Optional synchronized scrolling (future)
- **WHEN** synchronized scrolling is enabled (future feature toggle)
- **THEN** scrolling in the editor SHALL cause the preview to scroll to approximately the same position

### Requirement: Preview pane shows right-click context menu
The system SHALL display a context menu when right-clicking in the preview area.

#### Scenario: Preview context menu
- **WHEN** user right-clicks in the preview area
- **THEN** the same context menu as the editor SHALL appear
- **AND** actions like copy, select all, etc., shall work on the preview's underlying content
