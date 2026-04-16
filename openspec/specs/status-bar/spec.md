## ADDED Requirements

### Requirement: Status bar displays cursor position
The system SHALL display the current cursor position (line and column) in the status bar.

#### Scenario: Cursor position updates
- **WHEN** the user moves the cursor in the editor
- **THEN** the status bar SHALL display the current line number
- **AND** the status bar SHALL display the current column number
- **AND** the format SHALL be "Ln [line], Col [column]"

#### Scenario: Editor is empty
- **WHEN** the editor has no content
- **THEN** the status bar SHALL display "Ln 1, Col 1"

### Requirement: Status bar displays document statistics
The system SHALL display document statistics (characters, words, lines) in the status bar.

#### Scenario: Document statistics update
- **WHEN** the user types or edits content
- **THEN** the status bar SHALL display the character count
- **AND** the status bar SHALL display the word count
- **AND** the status bar SHALL display the line count
- **AND** the format SHALL be "[characters] chars, [words] words, [lines] lines"

#### Scenario: Statistics calculation is debounced
- **WHEN** the user types continuously
- **THEN** the statistics SHALL NOT update on every keystroke
- **AND** the statistics SHALL update 300ms after the user stops typing

#### Scenario: Editor is empty
- **WHEN** the editor has no content
- **THEN** the status bar SHALL display "0 chars, 0 words, 0 lines"

### Requirement: Status bar displays file encoding
The system SHALL display the current file encoding in the status bar.

#### Scenario: UTF-8 encoded file
- **WHEN** a file is opened or created
- **THEN** the status bar SHALL display "UTF-8" as the encoding

#### Scenario: User hovers over encoding
- **WHEN** the user hovers the mouse over the encoding display
- **THEN** a tooltip SHALL explain the encoding type

### Requirement: Status bar displays line ending type
The system SHALL display the line ending type (LF or CRLF) in the status bar.

#### Scenario: File uses LF line endings
- **WHEN** the file uses LF (Unix) line endings
- **THEN** the status bar SHALL display "LF"

#### Scenario: File uses CRLF line endings
- **WHEN** the file uses CRLF (Windows) line endings
- **THEN** the status bar SHALL display "CRLF"

### Requirement: Status bar respects dark mode
The system SHALL display the status bar with appropriate colors for the current theme.

#### Scenario: Light mode enabled
- **WHEN** the application is in light mode
- **THEN** the status bar background SHALL be light gray (#F3F4F6)
- **AND** the text SHALL be dark (#6B7280)

#### Scenario: Dark mode enabled
- **WHEN** the application is in dark mode
- **THEN** the status bar background SHALL be dark gray (#1F2937)
- **AND** the text SHALL be light (#9CA3AF)

### Requirement: Status bar layout is organized
The system SHALL organize status bar information in a clear, readable layout.

#### Scenario: Status bar layout
- **WHEN** the status bar is displayed
- **THEN** the cursor position SHALL be on the left side
- **AND** the document statistics SHALL be in the center
- **AND** the file encoding and line ending SHALL be on the right side
- **AND** the status bar height SHALL be 24 pixels
