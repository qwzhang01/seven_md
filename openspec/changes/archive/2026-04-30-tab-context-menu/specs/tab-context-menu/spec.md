## ADDED Requirements

### Requirement: Tab right-click shows context menu with close actions
The system SHALL display a context menu when the user right-clicks on any tab in the tab bar, providing quick access to close operations.

#### Scenario: Right-click on tab opens context menu
- **WHEN** user right-clicks on a tab
- **THEN** a context menu SHALL appear at the mouse cursor position
- **AND** the context menu SHALL contain the following items in order:
  1. 关闭 (Close)
  2. 关闭其他 (Close Others)
  3. 关闭全部 (Close All)
  4. ——（分隔线）
  5. 关闭左侧 (Close to the Left)
  6. 关闭右侧 (Close to the Right)
- **AND** the browser's native context menu SHALL be suppressed

#### Scenario: Context menu closes on outside click
- **WHEN** a tab context menu is open
- **AND** user clicks anywhere outside the context menu
- **THEN** the context menu SHALL close without performing any action

#### Scenario: Context menu closes on Escape key
- **WHEN** a tab context menu is open
- **AND** user presses the Escape key
- **THEN** the context menu SHALL close without performing any action

#### Scenario: Context menu items use lucide-react icons
- **WHEN** the tab context menu is displayed
- **THEN** each menu item SHALL render a lucide-react icon at 14px size
  - 关闭: `X` icon
  - 关闭其他: `Layers` icon
  - 关闭全部: `XCircle` icon
  - 关闭左侧: `ChevronLeft` icon (with X)
  - 关闭右侧: `ChevronRight` icon (with X)
- **AND** icon color SHALL inherit from `var(--text-primary)`

### Requirement: Close action closes the right-clicked tab
The system SHALL close the tab that was right-clicked when user selects "关闭".

#### Scenario: Close current tab via context menu
- **WHEN** user right-clicks on a tab and selects "关闭"
- **THEN** the right-clicked tab SHALL be closed
- **AND** if the tab has unsaved changes, the DirtyTabDialog SHALL appear before closing
- **AND** the context menu SHALL close

### Requirement: Close Others closes all tabs except the right-clicked one
The system SHALL close all open tabs except the one that was right-clicked when user selects "关闭其他".

#### Scenario: Close other tabs
- **WHEN** user right-clicks on a tab and selects "关闭其他"
- **THEN** all tabs except the right-clicked tab SHALL be closed
- **AND** for each tab with unsaved changes, the DirtyTabDialog SHALL appear in sequence
- **AND** the right-clicked tab SHALL remain open and become the active tab
- **AND** "关闭其他" SHALL be disabled when only one tab is open

### Requirement: Close All closes every open tab
The system SHALL close all open tabs when user selects "关闭全部".

#### Scenario: Close all tabs
- **WHEN** user right-clicks on any tab and selects "关闭全部"
- **THEN** all open tabs SHALL be closed
- **AND** for each tab with unsaved changes, the DirtyTabDialog SHALL appear in sequence
- **AND** after all tabs are closed, the editor area SHALL show the empty/welcome state

### Requirement: Close to the Left closes tabs to the left of the right-clicked tab
The system SHALL close all tabs positioned to the left of the right-clicked tab when user selects "关闭左侧".

#### Scenario: Close tabs to the left
- **WHEN** user right-clicks on a tab and selects "关闭左侧"
- **THEN** all tabs to the left of the right-clicked tab SHALL be closed
- **AND** for each tab with unsaved changes, the DirtyTabDialog SHALL appear in sequence
- **AND** the right-clicked tab SHALL remain open
- **AND** "关闭左侧" SHALL be disabled when the right-clicked tab is the leftmost tab

### Requirement: Close to the Right closes tabs to the right of the right-clicked tab
The system SHALL close all tabs positioned to the right of the right-clicked tab when user selects "关闭右侧".

#### Scenario: Close tabs to the right
- **WHEN** user right-clicks on a tab and selects "关闭右侧"
- **THEN** all tabs to the right of the right-clicked tab SHALL be closed
- **AND** for each tab with unsaved changes, the DirtyTabDialog SHALL appear in sequence
- **AND** the right-clicked tab SHALL remain open
- **AND** "关闭右侧" SHALL be disabled when the right-clicked tab is the rightmost tab
