## MODIFIED Requirements

### Requirement: Enhanced status bar displays comprehensive information
The status bar SHALL be significantly expanded from its basic implementation to show multi-section information including Git branch, sync status, problems count, notifications, cursor position, encoding, line endings, and language mode.

#### Scenario: Status bar layout (replaces simple layout)
- **WHEN** the status bar is rendered at the bottom of the application window
- **THEN** it SHALL be organized into two main regions separated by flexible space:

  **Left Region** (items from left):
  1. 🔀 Git branch name (e.g., "main")
  2. 🔄 Sync status (spinning animation when syncing, "已同步" when idle)
  3. ⚠ Problems count (error + warning total, e.g., ⚠ 0)
  4. 🔔 Notification count badge (e.g., 🔔 0)

  **Right Region** (items from right):
  1. Cursor position: "行 X, 列 Y"
  2. Encoding: "UTF-8"
  3. Line ending: "LF" or "CRLF"
  4. Language mode: "Markdown"

- **AND** items SHALL be separated by thin vertical dividers (1px, --border-color)
- **AND** the height SHALL be 24 pixels

#### Scenario: Cursor position updates in real-time (enhanced)
- **WHEN** the cursor moves within the editor (click, arrow keys, typing)
- **THEN** the status bar SHALL update to show the exact line and column (1-indexed)
- **AND** the format SHALL be "行 {line}, 列 {column}"
- **AND** the update SHALL be immediate (no debounce)

#### Scenario: Click interactions on status items (new capability)
- **WHEN** user clicks on the Git branch item
- **THEN** a dropdown/popover SHALL show branch information (future: branch switcher)

- **WHEN** user clicks on sync status item
- **THEN** manual sync SHALL trigger if supported

- **WHEN** user clicks on problems count
- **THEN** a problems panel SHALL open (future enhancement)

- **WHEN** user clicks on cursor position
- **THEN** a "Go to Line" input dialog SHALL appear (future enhancement)

- **WHEN** user clicks on encoding item
- **THEN** encoding selection dropdown SHALL appear allowing change with reinterpretation option

- **WHEN** user clicks on line ending item
- **THEN** line ending SHALL toggle between LF and CRLF with a confirmation prompt

- **WHEN** user clicks on language mode item
- **THEN** a language selector dropdown SHALL appear allowing manual override

#### Scenario: Notification bell with badge (new)
- **WHEN** unread notifications exist
- **THEN** the 🔔 icon SHALL show a numeric badge indicating unread count
- **AND** clicking SHALL reveal notification dropdown/list

#### Scenario: Status bar uses theme colors (enhanced)
- **WHEN** dark theme active:
  - THEN** background: #1e1e1e (or --bg-tertiary), text: #858585 (--text-secondary), hover bg: #2a2d2e
- **WHEN** light theme active:
  - THEN** background: #f3f4f6, text: #6b7280, hover bg: #e5e7eb
