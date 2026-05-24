# agent-state-management Specification

## Purpose

Defines the Zustand store (`useAgentStore`) responsible for managing the Markdown Agent's runtime state, including conversation messages, tool call history, pending patches, error state, and the patch apply/reject lifecycle.

## Requirements

### Requirement: useAgentStore manages Agent lifecycle and state
The system SHALL provide a Zustand store at `src/stores/useAgentStore.ts` that manages Agent running state, messages, tool calls, and pending patches.

#### Scenario: Initial state
- **WHEN** useAgentStore is first accessed
- **THEN** `isRunning` SHALL be `false`
- **AND** `messages` SHALL be an empty array
- **AND** `toolCalls` SHALL be an empty array
- **AND** `pendingPatches` SHALL be an empty array
- **AND** `error` SHALL be `null`

#### Scenario: startAgent initiates an Agent run
- **WHEN** `startAgent(userMessage)` is called
- **THEN** `isRunning` SHALL be set to `true`
- **AND** a user message SHALL be added to `messages`
- **AND** the Markdown Agent's `prompt()` SHALL be called with the user message
- **AND** the agent's events SHALL be subscribed and dispatched to the store

#### Scenario: cancelAgent aborts the current run
- **WHEN** `cancelAgent()` is called while `isRunning` is `true`
- **THEN** the agent's `abort()` SHALL be called
- **AND** `isRunning` SHALL be set to `false`

#### Scenario: Agent events update store state
- **WHEN** a `MarkdownAgentEvent` of type `message` is received
- **THEN** the current assistant message in `messages` SHALL be updated with the new content

#### Scenario: Tool call events are recorded
- **WHEN** a `MarkdownAgentEvent` of type `tool_call` is received
- **THEN** a new entry SHALL be added to `toolCalls` with `{ id, name, args, status: 'running', result: null }`

#### Scenario: Tool result events update tool call record
- **WHEN** a `MarkdownAgentEvent` of type `tool_result` is received
- **THEN** the corresponding entry in `toolCalls` SHALL be updated with `{ status: 'completed', result }`

#### Scenario: Patch events are added to pendingPatches
- **WHEN** a `MarkdownAgentEvent` of type `patch` is received
- **THEN** the patch SHALL be added to `pendingPatches` array

#### Scenario: Done event finalizes the run
- **WHEN** a `MarkdownAgentEvent` of type `done` is received
- **THEN** `isRunning` SHALL be set to `false`

#### Scenario: Error event records failure
- **WHEN** a `MarkdownAgentEvent` of type `error` is received
- **THEN** `isRunning` SHALL be set to `false`
- **AND** `error` SHALL be set to the error message

### Requirement: Patch apply/reject lifecycle
The system SHALL provide actions to apply or reject pending patches.

#### Scenario: applyPatch applies a single patch to the editor
- **WHEN** `applyPatch(patchId)` is called with a valid pending patch ID
- **THEN** for `replace_selection` type: the system SHALL dispatch `editor:replace-selection` event with the patch's `newText`
- **AND** for `insert_at_cursor` type: the system SHALL dispatch `editor:insert` event with the patch's `text` at the correct position
- **AND** for `replace_document` type: the system SHALL update the active tab's content via `useFileStore`
- **AND** the patch SHALL be removed from `pendingPatches`
- **AND** the patch's `applied` field SHALL be marked `true`

#### Scenario: rejectPatch removes a patch without applying
- **WHEN** `rejectPatch(patchId)` is called
- **THEN** the patch SHALL be removed from `pendingPatches`
- **AND** no editor modifications SHALL occur

#### Scenario: applyAllPatches applies all pending patches in order
- **WHEN** `applyAllPatches()` is called
- **THEN** all patches in `pendingPatches` SHALL be applied in creation order (by `createdAt`)
- **AND** `pendingPatches` SHALL be emptied

#### Scenario: rejectAllPatches clears all pending patches
- **WHEN** `rejectAllPatches()` is called
- **THEN** `pendingPatches` SHALL be emptied without applying any modifications

### Requirement: Agent message types for store
The system SHALL define message types suitable for the Agent UI.

#### Scenario: AgentMessage structure
- **WHEN** a message is stored in `useAgentStore.messages`
- **THEN** it SHALL have `id` (string), `role` ('user' | 'assistant'), `content` (string), and `timestamp` (number)
- **AND** assistant messages SHALL additionally have `toolCalls?: ToolCallRecord[]`

#### Scenario: ToolCallRecord structure
- **WHEN** a tool call is recorded
- **THEN** it SHALL have `id` (string), `name` (string), `args` (Record<string, unknown>), `status` ('running' | 'completed' | 'error'), and `result` (unknown | null)

### Requirement: AIMode supports chat and agent modes
The system SHALL define `AIMode` type in `useAIStore` as `'chat' | 'agent'`.

#### Scenario: Agent mode available
- **WHEN** `useAIStore.getState().mode` is inspected
- **THEN** it SHALL accept `'agent'` as a valid value
- **AND** setting mode to `'agent'` SHALL not affect chat message history or other chat state
