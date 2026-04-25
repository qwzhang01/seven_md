## ADDED Requirements

### Requirement: Find replace bar provides inline search and replace
The system SHALL display a find replace bar overlaying the editor area for searching and replacing text within the current document.

#### Scenario: Find bar opens
- **WHEN** user presses Ctrl+F OR selects "查找" from Edit menu
- **THEN** a find bar SHALL appear at the bottom of the editor pane containing:
  - A 🔍 search input field
  - Match count text (or "无结果")
  - ▲ Previous match / ▼ Next match navigation buttons
  - ✕ Close button

#### Scenario: Replace bar opens
- **WHEN** user presses Ctrl+H OR selects "替换" from Edit menu
- **THEN** both find AND replace rows SHALL appear:
  - Row 1: 🔍 [Find input] [count] [▲] [▼]
  - Row 2: 🔁 [Replace input] [Replace] [全部替换]
  - Row 3: [☐ Aa] [☐ W] [☐ .*]                    [✕]

### Requirement: Find highlights matches in real-time
The system SHALL highlight all matching occurrences in the editor as the user types their search query.

#### Scenario: Real-time highlight
- **WHEN** user types in the find input field
- **THEN** all matching text in the editor SHALL be highlighted immediately
- **AND** the current match (the one the navigator points to) SHALL be highlighted more prominently (e.g., with accent background)
- **AND** non-current matches SHALL have a subtle highlight (e.g., yellow background)

#### Scenario: Match count updates
- **WHEN** search results are found
- **THEN** the total match count SHALL be displayed (e.g., "3 处")
- **OR** if no matches found, "无结果" SHALL be shown in gray

### Requirement: Navigate between matches
The system SHALL allow navigating between search results.

#### Scenario: Next match navigation
- **WHEN** user clicks the ▼ button or presses Enter in the find field
- **THEN** the selection SHALL move to the next match below the current position
- **AND** if past the last match, it SHALL wrap to the first match

#### Scenario: Previous match navigation
- **WHEN** user clicks the ▲ button or presses Shift+Enter
- **THEN** the selection SHALL move to the previous match above the current position
- **AND** if before the first match, it SHALL wrap to the last match

### Requirement: Replace individual or all matches
The system SHALL support replacing matches one at a time or all at once.

#### Scenario: Replace current match
- **WHEN** user has entered replacement text AND clicks "替换"
- **THEN** the currently highlighted match SHALL be replaced with the replacement text
- **AND** selection SHALL advance to the next match (if any)

#### Scenario: Replace all matches
- **WHEN** user has entered replacement text AND clicks "全部替换"
- **THEN** ALL matches in the document SHALL be replaced simultaneously
- **AND** the total number of replacements SHALL be shown briefly (e.g., "已替换 5 处")

### Requirement: Search options control matching behavior
The system SHALL provide options to refine search behavior.

#### Scenario: Case sensitive option
- **WHEN** "Aa" (case sensitive) checkbox is checked
- **THEN** searches SHALL distinguish between uppercase and lowercase

#### Scenario: Whole word option
- **WHEN** "W" (whole word) checkbox is checked
- **THEN** searches SHALL only match complete words, not partial substrings

#### Scenario: Regex option
- **WHEN** ".*" (regex) checkbox is checked
- **THEN** the search query SHALL be interpreted as a regular expression pattern

### Requirement: Find bar can be closed
The system SHALL allow closing the find replace bar.

#### Scenario: Close with Escape or X
- **WHEN** the find replace bar is open
- **AND** user presses Escape OR clicks the ✕ button
- **THEN** the find replace bar SHALL close
- **AND** all match highlights SHALL be removed from the editor
