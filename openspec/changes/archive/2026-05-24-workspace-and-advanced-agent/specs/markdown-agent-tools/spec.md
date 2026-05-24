## ADDED Requirements

### Requirement: generate_toc tool builds a table of contents
The system SHALL register an AgentTool `generate_toc` at `src/services/ai/agent/tools/markdownTools.ts`.

#### Scenario: Generate TOC from current document
- **WHEN** the `generate_toc` tool is executed with `{ maxDepth?: number }` (default 3)
- **THEN** it SHALL read the current document via the editor read tools
- **AND** it SHALL build a Markdown bullet list whose items are `[heading text](#heading-anchor)` indented by depth
- **AND** it SHALL return a `MarkdownPatch` of type `insert_at_cursor` containing the TOC text

#### Scenario: Empty document
- **WHEN** the document has no headings
- **THEN** the tool SHALL return an error result with message "文档没有可用标题"

### Requirement: format_markdown_table tool normalizes a Markdown table
The system SHALL register an AgentTool `format_markdown_table`.

#### Scenario: Format a selection containing a markdown table
- **WHEN** the `format_markdown_table` tool is executed with `{ tableText: string }`
- **THEN** it SHALL parse the GFM table, pad columns to equal width, and reassemble it
- **AND** it SHALL return a `MarkdownPatch` of type `replace_selection` with `newText` set to the formatted table

#### Scenario: Invalid table input
- **WHEN** the input does not contain a valid GFM table
- **THEN** the tool SHALL return an error result with message containing "不是有效的 Markdown 表格"

### Requirement: validate_markdown_links tool checks for broken links
The system SHALL register an AgentTool `validate_markdown_links`.

#### Scenario: Inspect all links in current document
- **WHEN** `validate_markdown_links` is executed (no args)
- **THEN** it SHALL read the active document
- **AND** it SHALL return an array of `{ url: string, line: number, status: 'ok' | 'broken' | 'unchecked' }`
- **AND** local relative links SHALL be checked against the workspace via `read_file`/file existence (without raising the path guard error to the user; missing files report `'broken'`)
- **AND** external (`http(s)://`) links SHALL be reported as `'unchecked'` to avoid network calls in v1

### Requirement: generate_mermaid tool drafts a Mermaid diagram
The system SHALL register an AgentTool `generate_mermaid`.

#### Scenario: Insert mermaid block at cursor
- **WHEN** `generate_mermaid` is executed with `{ description: string, type?: 'flowchart' | 'sequence' | 'class' }`
- **THEN** the tool SHALL produce a Mermaid code block fenced with ```mermaid
- **AND** it SHALL return a `MarkdownPatch` of type `insert_at_cursor` containing the fenced block

#### Scenario: Permission level
- **WHEN** the registry is queried for `generate_mermaid`'s permission
- **THEN** it SHALL be `'confirm'`

### Requirement: Markdown tools are registered with the toolRegistry
The system SHALL register all four Markdown tools during module initialization.

#### Scenario: Tools available via getAllTools
- **WHEN** `getAllTools()` is called
- **THEN** the result SHALL include `generate_toc`, `format_markdown_table`, `validate_markdown_links`, `generate_mermaid`
