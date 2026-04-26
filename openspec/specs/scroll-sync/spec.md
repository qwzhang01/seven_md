## ADDED Requirements

### Requirement: Editor scrolling synchronizes preview position
The system SHALL synchronize the preview pane's scroll position to match the editor's scroll position when scroll sync is enabled.

#### Scenario: Editor scroll triggers preview scroll
- **WHEN** scroll sync is enabled
- **AND** the user scrolls in the editor pane
- **THEN** the preview pane SHALL scroll to the proportionally equivalent position
- **AND** the proportion SHALL be calculated as `editorScrollTop / editorScrollHeight`
- **AND** the preview SHALL scroll to `previewScrollHeight × proportion`

#### Scenario: Scroll sync does not create feedback loop
- **WHEN** the editor triggers a scroll sync to the preview
- **THEN** the preview's scroll event SHALL NOT trigger a reverse sync back to the editor
- **AND** the system SHALL use a flag mechanism to prevent circular updates

#### Scenario: Scroll sync respects performance constraints
- **WHEN** the user scrolls rapidly in the editor
- **THEN** the sync updates SHALL be debounced using `requestAnimationFrame`
- **AND** intermediate scroll positions SHALL be skipped to maintain smooth performance

### Requirement: Scroll sync can be toggled on and off
The system SHALL provide a user-configurable toggle for scroll synchronization.

#### Scenario: Toggle scroll sync from editor store
- **WHEN** the user toggles scroll sync (via status bar or view menu)
- **THEN** `useEditorStore.scrollSyncEnabled` SHALL update to reflect the new state
- **AND** if disabled, editor scrolling SHALL NOT affect preview scroll position

#### Scenario: Default scroll sync state
- **WHEN** the application starts
- **THEN** scroll sync SHALL be disabled by default

#### Scenario: Scroll sync only active in split view
- **WHEN** the view mode is "editor-only" or "preview-only"
- **THEN** scroll sync logic SHALL NOT execute (no target pane to sync)
- **AND** scroll sync SHALL only be active when view mode is "split"
