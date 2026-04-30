## ADDED Requirements

### Requirement: Editor background and gutter colors sync with active theme
The system SHALL update the CodeMirror editor's background color, gutter background color, gutter foreground color, cursor color, active line highlight color, and selection background color to match the active theme whenever the theme changes.

#### Scenario: Switch to any theme updates editor background
- **WHEN** user switches to any of the 7 supported themes (dark, light, monokai, solarized, nord, dracula, github)
- **THEN** the editor area background SHALL immediately update to match the theme's `editor.background` color
- **AND** the gutter background SHALL update to match the theme's `editor.gutterBackground` color
- **AND** the gutter text color SHALL update to match the theme's `editor.gutterForeground` color

#### Scenario: Switch to any theme updates editor cursor and selection
- **WHEN** user switches to any of the 7 supported themes
- **THEN** the editor cursor color SHALL update to match the theme's `editor.cursor` color
- **AND** the active line highlight SHALL update to match the theme's `editor.lineHighlight` color
- **AND** the text selection background SHALL update to match the theme's `editor.selection` color

#### Scenario: No visual mismatch between editor and surrounding UI
- **WHEN** any theme is active
- **THEN** the editor area background SHALL visually match the surrounding UI panels (sidebar, toolbar, status bar)
- **AND** there SHALL be no visible color discontinuity at the editor boundary

### Requirement: Editor syntax highlighting colors sync with active theme
The system SHALL update CodeMirror syntax highlighting colors to match the active theme's syntax color palette whenever the theme changes.

#### Scenario: Heading colors match theme
- **WHEN** user switches to any theme
- **THEN** H1 headings in the editor SHALL use the theme's `syntax.heading` color
- **AND** H2 headings SHALL use the theme's `syntax.heading2` color
- **AND** H3 headings SHALL use the theme's `syntax.heading3` color

#### Scenario: Inline formatting colors match theme
- **WHEN** user switches to any theme
- **THEN** bold text SHALL use the theme's `syntax.bold` color
- **AND** italic text SHALL use the theme's `syntax.italic` color
- **AND** inline code SHALL use the theme's `syntax.code` color with `syntax.codeBackground` background
- **AND** links SHALL use the theme's `syntax.link` color

#### Scenario: Block element colors match theme
- **WHEN** user switches to any theme
- **THEN** blockquote text SHALL use the theme's `syntax.quote` color
- **AND** list markers SHALL use the theme's `syntax.list` color
- **AND** strikethrough text SHALL use the theme's `syntax.strikethrough` color

### Requirement: Editor theme update is triggered by any theme change
The system SHALL detect and respond to any theme change, not just changes between dark and light categories.

#### Scenario: Switch between two dark themes triggers editor update
- **WHEN** user switches from `dark` theme to `monokai` theme
- **THEN** the editor SHALL rebuild with monokai-specific colors
- **AND** the editor SHALL NOT retain dark theme colors

#### Scenario: Switch between two light themes triggers editor update
- **WHEN** user switches from `light` theme to `github` theme
- **THEN** the editor SHALL rebuild with github-specific colors

#### Scenario: Switch within same isDark category triggers editor update
- **WHEN** user switches between any two themes that share the same `isDark` value (e.g., dark → monokai, both isDark=true)
- **THEN** the editor SHALL still rebuild and apply the new theme's colors
