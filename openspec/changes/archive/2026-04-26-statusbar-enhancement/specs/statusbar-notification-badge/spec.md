## ADDED Requirements

### Requirement: Notification bell displays red dot badge
The system SHALL display a small red dot badge on the notification bell icon when unread notifications exist.

#### Scenario: Show red dot when notifications exist
- **WHEN** the `unreadCount` prop is greater than 0
- **THEN** a red dot (8x8px, #ef4444) SHALL appear at the top-right corner of the bell icon
- **AND** the dot SHALL use absolute positioning relative to the bell container

#### Scenario: Hide red dot when no notifications
- **WHEN** the `unreadCount` prop is 0 or undefined
- **THEN** no red dot badge SHALL be displayed

#### Scenario: Red dot visibility in dark theme
- **WHEN** the dark theme is active
- **AND** there are unread notifications
- **THEN** the red dot SHALL remain #ef4444 (red-500) for visibility on dark backgrounds

#### Scenario: Red dot visibility in light theme
- **WHEN** the light theme is active
- **AND** there are unread notifications
- **THEN** the red dot SHALL remain #ef4444 (red-500) for visibility on light backgrounds
