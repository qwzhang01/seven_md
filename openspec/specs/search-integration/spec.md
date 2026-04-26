## Requirements

### Requirement: SearchPanel supports dual-mode search
The SearchPanel SHALL support both in-memory tab search and file system search depending on workspace state.

#### Scenario: No workspace uses in-memory tab search
- **WHEN** no folder is open (`folderPath === null`)
- **AND** the user types a query in the search input
- **THEN** the search SHALL be performed against all open tab contents (existing behavior)
- **AND** results SHALL show file name, line number, and highlighted match text

#### Scenario: With workspace uses backend file system search
- **WHEN** a folder is open (`folderPath !== null`)
- **AND** the user types a query in the search input
- **THEN** the search SHALL invoke the Tauri `search_in_files` command via `useFileSearch` hook
- **AND** the search type SHALL default to `fulltext`
- **AND** results SHALL show file name (relative path), line number, and snippet with highlighted match

#### Scenario: Search results are clickable and navigate to the match
- **WHEN** the user clicks on a search result
- **THEN** if the file is already open, the system SHALL switch to that tab
- **AND** if the file is not open, the system SHALL read and open it in a new tab
- **AND** the editor SHALL jump to the matching line number

#### Scenario: Search mode indicator shows current search scope
- **WHEN** no folder is open
- **THEN** the search status SHALL indicate "搜索已打开文件"
- **WHEN** a folder is open
- **THEN** the search status SHALL indicate "搜索工作区: {folderName}"

#### Scenario: Truncation warning is shown when results are limited
- **WHEN** backend search returns `truncated: true`
- **THEN** the search panel SHALL display a notice "结果已限制为 200 条"

### Requirement: SearchPanel preserves existing search options
The search options (case-sensitive, whole-word, regex) SHALL work in both modes.

#### Scenario: Search options apply to tab search mode
- **WHEN** in tab search mode
- **AND** the user toggles case-sensitive/whole-word/regex options
- **THEN** the in-memory search SHALL respect these options (existing behavior)

#### Scenario: Search options apply to backend search mode
- **WHEN** in backend search mode
- **AND** the user changes the query
- **THEN** the search SHALL use the backend fulltext search
- **AND** case-sensitivity SHALL be handled by the backend (currently case-insensitive)
