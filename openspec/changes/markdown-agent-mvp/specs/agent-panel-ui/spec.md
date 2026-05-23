## ADDED Requirements

### Requirement: AIPanel includes Agent Tab
The system SHALL add a fifth tab labeled "Agent" to the AIPanel component.

#### Scenario: Agent tab renders AgentMode component
- **WHEN** the user selects the "Agent" tab in AIPanel
- **THEN** `useAIStore.mode` SHALL be set to `'agent'`
- **AND** the `AgentMode` component SHALL be rendered

#### Scenario: Agent tab icon and label
- **WHEN** the AIPanel tabs are displayed
- **THEN** the Agent tab SHALL have a distinguishable icon (e.g., bot/sparkle)
- **AND** the label SHALL be "Agent"

### Requirement: AgentMode provides full Agent interaction interface
The system SHALL provide an `AgentMode.tsx` component at `src/components/ai-panel/AgentMode.tsx` as the main Agent UI.

#### Scenario: Input area for user messages
- **WHEN** AgentMode is rendered
- **THEN** it SHALL display a text input area at the bottom
- **AND** it SHALL have a send button
- **AND** pressing Enter (without Shift) SHALL submit the message
- **AND** Shift+Enter SHALL insert a newline

#### Scenario: Sending a message starts the Agent
- **WHEN** the user submits a message via the input area
- **THEN** `useAgentStore.startAgent(message)` SHALL be called
- **AND** the input area SHALL be disabled while the agent is running
- **AND** a cancel button SHALL appear

#### Scenario: Cancel button aborts the Agent
- **WHEN** the user clicks the cancel button while the agent is running
- **THEN** `useAgentStore.cancelAgent()` SHALL be called

#### Scenario: Message list displays conversation
- **WHEN** messages exist in `useAgentStore.messages`
- **THEN** user messages SHALL be displayed with user styling (right-aligned or distinct background)
- **AND** assistant messages SHALL be displayed with assistant styling
- **AND** assistant messages SHALL render Markdown content

#### Scenario: Streaming text renders progressively
- **WHEN** the agent is streaming a response (`isRunning` is true and assistant message is being updated)
- **THEN** the latest assistant message SHALL update in real-time as content arrives
- **AND** a typing indicator or cursor animation SHALL be visible

### Requirement: AgentToolCallLog displays tool execution history
The system SHALL provide an `AgentToolCallLog.tsx` component.

#### Scenario: Tool calls are listed
- **WHEN** `useAgentStore.toolCalls` has entries
- **THEN** each tool call SHALL be displayed with its name and status icon
- **AND** running tools SHALL show a spinner/loading indicator
- **AND** completed tools SHALL show a checkmark
- **AND** errored tools SHALL show an error icon

#### Scenario: Tool call details are expandable
- **WHEN** the user clicks on a tool call entry
- **THEN** it SHALL expand to show `args` (formatted JSON) and `result` (formatted JSON or text)

#### Scenario: Tool calls are ordered chronologically
- **WHEN** multiple tool calls exist
- **THEN** they SHALL be displayed in execution order (oldest first)

### Requirement: DiffPreview displays pending patch changes
The system SHALL provide a `DiffPreview.tsx` component.

#### Scenario: replace_selection patch shows inline diff
- **WHEN** a pending patch of type `replace_selection` exists
- **THEN** DiffPreview SHALL display the original text (from selection) with deletion styling (red/strikethrough)
- **AND** the new text with addition styling (green)
- **AND** a description label if the patch has one

#### Scenario: insert_at_cursor patch shows insertion preview
- **WHEN** a pending patch of type `insert_at_cursor` exists
- **THEN** DiffPreview SHALL display the text to be inserted with addition styling (green)
- **AND** context lines around the insertion point (if available)

#### Scenario: replace_document patch shows summary diff
- **WHEN** a pending patch of type `replace_document` exists
- **THEN** DiffPreview SHALL display a summary of changes (e.g., "+X lines, -Y lines")
- **AND** optionally show a collapsible full diff view

#### Scenario: Multiple patches are listed
- **WHEN** multiple pending patches exist in `useAgentStore.pendingPatches`
- **THEN** each patch SHALL be displayed as a separate diff section
- **AND** they SHALL be ordered by `createdAt`

### Requirement: PatchActions provides apply/reject controls
The system SHALL provide a `PatchActions.tsx` component.

#### Scenario: Individual patch actions
- **WHEN** a pending patch is displayed in DiffPreview
- **THEN** each patch SHALL have an "应用" (Apply) button and a "拒绝" (Reject) button
- **AND** clicking "应用" SHALL call `useAgentStore.applyPatch(patchId)`
- **AND** clicking "拒绝" SHALL call `useAgentStore.rejectPatch(patchId)`

#### Scenario: Batch actions for multiple patches
- **WHEN** multiple pending patches exist
- **THEN** the UI SHALL show "全部应用" (Apply All) and "全部拒绝" (Reject All) buttons
- **AND** clicking "全部应用" SHALL call `useAgentStore.applyAllPatches()`
- **AND** clicking "全部拒绝" SHALL call `useAgentStore.rejectAllPatches()`

#### Scenario: Actions hidden when no patches pending
- **WHEN** `useAgentStore.pendingPatches` is empty
- **THEN** the PatchActions component SHALL not render any buttons

### Requirement: Agent error state displays feedback
The system SHALL display error information when the Agent encounters issues.

#### Scenario: Error message displayed
- **WHEN** `useAgentStore.error` is not null
- **THEN** an error banner SHALL be displayed with the error message
- **AND** a "重试" (Retry) option SHALL be available

#### Scenario: Network/timeout error handling
- **WHEN** the Agent run fails due to network error or timeout
- **THEN** `useAgentStore.error` SHALL contain a user-friendly error message
- **AND** the input area SHALL be re-enabled for retry
