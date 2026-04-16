## ADDED Requirements

### Requirement: Application layout uses ARIA landmark roles
The system SHALL mark major layout regions with ARIA landmark roles so that screen reader users can navigate between regions using standard shortcuts.

#### Scenario: Toolbar region is identified as a banner or toolbar landmark
- **WHEN** the application renders the toolbar
- **THEN** the toolbar container SHALL have `role="toolbar"` and an `aria-label` describing its purpose

#### Scenario: Sidebar region is identified as a navigation landmark
- **WHEN** the application renders the sidebar
- **THEN** the sidebar container SHALL have `role="navigation"` and an `aria-label` (e.g., "File Explorer")

#### Scenario: Editor region is identified as a main landmark
- **WHEN** the application renders the editor area
- **THEN** the editor container SHALL have `role="main"` and an `aria-label` (e.g., "Editor")

#### Scenario: Status bar region is identified as a status landmark
- **WHEN** the application renders the status bar
- **THEN** the status bar container SHALL have `role="status"` and `aria-live="polite"`

### Requirement: Interactive elements have accessible names
The system SHALL ensure all interactive elements (buttons, inputs, links) have accessible names that screen readers can announce.

#### Scenario: Icon-only buttons have aria-label
- **WHEN** a button contains only an icon with no visible text
- **THEN** the button SHALL have an `aria-label` attribute describing its action

#### Scenario: Form inputs have associated labels
- **WHEN** a form input is rendered
- **THEN** it SHALL have an associated `<label>` element or an `aria-label` / `aria-labelledby` attribute

#### Scenario: Toggle buttons announce their state
- **WHEN** a button represents a toggle (e.g., sidebar visibility, preview toggle)
- **THEN** it SHALL have `aria-pressed="true"` when active and `aria-pressed="false"` when inactive

### Requirement: Dynamic content changes are announced to screen readers
The system SHALL use ARIA live regions to announce dynamic content changes so that screen reader users are informed without losing focus.

#### Scenario: Status bar updates are announced politely
- **WHEN** the status bar content changes (e.g., word count, save status)
- **THEN** the change SHALL be announced by the screen reader after the current speech finishes (`aria-live="polite"`)

#### Scenario: Error messages are announced immediately
- **WHEN** an error or warning notification appears
- **THEN** it SHALL be announced immediately using `aria-live="assertive"` or `role="alert"`

### Requirement: Focus management supports keyboard navigation
The system SHALL manage focus so that keyboard-only users can navigate the entire application without a mouse.

#### Scenario: Focus is visible at all times
- **WHEN** any interactive element receives keyboard focus
- **THEN** a visible focus indicator SHALL be displayed with a contrast ratio of at least 3:1 against the adjacent background

#### Scenario: Modal dialogs trap focus
- **WHEN** a modal dialog is open
- **THEN** keyboard focus SHALL be trapped within the dialog
- **AND** pressing Escape SHALL close the dialog and return focus to the triggering element

#### Scenario: Tab order follows visual layout
- **WHEN** the user presses Tab to navigate
- **THEN** focus SHALL move in a logical order that matches the visual top-to-bottom, left-to-right layout
