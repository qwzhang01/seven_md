## ADDED Requirements

### Requirement: Tool registry exposes permission queries with session overrides
The system SHALL extend `toolRegistry` to expose permissions that may be overridden per session.

#### Scenario: getEffectivePermission combines defaults and session overrides
- **WHEN** `getEffectivePermission(name, sessionId)` is called
- **THEN** it SHALL return the override defined for that session if present
- **AND** otherwise it SHALL return the default permission registered for the tool

#### Scenario: setSessionPermissionOverride updates the registry
- **WHEN** `setSessionPermissionOverride(sessionId, name, permission)` is called
- **THEN** subsequent `getEffectivePermission(name, sessionId)` calls SHALL return the override

#### Scenario: clearSessionOverrides removes overrides
- **WHEN** `clearSessionOverrides(sessionId)` is called
- **THEN** every override for that session SHALL be removed

### Requirement: Tool registry registers workspace and markdown tools
The system SHALL register the workspace and markdown tools alongside the existing editor tools during module initialization.

#### Scenario: getAllTools includes new tool sets
- **WHEN** `getAllTools()` is called
- **THEN** the returned array SHALL include all editor tools (the original 7) plus:
  - workspace tools: `search_workspace`, `read_workspace_file`, `create_markdown_file`, `list_workspace_files`
  - markdown tools: `generate_toc`, `format_markdown_table`, `validate_markdown_links`, `generate_mermaid`

#### Scenario: Tools follow Pi AgentTool interface
- **WHEN** any newly added tool is inspected
- **THEN** it SHALL conform to the existing AgentTool interface (`name`, `description`, `schema`, `execute`)

### Requirement: Tool execute is wrapped with permission gating
The system SHALL wrap registered tool `execute` functions with a permission gate.

#### Scenario: auto tools run unwrapped
- **WHEN** a tool's effective permission is `'auto'`
- **THEN** the wrapped `execute` SHALL invoke the underlying logic directly

#### Scenario: confirm tools await user decision
- **WHEN** a tool's effective permission is `'confirm'`
- **THEN** the wrapped `execute` SHALL push a `confirmation_required` event into the agent event stream
- **AND** await the resolution from `useAgentStore.approveConfirmation` / `rejectConfirmation`
- **AND** if approved, invoke the underlying logic; if rejected, throw `Error('用户拒绝执行此操作')`

#### Scenario: deny tools throw immediately
- **WHEN** a tool's effective permission is `'deny'`
- **THEN** the wrapped `execute` SHALL throw `Error('工具已被禁用')` without invoking the underlying logic

### Requirement: Workspace tools fail fast when no workspace is open
The system SHALL ensure every workspace tool refuses execution when `useWorkspaceStore.workspacePath` is null.

#### Scenario: Workspace tool guards against missing workspace
- **WHEN** any of `search_workspace`, `read_workspace_file`, `create_markdown_file`, `list_workspace_files` is invoked while `useWorkspaceStore.workspacePath` is null
- **THEN** the tool SHALL return an error result with message "未打开工作区，无法使用工作区工具"
- **AND** no Tauri command SHALL be invoked
