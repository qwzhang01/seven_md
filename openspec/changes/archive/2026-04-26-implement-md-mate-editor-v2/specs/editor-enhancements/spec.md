## MODIFIED Requirements

### Requirement: Editor provides enhanced Markdown editing experience
The system SHALL provide an enhanced editing experience built on CodeMirror 6 with line numbers, syntax highlighting, auto-completion, and context menu support.

#### Scenario: Editor renders with line numbers gutter
- **WHEN** the editor pane is displayed
- **THEN** each line SHALL have a corresponding line number displayed in the left gutter
- **AND** the gutter width SHALL dynamically accommodate the number of digits needed
- **AND** the current line number SHALL be highlighted with accent color

#### Scenario: Editor provides full Markdown syntax highlighting
- **WHEN** Markdown content is present in the editor
- **THEN** ALL Markdown syntax elements SHALL be highlighted per the theme's syntax color definitions:
  - ATX headings (# through ######) — distinct sizes/colors per level
  - Setext headings (underlines) — same treatment as ATX equivalents
  - Emphasis (*text*, _text_) — italic + emphasis color
  - Strong emphasis (**text**, __text__) — bold + emphasis color
  - Strikethrough (~~text~~) — strikethrough decoration
  - Inline code (`code`) — monospace font + code background
  - Fenced code blocks (```language) — monospace + optional language-specific highlighting
  - Indented code blocks — same as fenced
  - Links ([text](url)) — link color, underline on hover
  - Images (![alt](url)) — image reference styling
  - Reference-style links/images — same colors
  - Autolinks (<url>) — link color
  - Blockquotes (>) — left border + quote background tint
  - Lists (unordered -,+,*; ordered 1. 2. etc.) — list marker color
  - Task lists (- [ ] / - [x]) — checkbox rendering, green for completed
  - Horizontal rules (---, ***, ___) — divider line
  - HTML (inline and block) — dimmed/grayed
  - Footnotes ([^1]) — superscript styling

#### Scenario: Auto-pairing works for all bracket types
- **WHEN** user types any opening delimiter: ( [ { " ' ` <
- **THEN** the matching closing delimiter SHALL be auto-inserted
- **AND** cursor SHALL be positioned between the pair
- **AND** typing the closing delimiter when cursor is right before it SHALL skip over it (no double insertion)

#### Scenario: List continuation on Enter
- **WHEN** user presses Enter at the end of a list item line
- **THEN** a new list item prefix SHALL be created on the next line:
  - For unordered: same marker character (`-`, `+`, or `*`) repeated
  - For ordered: next sequential number
  - For task list: `- [ ]` created
- **AND** pressing Enter on an empty list item (only prefix, no content) SHALL exit the list (remove prefix)

#### Scenario: Right-click context menu available
- **WHEN** user right-clicks anywhere in the editor area
- **THEN** a context menu SHALL appear at the click position
- **AND** the menu SHALL contain: Cut/Copy/Paste | Insert submenu (all Markdown elements) | Select All | Format Document | AI Rewrite
- **AND** the Insert submenu SHALL provide access to all insertable Markdown constructs
