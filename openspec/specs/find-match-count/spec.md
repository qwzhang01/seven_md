## ADDED Requirements

### Requirement: Find replace bar displays match count
The system SHALL display the current search match count in the find replace bar.

#### Scenario: Display total match count
- **WHEN** user enters a search query and matches are found
- **THEN** the total number of matches SHALL be displayed (e.g., "3 of 12")

#### Scenario: Display no results
- **WHEN** user enters a search query and no matches are found
- **THEN** "无结果" SHALL be displayed in gray text

#### Scenario: Match count updates in real-time
- **WHEN** user modifies the search query
- **THEN** the match count SHALL update immediately to reflect the new results

#### Scenario: Clear count when bar closes
- **WHEN** the find replace bar is closed
- **THEN** the match count SHALL be reset and not displayed
