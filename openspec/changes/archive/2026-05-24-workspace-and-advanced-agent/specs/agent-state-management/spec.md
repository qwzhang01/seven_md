## MODIFIED Requirements

### Requirement: useAgentStore manages Agent lifecycle and state
The system SHALL provide a Zustand store at `src/stores/useAgentStore.ts` that manages multiple Agent sessions, including running state, messages, tool calls, pending patches, pending confirmations, compaction status, and the active model id.

#### Scenario: Initial state
- **WHEN** useAgentStore is first accessed
- **THEN** `sessions` SHALL contain a single auto-created default session
- **AND** `activeSessionId` SHALL refer to the default session
- **AND** `activeModelId` SHALL be hydrated from localStorage or the AI config default
- **AND** the default session's `isRunning` SHALL be `false`
- **AND** its `messages`, `toolCalls`, `pendingPatches`, `pendingConfirmations` SHALL be empty arrays
- **AND** its `error` SHALL be `null` and `compactionInProgress` SHALL be `false`

#### Scenario: startAgent initiates an Agent run on the active session
- **WHEN** `startAgent(userMessage)` is called
- **THEN** the active session's `isRunning` SHALL be set to `true`
- **AND** a user message SHALL be added to that session's `messages`
- **AND** if the session does not yet have an `agentInstance`, one SHALL be created via `createMarkdownAgent({ modelId: session.modelId })`
- **AND** the Markdown Agent's `prompt()` SHALL be called with the user message
- **AND** the agent's events SHALL be subscribed and dispatched to the active session's state

#### Scenario: cancelAgent aborts the active session
- **WHEN** `cancelAgent()` is called while the active session's `isRunning` is `true`
- **THEN** the session's `agentInstance.abort()` SHALL be called
- **AND** the session's `isRunning` SHALL be set to `false`

#### Scenario: Agent events update store state
- **WHEN** a `MarkdownAgentEvent` of type `message` is received
- **THEN** the current assistant message in the source session's `messages` SHALL be updated with the new content

#### Scenario: Tool call events are recorded
- **WHEN** a `MarkdownAgentEvent` of type `tool_call` is received
- **THEN** a new entry SHALL be added to the session's `toolCalls` with `{ id, name, args, status: 'running', result: null }`

#### Scenario: Tool result events update tool call record
- **WHEN** a `MarkdownAgentEvent` of type `tool_result` is received
- **THEN** the corresponding entry in `toolCalls` SHALL be updated with `{ status: 'completed', result }`

#### Scenario: Patch events are added to pendingPatches
- **WHEN** a `MarkdownAgentEvent` of type `patch` is received
- **THEN** the patch SHALL be added to the session's `pendingPatches` array

#### Scenario: confirmation_required events are added to pendingConfirmations
- **WHEN** a `MarkdownAgentEvent` of type `confirmation_required` is received
- **THEN** the entry SHALL be added to the session's `pendingConfirmations`
- **AND** the UI SHALL be expected to call `approveConfirmation(id)` or `rejectConfirmation(id)`

#### Scenario: compaction events update compactionInProgress
- **WHEN** the runtime begins compaction
- **THEN** the session's `compactionInProgress` SHALL be set to `true`
- **AND** when a `compaction_done` or `compaction_failed` event is received, it SHALL be set back to `false`

#### Scenario: Done event finalizes the run
- **WHEN** a `MarkdownAgentEvent` of type `done` is received
- **THEN** the session's `isRunning` SHALL be set to `false`

#### Scenario: Error event records failure
- **WHEN** a `MarkdownAgentEvent` of type `error` is received
- **THEN** the session's `isRunning` SHALL be set to `false`
- **AND** its `error` SHALL be set to the error message

### Requirement: Patch apply/reject lifecycle
The system SHALL provide actions to apply or reject pending patches scoped to the active session.

#### Scenario: applyPatch applies a single patch to the editor
- **WHEN** `applyPatch(patchId)` is called with a valid pending patch ID in the active session
- **THEN** for `replace_selection` type: the system SHALL dispatch `editor:replace-selection` event with the patch's `newText`
- **AND** for `insert_at_cursor` type: the system SHALL dispatch `editor:insert` event with the patch's `text` at the correct position
- **AND** for `replace_document` type: the system SHALL update the active tab's content via `useFileStore`
- **AND** the patch SHALL be removed from the session's `pendingPatches`
- **AND** the patch's `applied` field SHALL be marked `true`

#### Scenario: rejectPatch removes a patch without applying
- **WHEN** `rejectPatch(patchId)` is called
- **THEN** the patch SHALL be removed from the active session's `pendingPatches`
- **AND** no editor modifications SHALL occur

#### Scenario: applyAllPatches applies all pending patches in order
- **WHEN** `applyAllPatches()` is called
- **THEN** all patches in the active session's `pendingPatches` SHALL be applied in creation order (by `createdAt`)
- **AND** that array SHALL be emptied

#### Scenario: rejectAllPatches clears all pending patches
- **WHEN** `rejectAllPatches()` is called
- **THEN** the active session's `pendingPatches` SHALL be emptied without applying any modifications

### Requirement: Agent message types for store
The system SHALL define message types suitable for the Agent UI.

#### Scenario: AgentMessage structure
- **WHEN** a message is stored in a session's `messages`
- **THEN** it SHALL have `id` (string), `role` ('user' | 'assistant'), `content` (string), and `timestamp` (number)
- **AND** assistant messages SHALL additionally have `toolCalls?: ToolCallRecord[]`

#### Scenario: ToolCallRecord structure
- **WHEN** a tool call is recorded
- **THEN** it SHALL have `id` (string), `name` (string), `args` (Record<string, unknown>), `status` ('running' | 'completed' | 'error'), and `result` (unknown | null)

#### Scenario: AgentSession structure
- **WHEN** a session entry is inspected
- **THEN** it SHALL have fields `{ id, title, createdAt, modelId, isRunning, messages, toolCalls, pendingPatches, pendingConfirmations, compactionInProgress, error, agentInstance }`

### Requirement: AIMode extended with agent option
The system SHALL extend the `AIMode` type in `useAIStore` to include `'agent'`.

#### Scenario: Agent mode available
- **WHEN** `useAIStore.getState().mode` is inspected
- **THEN** it SHALL accept `'agent'` as a valid value
- **AND** setting mode to `'agent'` SHALL not affect other mode states (messages, rewriteResult, etc.)
