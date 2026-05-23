## ADDED Requirements

### Requirement: MarkdownPatch type defines structured document modifications
The system SHALL define a `MarkdownPatch` discriminated union type at `src/services/ai/agent/patchProtocol.ts` that describes all possible document modifications.

#### Scenario: replace_selection patch type
- **WHEN** a patch has `type: 'replace_selection'`
- **THEN** it SHALL include `from: number` (start character offset)
- **AND** it SHALL include `to: number` (end character offset)
- **AND** it SHALL include `newText: string` (replacement text)
- **AND** it SHALL include optional `description?: string`

#### Scenario: insert_at_cursor patch type
- **WHEN** a patch has `type: 'insert_at_cursor'`
- **THEN** it SHALL include `position: number` (character offset for insertion)
- **AND** it SHALL include `text: string` (text to insert)
- **AND** it SHALL include optional `description?: string`

#### Scenario: replace_document patch type
- **WHEN** a patch has `type: 'replace_document'`
- **THEN** it SHALL include `newContent: string` (full replacement document)
- **AND** it SHALL include optional `description?: string`

#### Scenario: insert_after_heading patch type
- **WHEN** a patch has `type: 'insert_after_heading'`
- **THEN** it SHALL include `headingLevel: number` (1-6)
- **AND** it SHALL include `headingText: string` (heading to locate)
- **AND** it SHALL include `content: string` (content to insert after the heading)
- **AND** it SHALL include optional `description?: string`

#### Scenario: append_section patch type
- **WHEN** a patch has `type: 'append_section'`
- **THEN** it SHALL include `content: string` (content to append at document end)
- **AND** it SHALL include optional `description?: string`

### Requirement: Patch metadata tracks confirmation state
The system SHALL include metadata fields on each patch for tracking its lifecycle.

#### Scenario: Patch includes id and status
- **WHEN** a `MarkdownPatch` is created by a tool
- **THEN** it SHALL include `id: string` (unique identifier, UUID format)
- **AND** it SHALL include `applied: boolean` (initially `false`)
- **AND** it SHALL include `requiresConfirmation: boolean` (based on tool permission level)
- **AND** it SHALL include `createdAt: number` (Unix timestamp in milliseconds)

### Requirement: Markdown utility functions support tool implementations
The system SHALL provide utility functions at `src/utils/markdownUtils.ts` for Markdown content analysis.

#### Scenario: extractTitle returns first heading
- **WHEN** `extractTitle(content)` is called with Markdown content containing a `# ` heading
- **THEN** it SHALL return the text of the first level-1 heading
- **AND** it SHALL strip the leading `# ` and any trailing whitespace

#### Scenario: extractTitle returns fallback
- **WHEN** `extractTitle(content)` is called with Markdown content that has no `# ` heading
- **THEN** it SHALL return `"Untitled"`

#### Scenario: extractHeadings returns all ATX headings
- **WHEN** `extractHeadings(content)` is called
- **THEN** it SHALL return an array of `{ level, text, line }` for each ATX heading
- **AND** headings inside fenced code blocks (``` or ~~~) SHALL be excluded
- **AND** `line` SHALL be 1-based

#### Scenario: calculateCursorOffset converts line/column to character offset
- **WHEN** `calculateCursorOffset(content, line, column)` is called
- **THEN** it SHALL return the 0-based character offset in the content string
- **AND** `line` SHALL be 1-based and `column` SHALL be 1-based

#### Scenario: getSelectionText extracts text by offset range
- **WHEN** `getSelectionText(content, from, to)` is called
- **THEN** it SHALL return `content.slice(from, to)`
