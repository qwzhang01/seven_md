## ADDED Requirements

### Requirement: Tool permission levels are enforced at execution time
The system SHALL define `ToolPermission = 'auto' | 'confirm' | 'deny'` and SHALL enforce the level when an Agent invokes a tool.

#### Scenario: auto-permission tool runs without prompting
- **WHEN** an Agent invokes a tool whose permission is `'auto'`
- **THEN** the tool's `execute` function SHALL run immediately
- **AND** no entry SHALL be added to `useAgentStore.pendingConfirmations`

#### Scenario: confirm-permission tool blocks until user approves
- **WHEN** an Agent invokes a tool whose permission is `'confirm'`
- **THEN** an entry SHALL be added to `useAgentStore.pendingConfirmations` with `{ id, toolName, args, preview, sessionId, createdAt }`
- **AND** the tool's `execute` function SHALL await a Promise resolved by the user's decision
- **AND** if approved, the underlying logic SHALL run and the result SHALL be returned to the Agent
- **AND** if rejected, `execute` SHALL throw an Error with message "用户拒绝执行此操作" so the Agent receives a tool error

#### Scenario: deny-permission tool is blocked at registry level
- **WHEN** a tool whose permission is `'deny'` is requested via `getTool(name)` for execution
- **THEN** the registry SHALL return an error tool that throws "工具已被禁用" when invoked
- **AND** no `pendingConfirmations` entry SHALL be created

### Requirement: pendingConfirmations are surfaced to the UI
The system SHALL expose `pendingConfirmations` from `useAgentStore` and SHALL provide actions to resolve them.

#### Scenario: approveConfirmation resolves the awaiting tool
- **WHEN** `approveConfirmation(id)` is called with a valid pending id
- **THEN** the awaiting Promise SHALL resolve with `{ approved: true }`
- **AND** the entry SHALL be removed from `pendingConfirmations`

#### Scenario: rejectConfirmation resolves with rejection
- **WHEN** `rejectConfirmation(id)` is called with a valid pending id
- **THEN** the awaiting Promise SHALL resolve with `{ approved: false }`
- **AND** the entry SHALL be removed from `pendingConfirmations`

#### Scenario: Confirmation timeout
- **WHEN** a pending confirmation is not resolved within 5 minutes
- **THEN** it SHALL be auto-rejected
- **AND** an error event SHALL be emitted via the agent event bus indicating timeout

### Requirement: Per-session permission overrides
The system SHALL allow users to temporarily override a tool's permission within the active session.

#### Scenario: Session override forces auto for one tool
- **WHEN** the user calls `setSessionToolPermission(toolName, 'auto')` for the active session
- **THEN** subsequent invocations of that tool within the session SHALL run without confirmation
- **AND** other sessions SHALL still use the default permission

#### Scenario: Session override is cleared when session ends
- **WHEN** a session is deleted via `deleteSession(id)`
- **THEN** all per-session permission overrides for that session SHALL be discarded

### Requirement: Default permissions for built-in tools
The system SHALL define the following defaults for built-in tools.

#### Scenario: Default permission map
- **WHEN** the registry initializes
- **THEN** the default permissions SHALL be:
  - `'auto'`: `get_current_document`, `get_selection`, `get_cursor_position`, `extract_headings`, `search_workspace`, `list_workspace_files`, `generate_toc`, `format_markdown_table`, `validate_markdown_links`
  - `'confirm'`: `replace_selection`, `insert_at_cursor`, `replace_document`, `read_workspace_file`, `create_markdown_file`, `generate_mermaid`
  - `'deny'`: (none by default)
