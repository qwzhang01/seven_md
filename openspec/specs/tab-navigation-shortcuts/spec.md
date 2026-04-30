## ADDED Requirements

### Requirement: Ctrl+Tab switches to next tab
The application SHALL switch to the next editor tab when the user presses `Ctrl+Tab`, regardless of whether the editor has focus or not.

#### Scenario: Switch to next tab with Ctrl+Tab
- **WHEN** multiple tabs are open and the user presses `Ctrl+Tab`
- **THEN** the next tab to the right SHALL become active
- **THEN** the default browser tab-switching behavior SHALL be prevented

#### Scenario: Wrap around to first tab
- **WHEN** the last tab is active and the user presses `Ctrl+Tab`
- **THEN** the first tab SHALL become active

### Requirement: Ctrl+Shift+Tab switches to previous tab
The application SHALL switch to the previous editor tab when the user presses `Ctrl+Shift+Tab`, regardless of whether the editor has focus or not.

#### Scenario: Switch to previous tab with Ctrl+Shift+Tab
- **WHEN** multiple tabs are open and the user presses `Ctrl+Shift+Tab`
- **THEN** the next tab to the left SHALL become active
- **THEN** the default browser behavior SHALL be prevented

#### Scenario: Wrap around to last tab
- **WHEN** the first tab is active and the user presses `Ctrl+Shift+Tab`
- **THEN** the last tab SHALL become active

### Requirement: Alt+ArrowLeft/Right tab navigation only works when editor is NOT focused
The `Alt+ArrowLeft` and `Alt+ArrowRight` shortcuts SHALL switch to the previous/next tab ONLY when the editor does not have focus, to avoid conflicting with CodeMirror's word-jump cursor movement.

#### Scenario: Alt+ArrowRight switches tab when editor is not focused
- **WHEN** the editor does NOT have focus and the user presses `Alt+ArrowRight`
- **THEN** the next tab SHALL become active

#### Scenario: Alt+ArrowLeft/Right does NOT interfere with editor cursor movement
- **WHEN** the editor HAS focus and the user presses `Alt+ArrowLeft` or `Alt+ArrowRight`
- **THEN** CodeMirror SHALL handle the key event for cursor word-jump movement
- **THEN** no tab switching SHALL occur

### Requirement: Tab navigation shortcuts work with single tab
When only one tab is open, tab navigation shortcuts SHALL have no effect (no error, no crash).

#### Scenario: Ctrl+Tab with single tab
- **WHEN** only one tab is open and the user presses `Ctrl+Tab`
- **THEN** the tab SHALL remain active and no error SHALL occur
