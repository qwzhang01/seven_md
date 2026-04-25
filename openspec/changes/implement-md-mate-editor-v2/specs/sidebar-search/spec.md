## ADDED Requirements

### Requirement: Search panel provides text search across workspace
The system SHALL provide a search panel allowing users to search for text across all files in the workspace.

#### Scenario: Search panel layout
- **WHEN** the search panel is active via activity bar
- **THEN** it SHALL display:
  - A search input field with 🔍 icon placeholder "搜索内容"
  - Option toggles: Aa (case sensitive), W (whole word), .* (regex)
  - A results list area below

#### Scenario: Real-time search as user types
- **WHEN** user types in the search input field
- **THEN** search results SHALL update in real-time (debounced by 200ms) as they type
- **AND** matching files SHALL be listed with match count per file
- **AND** each match SHALL show the line number and surrounding context

### Requirement: Search supports filtering options
The system SHALL provide search filter options for case sensitivity, whole word, and regex matching.

#### Scenario: Case sensitive toggle
- **WHEN** user checks the "Aa" (case sensitive) option
- **THEN** subsequent searches SHALL distinguish between uppercase and lowercase letters
- **AND** the toggle state SHALL persist during the session

#### Scenario: Whole word toggle
- **WHEN** user checks the "W" (whole word) option
- **THEN** searches SHALL only match complete words, not partial matches within words

#### Scenario: Regex mode toggle
- **WHEN** user checks the ".*" (regex) option
- **THEN** the search input SHALL interpret the query as a regular expression pattern

### Requirement: Clicking search result navigates to location
The system SHALL allow users to navigate to specific search results.

#### Scenario: Click result jumps to file and line
- **WHEN** user clicks a search result entry
- **THEN** the corresponding file SHALL be opened (or activated if already open)
- **AND** the editor SHALL scroll to and highlight the matching line
- **AND** the matched text SHALL be highlighted in the editor

#### Scenario: Match count displayed
- **WHEN** search returns results
- **THEN** each file entry SHALL show "(N处)" indicating the number of matches in that file

#### Scenario: No results message
- **WHEN** search returns no matches
- **THEN** "无结果" message SHALL be displayed in the results area
