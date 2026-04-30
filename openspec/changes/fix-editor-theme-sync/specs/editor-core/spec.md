## MODIFIED Requirements

### Requirement: Editor provides Markdown syntax highlighting
The system SHALL apply syntax highlighting to Markdown content within the editor, using colors derived from the active theme's syntax color palette.

#### Scenario: Syntax elements highlighted
- **WHEN** Markdown content is displayed in the editor
- **THEN** the following syntax elements SHALL be color-coded using the active theme's colors:
  | Syntax | Color Source |
  |--------|-------------|
  | H1 headings | `theme.syntax.heading` |
  | H2 headings | `theme.syntax.heading2` |
  | H3 headings | `theme.syntax.heading3` |
  | H4 headings | `theme.syntax.heading4` |
  | **Bold** | `theme.syntax.bold` |
  | *Italic* | `theme.syntax.italic` |
  | `Inline code` | `theme.syntax.code` with `theme.syntax.codeBackground` |
  | [Links](url) | `theme.syntax.link` |
  | > Blockquotes | `theme.syntax.quote` |
  | Lists (- / 1.) | `theme.syntax.list` |
  | ~~Strikethrough~~ | `theme.syntax.strikethrough` |

#### Scenario: Syntax colors update on theme change
- **WHEN** user switches to a different theme
- **THEN** all syntax highlighting colors in the editor SHALL update to match the new theme's syntax palette
- **AND** the update SHALL occur within 300ms of the theme switch
