## ADDED Requirements

### Requirement: ActivityBar click toggles sidebar collapse
The system SHALL collapse the sidebar when user clicks the currently active activity bar icon.

#### Scenario: Click active icon collapses sidebar
- **WHEN** sidebar is visible AND user clicks an already-active activity bar icon
- **THEN** the sidebar SHALL be hidden (sidebarVisible = false)
- **AND** the clicked icon SHALL remain visually active (showing accent indicator)

#### Scenario: Click inactive icon shows panel
- **WHEN** sidebar is visible AND user clicks an inactive activity bar icon
- **THEN** the corresponding panel SHALL be displayed
- **AND** the clicked icon SHALL become the active icon

#### Scenario: Click icon when sidebar collapsed
- **WHEN** sidebar is hidden AND user clicks any activity bar icon
- **THEN** the sidebar SHALL be shown (sidebarVisible = true)
- **AND** the corresponding panel SHALL be displayed

### Requirement: Sidebar resize handle has visible hover feedback
The system SHALL provide clear visual feedback when user hovers over the sidebar resize handle.

#### Scenario: Hover shows resize cursor and highlight
- **WHEN** mouse enters the sidebar right edge area (4px zone)
- **THEN** the cursor SHALL change to col-resize
- **AND** a visible highlight line SHALL appear on the edge

### Requirement: Explorer section headers show hover action buttons
The system SHALL display action buttons on hover for all explorer section headers.

#### Scenario: Open Files section shows actions on hover
- **WHEN** user hovers over "打开的文件" section header
- **THEN** action buttons SHALL appear: New File, Refresh
- **AND** buttons SHALL be hidden when mouse leaves

#### Scenario: Workspace section shows all actions on hover
- **WHEN** user hovers over workspace section header
- **THEN** action buttons SHALL appear: New File, New Folder, Refresh, Collapse All
- **AND** buttons SHALL be hidden when mouse leaves
