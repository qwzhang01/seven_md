## MODIFIED Requirements

### Requirement: System adapts shortcuts to macOS and Windows platforms
The system SHALL detect the user's operating system and adapt modifier key behavior accordingly. Native OS shortcuts (Cmd+C/X/V/Z/A on macOS, Ctrl+C/X/V/Z/A on Windows/Linux) SHALL NOT be registered in the `useKeyboardShortcuts` hook, as they are handled natively by CodeMirror's `defaultKeymap` and `historyKeymap`.

#### Scenario: macOS uses metaKey for Ctrl shortcuts
- **WHEN** the platform is macOS (`navigator.platform` starts with 'Mac')
- **AND** a shortcut is defined with `ctrlKey: true`
- **THEN** the hook SHALL match `event.metaKey === true` (Command key) instead of `event.ctrlKey`

#### Scenario: Windows/Linux uses ctrlKey directly
- **WHEN** the platform is NOT macOS
- **AND** a shortcut is defined with `ctrlKey: true`
- **THEN** the hook SHALL match `event.ctrlKey === true`

#### Scenario: Native clipboard shortcuts are not registered in the hook
- **WHEN** the application initializes the shortcuts array in `AppV2.tsx`
- **THEN** the shortcuts array SHALL NOT contain entries for `c` (copy), `x` (cut), `v` (paste), `z` (undo), or `a` (select-all) with `ctrlKey: true`
- **AND** these keys SHALL be handled exclusively by CodeMirror's built-in keymap when the editor has focus
