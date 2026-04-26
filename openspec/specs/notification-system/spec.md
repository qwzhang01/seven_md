## ADDED Requirements

### Requirement: Notification system displays toast messages
The system SHALL display notification toast messages that appear from the bottom-right corner of the window.

#### Scenario: Notification appears
- **WHEN** a notification is triggered (by save success, error, warning, etc.)
- **THEN** a toast notification SHALL slide in from the bottom-right corner
- **AND** the notification SHALL include:
  - A left-colored border strip indicating type (4px wide)
  - An optional icon
  - The notification message text
  - A close (✕) button on the right
- **AND** a slide-in animation (~200ms ease-out) SHALL play

### Requirement: Four notification types supported
The system SHALL support four distinct notification types with different visual treatments.

#### Scenario: Info notification
- **WHEN** an info notification is triggered
- **THEN** it SHALL display with a blue left border (--info-color) and ℹ️ icon
- **AND** example: "文件已保存"

#### Scenario: Success notification
- **WHEN** a success notification is triggered
- **THEN** it SHALL display with a green left border (--success-color) and ✓ icon
- **AND** example: "导出成功！"

#### Scenario: Warning notification
- **WHEN** a warning notification is triggered
- **THEN** it SHALL display with a yellow/orange left border (--warning-color) and ⚠ icon
- **AND** example: "文件较大，预览可能较慢"

#### Scenario: Error notification
- **WHEN** an error notification is triggered
- **THEN** it SHALL display with a red left border (--error-color) and ✗ icon
- **AND** example: "保存失败：权限不足"

### Requirement: Notifications auto-dismiss after timeout
The system SHALL automatically close notifications after a configurable duration.

#### Scenario: Auto-close timer
- **WHEN** a notification appears
- **THEN** it SHALL automatically disappear after 5 seconds
- **AND** a fade-out + slide-right animation (~200ms) SHALL play

#### Scenario: Hover pauses auto-close timer
- **WHEN** the mouse hovers over a notification before auto-close
- **THEN** the auto-close countdown SHALL pause
- **AND** the countdown SHALL resume when the mouse leaves the notification
- **AND** the countdown SHALL resume from the **remaining time** (not restart from full duration)

#### Scenario: Precise remaining time tracking
- **WHEN** a notification's timer is paused via hover
- **THEN** the system SHALL calculate elapsed time as `Date.now() - startTime`
- **AND** the remaining time SHALL be `duration - elapsed` (clamped to ≥ 0)
- **AND** the countdown SHALL resume from that remaining time when the mouse leaves

#### Scenario: Multiple notifications with independent timers
- **WHEN** multiple notifications are visible simultaneously
- **THEN** each notification SHALL have its own independent timer
- **AND** hovering over one notification SHALL NOT affect the timers of other notifications

### Requirement: Multiple notifications stack vertically
The system SHALL handle multiple simultaneous notifications by stacking them.

#### Scenario: Stacking order
- **WHEN** multiple notifications appear simultaneously
- **THEN** they SHALL stack vertically with the newest at the top
- **AND** there SHALL be a maximum of 5 visible notifications at once
- **AND** older notifications beyond the limit shall be dismissed automatically

#### Scenario: Manual close removes notification
- **WHEN** user clicks the ✕ button on any notification
- **THEN** that specific notification SHALL close immediately
- **AND** remaining notifications SHALL shift to fill the gap

### Requirement: Notifications can trigger actions
The system SHALL allow notifications to associate clickable actions.

#### Scenario: Actionable notification
- **WHEN** a notification includes an associated action (e.g., "查看详情")
- **THEN** clicking the notification body (not the close button) SHALL execute the action
