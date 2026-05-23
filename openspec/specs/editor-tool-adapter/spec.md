## ADDED Requirements

### Requirement: Editor read tools expose current document state to Agent
The system SHALL provide read-only AgentTool implementations that expose editor state via Zustand store access.

#### Scenario: get_current_document returns active file content and metadata
- **WHEN** the `get_current_document` tool is executed
- **THEN** it SHALL return an object with `content` (string), `path` (string or null), and `title` (string) fields
- **AND** `content` SHALL equal the `content` field of the active tab from `useFileStore.getState().getActiveTab()`
- **AND** `path` SHALL equal the `path` field of the active tab
- **AND** `title` SHALL be extracted from the first `# ` heading in the content, or the file name if no heading exists

#### Scenario: get_current_document when no file is open
- **WHEN** the `get_current_document` tool is executed and no tab is active
- **THEN** it SHALL return an object with `content: ""`, `path: null`, and `title: "Untitled"`

#### Scenario: get_selection returns selected text and range
- **WHEN** the `get_selection` tool is executed
- **THEN** it SHALL return an object with `text` (string), `from` (number), and `to` (number) fields
- **AND** `text` SHALL equal `useAIStore.getState().selectedText` if non-null, otherwise the text derived from `useEditorStore.getState().selection`
- **AND** `from` and `to` SHALL represent the character offsets of the selection

#### Scenario: get_selection when nothing is selected
- **WHEN** the `get_selection` tool is executed and no text is selected
- **THEN** it SHALL return `{ text: "", from: 0, to: 0 }`

#### Scenario: get_cursor_position returns current cursor location
- **WHEN** the `get_cursor_position` tool is executed
- **THEN** it SHALL return an object with `line` (number) and `column` (number) fields
- **AND** the values SHALL match `useEditorStore.getState().cursorPosition`

#### Scenario: extract_headings returns document outline
- **WHEN** the `extract_headings` tool is executed
- **THEN** it SHALL return an array of `{ level: number, text: string, line: number }` objects
- **AND** each entry SHALL correspond to an ATX-style heading (`# ` through `###### `) in the document
- **AND** `level` SHALL be the number of `#` characters (1-6)
- **AND** `text` SHALL be the heading text with leading/trailing whitespace trimmed
- **AND** `line` SHALL be the 1-based line number of the heading

### Requirement: Editor write tools generate MarkdownPatch without immediate execution
The system SHALL provide write AgentTool implementations that return `MarkdownPatch` objects instead of directly modifying the document.

#### Scenario: replace_selection generates a patch
- **WHEN** the `replace_selection` tool is executed with `{ newText: string }`
- **THEN** it SHALL return a `MarkdownPatch` of type `replace_selection`
- **AND** the patch SHALL include `from` and `to` matching the current selection range
- **AND** the patch SHALL include `newText` with the provided replacement text
- **AND** the patch SHALL include `applied: false` and `requiresConfirmation: true`

#### Scenario: replace_selection when nothing is selected
- **WHEN** the `replace_selection` tool is executed and no text is selected
- **THEN** it SHALL return an error result with message "没有选中任何文本"

#### Scenario: insert_at_cursor generates a patch
- **WHEN** the `insert_at_cursor` tool is executed with `{ text: string }`
- **THEN** it SHALL return a `MarkdownPatch` of type `insert_at_cursor`
- **AND** the patch SHALL include `position` matching the current cursor offset in the document
- **AND** the patch SHALL include the provided `text`
- **AND** the patch SHALL include `applied: false` and `requiresConfirmation: true`

#### Scenario: replace_document generates a patch
- **WHEN** the `replace_document` tool is executed with `{ newContent: string }`
- **THEN** it SHALL return a `MarkdownPatch` of type `replace_document`
- **AND** the patch SHALL include `newContent` with the full replacement text
- **AND** the patch SHALL include `applied: false` and `requiresConfirmation: true`

### Requirement: All editor tools conform to Pi AgentTool interface
The system SHALL define each tool with `name`, `description`, `schema`, and `execute` fields matching the `AgentTool` type from `@pi/agent`.

#### Scenario: Tool schema uses TypeBox
- **WHEN** a tool's `schema` field is inspected
- **THEN** it SHALL be a value created by `@sinclair/typebox` `Type.Object()` call
- **AND** it SHALL define the exact parameters accepted by the tool's `execute` function

#### Scenario: Tool execute returns structured result
- **WHEN** a tool's `execute` function is called with valid arguments
- **THEN** it SHALL return a plain object (JSON-serializable)
- **AND** read tools SHALL return the requested data
- **AND** write tools SHALL return a `MarkdownPatch` object

#### Scenario: Tool name uses snake_case
- **WHEN** the tool registry lists all tools
- **THEN** each tool's `name` field SHALL use snake_case format
- **AND** the names SHALL be: `get_current_document`, `get_selection`, `get_cursor_position`, `extract_headings`, `replace_selection`, `insert_at_cursor`, `replace_document`

### Requirement: Tool registry provides centralized tool management
The system SHALL provide a `toolRegistry` module at `src/services/ai/agent/toolRegistry.ts` for registering and querying tools.

#### Scenario: Register a tool with permission level
- **WHEN** `registerTool(tool, permission)` is called with an AgentTool and a permission level
- **THEN** the tool SHALL be stored in the registry
- **AND** it SHALL be retrievable by `getTool(name)`

#### Scenario: Get all tools as array
- **WHEN** `getAllTools()` is called
- **THEN** it SHALL return an array of all registered `AgentTool` objects
- **AND** the array SHALL be suitable for passing directly to Pi `Agent` constructor's `tools` option

#### Scenario: Get tool permission level
- **WHEN** `getToolPermission(name)` is called with a registered tool name
- **THEN** it SHALL return the tool's permission level: `'auto'`, `'confirm'`, or `'deny'`

#### Scenario: Default permission assignments
- **WHEN** the editor tools are registered during module initialization
- **THEN** `get_current_document`, `get_selection`, `get_cursor_position`, `extract_headings` SHALL have permission `'auto'`
- **AND** `replace_selection`, `insert_at_cursor` SHALL have permission `'confirm'`
- **AND** `replace_document` SHALL have permission `'confirm'`
