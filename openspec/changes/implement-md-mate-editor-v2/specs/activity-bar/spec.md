## ADDED Requirements

### Requirement: Activity bar displays vertical icon navigation
The system SHALL display a vertical activity bar on the left edge of the sidebar area containing icon buttons for different panels.

#### Scenario: Activity bar position and layout
- **WHEN** the activity bar is rendered
- **THEN** it SHALL be positioned on the leftmost edge of the sidebar area
- **AND** its width SHALL be 48 pixels
- **AND** icons SHALL be arranged vertically from top to bottom
- **AND** the following icons SHALL be displayed in order:
  - 📁 资源管理器 (Explorer)
  - 🔍 搜索 (Search)
  - 📑 大纲 (Outline)
  - 📋 片段 (Snippets)

### Requirement: Activity bar icons indicate active panel
The system SHALL visually indicate which panel is currently active in the activity bar.

#### Scenario: Active icon indicator
- **WHEN** a panel is active (its content is displayed in the sidebar)
- **THEN** the corresponding activity bar icon SHALL show a left-side accent-colored vertical bar (2px wide)
- **AND** the icon SHALL use accent color instead of default color

#### Scenario: Inactive icons appearance
- **WHEN** panels are not active
- **THEN** their icons SHALL be displayed in the secondary text color (--text-secondary)

### Requirement: Clicking activity bar icons switches panels
The system SHALL allow users to switch sidebar content by clicking activity bar icons.

#### Scenario: Switch to different panel
- **WHEN** user clicks an inactive activity bar icon
- **THEN** the sidebar SHALL expand (if collapsed) and display the corresponding panel content
- **AND** the clicked icon SHALL become the active icon
- **AND** the previously active icon SHALL become inactive

#### Scenario: Click active icon collapses sidebar
- **WHEN** user clicks the currently active activity bar icon
- **THEN** the sidebar SHALL collapse/hide
- **AND** the icon SHALL remain active (showing the accent indicator)

#### Scenario: Sidebar collapsed, click any icon
- **WHEN** the sidebar is currently collapsed/hidden
- **AND** user clicks any activity bar icon
- **THEN** the sidebar SHALL expand and show the clicked icon's panel content

### Requirement: Activity bar icons show hover effects
The system SHALL provide hover feedback on activity bar icons.

#### Scenario: Hover highlights icon
- **WHEN** user hovers over an activity bar icon
- **THEN** the icon SHALL brighten
- **AND** a subtle background highlight SHALL appear behind the icon

### Requirement: Activity bar supports badge notifications
The system SHALL display badge indicators on activity bar icons when relevant events occur.

#### Scenario: Search results count badge
- **WHEN** a search returns N matching results
- **THEN** a small badge showing the count "N" SHALL appear on the top-right of the search icon
- **AND** the badge SHALL use the accent color with white text

#### Scenario: Badge clears on panel activation
- **WHEN** user clicks an icon that has a badge notification
- **THEN** the badge SHALL be cleared/hidden after the panel is shown
