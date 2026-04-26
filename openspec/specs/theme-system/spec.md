## ADDED Requirements

### Requirement: System provides seven built-in color themes
The system SHALL ship with seven built-in color themes for the entire application.

#### Scenario: Available themes
- **WHEN** the theme settings are accessed (via Theme menu or command palette)
- **THEN** the following themes SHALL be available:
  | ID | Name | Style | Background |
  |----|------|-------|------------|
  | dark | Dark | 深色 (默认) | #1e1e1e |
  | light | Light | 浅色 | #ffffff |
  | monokai | Monokai | 经典深色 | #272822 |
  | solarized | Solarized | 暖色调 Dark: #002b36 / Light: #fdf6e3 |
  | nord | Nord | 冷色调 | #2e3440 |
  | dracula | Dracula | 紫色调 | #282a36 |
  | github | GitHub | 浅色简洁 | #ffffff |

### Requirement: Theme switching applies globally and immediately
The system SHALL apply the selected theme to all UI components instantly.

#### Scenario: Switch theme from menu
- **WHEN** user selects a theme from the Theme menu or command palette
- **THEN** ALL UI elements SHALL update to use the new theme colors:
  - Title bar (background, text, buttons)
  - Menu bar (background, text, highlights)
  - Toolbar (background, button states)
  - Activity bar (icons, active indicators)
  - Sidebar (background, text, borders)
  - Editor area (background, gutter, syntax colors)
  - Preview area (background, heading colors, code blocks)
  - Status bar (background, text)
  - All panels, modals, dialogs

#### Scenario: Smooth transition animation
- **WHEN** a theme switch occurs
- **THEN** a smooth transition animation of ~200ms duration SHALL play
- **AND** the animation SHALL use ease timing function
- **AND** only color properties shall transition (no layout changes)

### Requirement: Theme preference is persisted
The system SHALL remember the user's theme choice across sessions.

#### Scenario: Save theme on change
- **WHEN** a new theme is selected
- **THEN** the theme identifier SHALL be saved to localStorage under key "md-mate-theme"
- **OR** via Tauri app data storage if available

#### Scenario: Restore theme on launch
- **WHEN** the application starts
- **THEN** it SHALL check for a previously saved theme preference
- **IF** a saved preference exists, that theme SHALL be applied as the default
- **IF** no preference exists, the "dark" theme SHALL be used as default

### Requirement: Themes are implemented via CSS custom properties
The system SHALL implement themes using CSS custom properties (variables) for runtime switching.

#### Scenario: CSS variable structure
- **WHEN** a theme is active
- **THEN** the `<html>` element SHALL have `data-theme="<theme-id>"` attribute
- **AND** all component styles SHALL reference CSS variables in format `var(--<property-name>)`
- **AND** the variable definitions for each theme SHALL be defined in `[data-theme="id"]` selectors

#### Scenario: Core CSS variables required
- **WHEN** any theme is active
- **THEN** at minimum these CSS variable categories MUST be defined:
  - `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-hover`, `--bg-active`
  - `--text-primary`, `--text-secondary`, `--text-disabled`, `--text-accent`
  - `--accent-color`, `--accent-hover`
  - `--border-default`, `--border-active`
  - `--success-color`, `--warning-color`, `--error-color`, `--info-color`
  - Editor-specific: `--editor-bg`, `--editor-fg`, `--editor-gutter-bg`, `--editor-line-highlight`, `--editor-selection`
  - Syntax highlighting colors for each Markdown element type
