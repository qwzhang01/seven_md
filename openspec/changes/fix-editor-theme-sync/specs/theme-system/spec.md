## MODIFIED Requirements

### Requirement: Theme switching applies globally and immediately
The system SHALL apply the selected theme to all UI components instantly, including the CodeMirror editor area.

#### Scenario: Switch theme from menu
- **WHEN** user selects a theme from the Theme menu or command palette
- **THEN** ALL UI elements SHALL update to use the new theme colors:
  - Title bar (background, text, buttons)
  - Menu bar (background, text, highlights)
  - Toolbar (background, button states)
  - Activity bar (icons, active indicators)
  - Sidebar (background, text, borders)
  - **Editor area (background, gutter background, gutter text, cursor, line highlight, selection, syntax highlighting colors)**
  - Preview area (background, heading colors, code blocks)
  - Status bar (background, text)
  - All panels, modals, dialogs

#### Scenario: Smooth transition animation
- **WHEN** a theme switch occurs
- **THEN** a smooth transition animation of ~200ms duration SHALL play
- **AND** the animation SHALL use ease timing function
- **AND** only color properties shall transition (no layout changes)

### Requirement: Themes are implemented via CSS custom properties
The system SHALL implement themes using CSS custom properties (variables) for runtime switching.

#### Scenario: CSS variable structure
- **WHEN** a theme is active
- **THEN** the `<html>` element SHALL have `data-theme="<theme-id>"` attribute
- **AND** all component styles SHALL reference CSS variables in format `var(--<property-name>)`
- **AND** the variable definitions for each theme SHALL be defined in `[data-theme="id"]` selectors

#### Scenario: Core CSS variables required
- **WHEN** any theme is active
- **THEN** at minimum these CSS variable categories MUST be defined for ALL 7 themes:
  - `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-hover`, `--bg-active`
  - `--text-primary`, `--text-secondary`, `--text-disabled`, `--text-accent`
  - `--accent-color`, `--accent-hover`
  - `--border-default`, `--border-active`
  - `--success-color`, `--warning-color`, `--error-color`, `--info-color`
  - Editor-specific (ALL 7 themes): `--editor-bg`, `--editor-fg`, `--editor-gutter-bg`, `--editor-gutter-fg`, `--editor-line-highlight`, `--editor-selection`, `--editor-cursor`
  - Syntax highlighting colors for each Markdown element type
