## MODIFIED Requirements

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
  | Ctrl/⌘+B | Toggle sidebar (when editor not focused) / Bold (when editor focused) |
  | Ctrl/⌘+F | Open find |
  | Ctrl/⌘+= / Ctrl/⌘++ | Zoom in |
  | Ctrl/⌘+- | Zoom out |
  | Ctrl/⌘+0 | Reset zoom |
  | Escape | Close active overlay (command palette / AI panel / find) |
  | Ctrl+Tab | Switch to next tab |
  | Ctrl+Shift+Tab | Switch to previous tab |
  | Alt+Left | Switch to previous tab (only when editor not focused) |
  | Alt+Right | Switch to next tab (only when editor not focused) |

#### Scenario: AppV2 no longer contains inline keydown handler
- **WHEN** the migration is complete
- **THEN** `AppV2.tsx` SHALL NOT contain a `useEffect` with `document.addEventListener('keydown', ...)` for global shortcuts
- **AND** all shortcuts SHALL be configured through `useKeyboardShortcuts` hook

#### Scenario: Native clipboard shortcuts are not registered in the hook
- **WHEN** the application initializes the shortcuts array in `AppV2.tsx`
- **THEN** the shortcuts array SHALL NOT contain entries for `c` (copy), `x` (cut), `v` (paste), `z` (undo), or `a` (select-all) with `ctrlKey: true` alone (without additional modifiers like `shiftKey`)
- **AND** these keys SHALL be handled exclusively by CodeMirror's built-in keymap when the editor has focus
