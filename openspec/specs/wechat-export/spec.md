## ADDED Requirements

### Requirement: Render Markdown to WeChat-compatible inline-style HTML
The system SHALL render the current editor's Markdown content into HTML with all CSS styles inlined into element `style` attributes, suitable for pasting into the WeChat Official Account editor.

#### Scenario: Basic Markdown rendering
- **WHEN** user opens the WeChat export panel with Markdown content in the editor
- **THEN** the preview area SHALL display rendered HTML with inline styles applied

#### Scenario: Heading styles applied
- **WHEN** Markdown contains headings (H1–H6)
- **THEN** each heading SHALL have font-size, font-weight, color, and margin styles inlined

#### Scenario: Code block rendering
- **WHEN** Markdown contains fenced code blocks
- **THEN** code blocks SHALL be rendered with syntax highlighting styles inlined (no external CSS class dependencies)

#### Scenario: Blockquote rendering
- **WHEN** Markdown contains blockquotes
- **THEN** blockquotes SHALL have border-left, padding, and color styles inlined

---

### Requirement: Theme selection
The system SHALL provide at least three built-in themes (default / grace / simple) that users can switch between before copying.

#### Scenario: Switch theme
- **WHEN** user selects a different theme from the theme selector
- **THEN** the preview SHALL update immediately to reflect the new theme's styles

#### Scenario: Default theme on open
- **WHEN** user opens the WeChat export panel for the first time
- **THEN** the "default" (经典) theme SHALL be pre-selected

---

### Requirement: Primary color customization
The system SHALL allow users to customize the primary color used in headings and decorative elements.

#### Scenario: Change primary color
- **WHEN** user picks a color via the color picker
- **THEN** all elements using `var(--md-primary-color)` SHALL update to the selected color in the preview

#### Scenario: CSS variable resolution
- **WHEN** the export HTML is generated
- **THEN** all `var(--md-primary-color)` references SHALL be replaced with the actual hex color value (no CSS variables in final output)

---

### Requirement: Copy to clipboard as rich text
The system SHALL copy the final inline-style HTML to the system clipboard as `text/html` MIME type so that pasting into the WeChat editor preserves all styles.

#### Scenario: Successful copy
- **WHEN** user clicks the "复制到公众号" button
- **THEN** the system SHALL write the inline-style HTML to the clipboard as `text/html`
- **THEN** a success toast notification SHALL be shown

#### Scenario: Clipboard permission denied
- **WHEN** the browser/system denies clipboard write permission
- **THEN** the system SHALL show an error toast with a message explaining the issue

---

### Requirement: Real-time preview panel
The system SHALL provide a side panel (Sheet) that shows a live preview of the rendered WeChat HTML as the user changes theme or color settings.

#### Scenario: Panel open/close
- **WHEN** user clicks the WeChat export button in the toolbar
- **THEN** the side panel SHALL open from the right side of the screen

#### Scenario: Preview updates on setting change
- **WHEN** user changes theme or primary color
- **THEN** the preview SHALL re-render within 300ms without requiring a manual refresh

---

### Requirement: Image handling notice
The system SHALL display a notice informing users that images must be manually uploaded to WeChat servers to display correctly in published articles.

#### Scenario: Notice displayed
- **WHEN** the WeChat export panel is open
- **THEN** a visible notice SHALL inform the user that external images will not display in WeChat and must be re-uploaded via the WeChat editor
