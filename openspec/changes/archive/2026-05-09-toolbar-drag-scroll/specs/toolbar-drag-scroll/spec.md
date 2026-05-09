## ADDED Requirements

### Requirement: Toolbar supports mouse drag to scroll horizontally
The toolbar scrollable area SHALL allow users to press and hold the mouse button, then drag left or right to scroll the toolbar content horizontally.

#### Scenario: User drags toolbar to scroll right
- **WHEN** user presses mouse button down on the toolbar scrollable area and moves mouse to the left
- **THEN** the toolbar content SHALL scroll to the right, revealing buttons that were previously hidden on the right side

#### Scenario: User drags toolbar to scroll left
- **WHEN** user presses mouse button down on the toolbar scrollable area and moves mouse to the right
- **THEN** the toolbar content SHALL scroll to the left, revealing buttons that were previously hidden on the left side

#### Scenario: Scroll position persists after drag ends
- **WHEN** user releases the mouse button after dragging
- **THEN** the toolbar SHALL remain at the scrolled position (not snap back)

### Requirement: Drag interaction does not trigger button clicks
The system SHALL distinguish between drag gestures and click actions to prevent accidental button activation during drag.

#### Scenario: Mouse moves more than 5px threshold
- **WHEN** user presses mouse button and moves more than 5 pixels horizontally before releasing
- **THEN** the system SHALL treat this as a drag action and SHALL NOT trigger any button click event

#### Scenario: Mouse moves less than 5px threshold
- **WHEN** user presses mouse button and moves less than 5 pixels horizontally before releasing
- **THEN** the system SHALL treat this as a normal click and SHALL trigger the button's click handler

### Requirement: Visual cursor feedback during drag
The toolbar SHALL provide visual cursor feedback to indicate drag capability and active dragging state.

#### Scenario: Cursor changes during drag
- **WHEN** user presses and holds mouse button on the toolbar and begins dragging
- **THEN** the cursor SHALL change to `grabbing` to indicate active drag state

#### Scenario: Cursor resets after drag ends
- **WHEN** user releases the mouse button after dragging
- **THEN** the cursor SHALL return to its default state

### Requirement: Right-side fixed buttons are not affected by drag scroll
The right-side toolbar buttons (command palette, sidebar toggle, AI) SHALL remain fixed and always visible, independent of the scrollable area.

#### Scenario: Right buttons visible when toolbar is scrolled
- **WHEN** user scrolls the toolbar content via drag
- **THEN** the right-side fixed buttons SHALL remain in their fixed position and SHALL NOT scroll with the toolbar content

#### Scenario: Drag does not activate on fixed area
- **WHEN** user attempts to drag on the right-side fixed button area
- **THEN** the drag-to-scroll behavior SHALL NOT be triggered
