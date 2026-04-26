## Requirements

### Requirement: System provides a unified keyboard shortcuts hook
The system SHALL provide a `useKeyboardShortcuts` React hook that registers global keyboard event listeners and dispatches matching actions.

#### Scenario: Hook registers shortcuts and listens to keydown events
- **WHEN** a component calls `useKeyboardShortcuts(shortcuts)` with a non-empty array of shortcut configurations
- **THEN** the hook SHALL register a `keydown` event listener on `document`
- **AND** the listener SHALL remain active while the component is mounted

#### Scenario: Hook triggers action when shortcut matches
- **WHEN** a keydown event fires with `key`, `ctrlKey`, `shiftKey`, `altKey`, `metaKey` matching a registered shortcut
- **THEN** the hook SHALL call the shortcut's `action` callback exactly once

#### Scenario: Hook does not trigger when modifiers do not match
- **WHEN** a keydown event fires with the correct `key` but incorrect modifier keys
- **THEN** the hook SHALL NOT call the shortcut's `action` callback

#### Scenario: Hook uses exact modifier matching
- **WHEN** a shortcut is defined with `{ key: 'p', ctrlKey: true, shiftKey: true }`
- **AND** a keydown event fires with `key: 'p', ctrlKey: true, shiftKey: false`
- **THEN** the hook SHALL NOT trigger the shortcut action
- **AND** if another shortcut is defined with `{ key: 'p', ctrlKey: true }` (no shiftKey)
- **THEN** that shortcut's action SHALL be triggered instead

#### Scenario: Hook calls preventDefault by default
- **WHEN** a shortcut matches a keydown event
- **AND** the shortcut does not specify `preventDefault: false`
- **THEN** the hook SHALL call `event.preventDefault()`

#### Scenario: Hook skips preventDefault when configured
- **WHEN** a shortcut is defined with `preventDefault: false`
- **AND** the shortcut matches a keydown event
- **THEN** the hook SHALL NOT call `event.preventDefault()`

#### Scenario: Hook cleans up on unmount
- **WHEN** the component using `useKeyboardShortcuts` unmounts
- **THEN** the hook SHALL remove the `keydown` event listener from `document`
- **AND** subsequent keydown events SHALL NOT trigger any previously registered actions

#### Scenario: Hook handles empty shortcuts array
- **WHEN** `useKeyboardShortcuts([])` is called with an empty array
- **THEN** the hook SHALL not throw an error
- **AND** the return value SHALL be `undefined`

### Requirement: System adapts shortcuts to macOS and Windows platforms
The system SHALL detect the user's operating system and adapt modifier key behavior accordingly.

#### Scenario: macOS uses metaKey for Ctrl shortcuts
- **WHEN** the platform is macOS (`navigator.platform` starts with 'Mac')
- **AND** a shortcut is defined with `ctrlKey: true`
- **THEN** the hook SHALL match `event.metaKey === true` (Command key) instead of `event.ctrlKey`

#### Scenario: Windows/Linux uses ctrlKey directly
- **WHEN** the platform is NOT macOS
- **AND** a shortcut is defined with `ctrlKey: true`
- **THEN** the hook SHALL match `event.ctrlKey === true`

### Requirement: System provides shortcut display formatting utilities
The system SHALL export utility functions for formatting shortcut strings in the UI.

#### Scenario: isMacOS returns correct platform detection
- **WHEN** `isMacOS()` is called on a Mac platform
- **THEN** it SHALL return `true`
- **WHEN** `isMacOS()` is called on a non-Mac platform
- **THEN** it SHALL return `false`

#### Scenario: getModifierKey returns platform-appropriate symbol
- **WHEN** `getModifierKey()` is called on macOS
- **THEN** it SHALL return `'⌘'`
- **WHEN** `getModifierKey()` is called on Windows/Linux
- **THEN** it SHALL return `'Ctrl'`

#### Scenario: formatShortcut formats key combinations for display
- **WHEN** `formatShortcut('s', { ctrl: true })` is called on macOS
- **THEN** it SHALL return `'⌘S'`
- **WHEN** `formatShortcut('s', { ctrl: true })` is called on Windows
- **THEN** it SHALL return `'Ctrl+S'`
- **WHEN** `formatShortcut('S', { ctrl: true, shift: true })` is called on Windows
- **THEN** it SHALL return `'Ctrl+Shift+S'`
- **WHEN** `formatShortcut('f', { alt: true })` is called on macOS
- **THEN** it SHALL return `'⌥F'`

### Requirement: System replaces hardcoded shortcuts in AppV2
The system SHALL migrate all inline keyboard shortcuts from `AppV2.tsx` to use the `useKeyboardShortcuts` hook.

#### Scenario: All existing AppV2 shortcuts work via hook
- **WHEN** the application loads
- **THEN** the following shortcuts SHALL be functional through the hook:
  | Shortcut | Action |
  |----------|--------|
  | Ctrl/⌘+S | Save file |
  | Ctrl/⌘+O | Open file |
  | Ctrl/⌘+N | New file |
  | Ctrl/⌘+Shift+P | Toggle command palette |
  | Ctrl/⌘+B | Toggle sidebar |
  | Ctrl/⌘+F | Open find |
  | Ctrl/⌘+= / Ctrl/⌘++ | Zoom in |
  | Ctrl/⌘+- | Zoom out |
  | Ctrl/⌘+0 | Reset zoom |
  | Escape | Close active overlay (command palette / AI panel / find) |

#### Scenario: AppV2 no longer contains inline keydown handler
- **WHEN** the migration is complete
- **THEN** `AppV2.tsx` SHALL NOT contain a `useEffect` with `document.addEventListener('keydown', ...)` for global shortcuts
- **AND** all shortcuts SHALL be configured through `useKeyboardShortcuts` hook
