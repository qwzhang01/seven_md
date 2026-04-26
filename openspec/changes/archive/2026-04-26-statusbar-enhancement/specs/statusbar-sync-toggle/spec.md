## ADDED Requirements

### Requirement: Sync status displays toggle state clearly
The system SHALL display the sync status with explicit "on/off" text to distinguish between enabled and disabled states.

#### Scenario: Show sync enabled state
- **WHEN** the sync feature is enabled
- **THEN** the status bar SHALL display "同步: 开" with full opacity (1.0)

#### Scenario: Show sync disabled state
- **WHEN** the sync feature is disabled
- **THEN** the status bar SHALL display "同步: 关" with reduced opacity (0.6)
- **AND** the text color SHALL be dimmed to indicate inactive state

#### Scenario: Visual distinction between states
- **WHEN** comparing sync enabled vs disabled
- **THEN** users SHALL be able to visually distinguish the two states through both text content and opacity
- **AND** the enabled state SHALL appear brighter/more prominent than the disabled state
