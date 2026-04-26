## MODIFIED Requirements

### Requirement: Editor supports auto-pairing of brackets and quotes
The system SHALL automatically insert matching closing brackets, quotation marks, and backticks when opening ones are typed.

#### Scenario: Auto-pair parentheses
- **WHEN** user types `(` in the editor
- **THEN** `()` SHALL be inserted with the cursor positioned between them

#### Scenario: Auto-pair square brackets
- **WHEN** user types `[` in the editor
- **THEN** `[]` SHALL be inserted with cursor between

#### Scenario: Auto-pair curly braces
- **WHEN** user types `{` in the editor
- **THEN** `{}` SHALL be inserted with cursor between

#### Scenario: Auto-pair quotes
- **WHEN** user types `"` or `'`
- **THEN** the matching closing quote SHALL be automatically inserted

#### Scenario: Auto-pair backticks
- **WHEN** user types `` ` `` in the editor
- **THEN** `` `` `` SHALL be inserted with cursor between

#### Scenario: Skip over closing bracket
- **WHEN** the cursor is immediately before a closing bracket/quote
- **AND** user types that same closing character
- **THEN** the cursor SHALL move past the closing character without inserting a new one
