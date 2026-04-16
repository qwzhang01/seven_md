## Requirements

### Requirement: Search panel is accessible from the sidebar
The system SHALL provide a search panel within the sidebar that users can open to search files and content in the current workspace folder.

#### Scenario: Search panel toggle via keyboard shortcut
- **WHEN** user presses Cmd+Shift+F (macOS) or Ctrl+Shift+F (Windows/Linux)
- **AND** a folder is open
- **THEN** the system SHALL show the search panel in the sidebar and focus the search input

#### Scenario: Search panel toggle via sidebar icon
- **WHEN** user clicks the search icon in the sidebar header
- **THEN** the system SHALL toggle the search panel visibility

#### Scenario: Search panel disabled when no folder is open
- **WHEN** no folder is currently open
- **THEN** the search panel input SHALL be disabled
- **AND** the system SHALL display a message indicating that a folder must be opened to search

### Requirement: User can search files by filename
The system SHALL allow users to filter workspace files by filename using a fuzzy match.

#### Scenario: Filename search returns matching results
- **WHEN** user selects the "Files" search mode
- **AND** user types a query in the search input
- **THEN** the system SHALL display a list of files whose names fuzzy-match the query
- **AND** each result SHALL show the relative file path within the workspace folder

#### Scenario: Filename search is case-insensitive
- **WHEN** user types a query in any combination of upper and lower case
- **THEN** the system SHALL return results regardless of the filename's case

#### Scenario: No filename results
- **WHEN** the query does not match any filename in the workspace
- **THEN** the system SHALL display a "No results found" message

### Requirement: User can search file contents (full-text search)
The system SHALL allow users to search for text across all Markdown files in the open folder.

#### Scenario: Full-text search returns matching lines
- **WHEN** user selects the "Text" search mode
- **AND** user types a query of at least 2 characters
- **THEN** the system SHALL scan all `.md` files in the open folder recursively
- **AND** display results grouped by file, each showing the line number and a text snippet containing the match

#### Scenario: Full-text search is case-insensitive
- **WHEN** user types a query in any combination of upper and lower case
- **THEN** the system SHALL return lines that match regardless of case

#### Scenario: Full-text search shows loading state
- **WHEN** a full-text search is in progress
- **THEN** the system SHALL display a loading indicator in the results area

#### Scenario: Full-text search result count is capped
- **WHEN** the number of matching lines exceeds 200
- **THEN** the system SHALL return the first 200 results
- **AND** display a notice that results are truncated

#### Scenario: No full-text results
- **WHEN** the query does not match any content in any `.md` file
- **THEN** the system SHALL display a "No results found" message

### Requirement: User can navigate to a search result
The system SHALL allow users to open a file and navigate to the matching line by clicking a search result.

#### Scenario: Clicking a result opens the file
- **WHEN** user clicks on a search result
- **THEN** the system SHALL open the corresponding file in the editor

#### Scenario: Clicking a full-text result scrolls to the matching line
- **WHEN** user clicks on a full-text search result
- **THEN** the system SHALL scroll the editor to the line number of the match
- **AND** highlight or place the cursor at the matching line

### Requirement: Search input is debounced
The system SHALL debounce the search input to avoid excessive backend calls during typing.

#### Scenario: Search triggers after typing pause
- **WHEN** user types in the search input
- **THEN** the system SHALL wait 300 ms after the last keystroke before executing the search
