## ADDED Requirements

### Requirement: Workspace path boundary guard
The system SHALL provide a `workspaceGuard` module at `src/services/ai/agent/tools/workspaceGuard.ts` that validates and normalizes any path used by workspace-level Agent tools.

#### Scenario: Reject path outside workspace
- **WHEN** `assertInsideWorkspace(path)` is called with a path that resolves outside the current `useWorkspaceStore.workspacePath`
- **THEN** it SHALL throw an Error with message containing "路径越界"
- **AND** the workspace tool SHALL NOT invoke any Tauri command

#### Scenario: Accept relative path inside workspace
- **WHEN** `assertInsideWorkspace(path)` is called with a relative path like `notes/foo.md`
- **THEN** it SHALL return the absolute normalized path joined to `workspacePath`
- **AND** the returned path SHALL start with the workspace root

#### Scenario: Reject path traversal payloads
- **WHEN** `assertInsideWorkspace('../../etc/passwd')` is called
- **THEN** it SHALL throw an Error
- **AND** the same SHALL hold for variants such as `./..//../`

#### Scenario: Reject when no workspace open
- **WHEN** `assertInsideWorkspace(path)` is called and `useWorkspaceStore.getState().workspacePath` is null
- **THEN** it SHALL throw an Error with message "未打开工作区"

### Requirement: search_workspace tool searches workspace markdown files
The system SHALL register an AgentTool `search_workspace` at `src/services/ai/agent/tools/fileTools.ts`.

#### Scenario: Search by content
- **WHEN** the `search_workspace` tool is executed with `{ query: string, type: 'content' }`
- **THEN** it SHALL invoke the Tauri `search_in_files` command with the workspace root and query
- **AND** the result SHALL be an array of `{ path: string, line: number, snippet: string }` objects
- **AND** results SHALL be limited to the top 50 entries

#### Scenario: Search by filename
- **WHEN** the `search_workspace` tool is executed with `{ query: string, type: 'filename' }`
- **THEN** it SHALL list workspace files whose name contains the query (case-insensitive)
- **AND** the result SHALL be an array of `{ path: string }` objects

#### Scenario: Permission level
- **WHEN** the registry is queried for `search_workspace`'s permission
- **THEN** it SHALL be `'auto'`

### Requirement: read_workspace_file tool reads markdown content
The system SHALL register an AgentTool `read_workspace_file`.

#### Scenario: Read existing markdown file
- **WHEN** the `read_workspace_file` tool is executed with `{ path: string }`
- **THEN** the path SHALL be validated via `assertInsideWorkspace`
- **AND** the file SHALL be read via the Tauri `read_file` command
- **AND** the result SHALL be `{ content: string, path: string, sizeBytes: number }`

#### Scenario: Reject non-markdown files
- **WHEN** the `read_workspace_file` tool is executed with a path not ending in `.md` or `.markdown`
- **THEN** it SHALL return an error result with message "仅支持读取 Markdown 文件"

#### Scenario: Reject oversized files
- **WHEN** the `read_workspace_file` tool reads a file larger than 200KB
- **THEN** it SHALL return an error result indicating the file is too large
- **AND** the message SHALL suggest using `search_workspace` instead

#### Scenario: Permission level
- **WHEN** the registry is queried for `read_workspace_file`'s permission
- **THEN** it SHALL be `'confirm'`

### Requirement: create_markdown_file tool creates new files
The system SHALL register an AgentTool `create_markdown_file`.

#### Scenario: Create new file with content
- **WHEN** the `create_markdown_file` tool is executed with `{ path: string, content: string }`
- **THEN** the path SHALL be validated via `assertInsideWorkspace`
- **AND** the file SHALL be created via the Tauri `create_file` command
- **AND** the result SHALL be `{ created: true, path: string }`

#### Scenario: Reject when file already exists
- **WHEN** the target path already exists
- **THEN** the tool SHALL return an error result with message containing "文件已存在"
- **AND** no file SHALL be written

#### Scenario: Reject non-markdown extension
- **WHEN** the `path` does not end in `.md` or `.markdown`
- **THEN** the tool SHALL return an error result with message "仅支持创建 Markdown 文件"

#### Scenario: Permission level
- **WHEN** the registry is queried for `create_markdown_file`'s permission
- **THEN** it SHALL be `'confirm'`
- **AND** the confirmation entry SHALL include a preview of the path and first 1KB of content

### Requirement: list_workspace_files tool returns workspace tree
The system SHALL register an AgentTool `list_workspace_files`.

#### Scenario: List markdown files only
- **WHEN** the `list_workspace_files` tool is executed
- **THEN** it SHALL invoke the Tauri `read_directory` command recursively from the workspace root
- **AND** the result SHALL be an array of `{ path: string, type: 'file' | 'directory' }`
- **AND** files SHALL be filtered to `.md` / `.markdown` extensions
- **AND** the maximum number of entries SHALL be 500 (excess SHALL be truncated with a note)

#### Scenario: Permission level
- **WHEN** the registry is queried for `list_workspace_files`'s permission
- **THEN** it SHALL be `'auto'`

### Requirement: Workspace tools are registered in toolRegistry
The system SHALL register the four workspace tools in `toolRegistry` during module initialization.

#### Scenario: Tools are returned by getAllTools
- **WHEN** `getAllTools()` is called
- **THEN** the returned array SHALL include all four workspace tools (`search_workspace`, `read_workspace_file`, `create_markdown_file`, `list_workspace_files`) in addition to existing editor tools

#### Scenario: Workspace tools require open workspace
- **WHEN** any workspace tool is executed and `useWorkspaceStore.workspacePath` is null
- **THEN** the tool SHALL return an error result with message "未打开工作区，无法使用工作区工具"
