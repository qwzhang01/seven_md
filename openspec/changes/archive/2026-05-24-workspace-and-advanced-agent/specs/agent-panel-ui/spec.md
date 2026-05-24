## ADDED Requirements

### Requirement: AgentMode renders a preset bar above the conversation
The system SHALL render an `AgentPresetBar` component at the top of `AgentMode`.

#### Scenario: Preset bar visible
- **WHEN** AgentMode is mounted
- **THEN** a horizontally scrollable bar SHALL be displayed above the message list
- **AND** the bar SHALL render every built-in preset chip from `BUILTIN_PRESETS`

#### Scenario: Preset chip click
- **WHEN** the user clicks a preset chip
- **THEN** the active session SHALL start the agent with the preset prompt
- **AND** if `requiresSelection` is true and no selection exists, a notification SHALL be shown and the agent SHALL NOT start

### Requirement: AgentMode renders a model selector
The system SHALL render an `AgentModelSelector` component in the AgentMode header.

#### Scenario: Selector reflects activeModelId
- **WHEN** AgentModelSelector renders
- **THEN** it SHALL display the currently selected model id (from `useAgentStore.activeModelId`)
- **AND** opening it SHALL list every configured `{ providerId, modelId }` pair

#### Scenario: Changing the model
- **WHEN** the user picks a different model in AgentModelSelector
- **THEN** `useAgentStore.setActiveModel(modelId)` SHALL be called

### Requirement: AgentMode exposes a session drawer
The system SHALL render an `AgentSessionDrawer` triggerable from the AgentMode header.

#### Scenario: Drawer toggle button
- **WHEN** AgentMode renders
- **THEN** a "会话" button SHALL be present in the header
- **AND** clicking it SHALL open the AgentSessionDrawer

#### Scenario: Drawer interactions
- **WHEN** the user clicks a session row in the drawer
- **THEN** `setActiveSession(id)` SHALL be called and the drawer SHALL close
- **AND** a "新建" button SHALL invoke `createSession()`
- **AND** a "删除" button SHALL invoke `deleteSession(id)` after a confirmation step

### Requirement: AgentMode renders a confirmation panel for confirm-permission tools
The system SHALL render an `AgentConfirmPanel` component when `pendingConfirmations` is non-empty for the active session.

#### Scenario: Panel displays pending confirmation
- **WHEN** the active session has at least one entry in `pendingConfirmations`
- **THEN** an `AgentConfirmPanel` SHALL render the entry's `toolName`, `args`, and optional `preview`
- **AND** "同意" and "拒绝" buttons SHALL be displayed

#### Scenario: Panel buttons resolve the confirmation
- **WHEN** the user clicks "同意"
- **THEN** `useAgentStore.approveConfirmation(id)` SHALL be called
- **WHEN** the user clicks "拒绝"
- **THEN** `useAgentStore.rejectConfirmation(id)` SHALL be called

#### Scenario: Panel hidden when no pending confirmations
- **WHEN** `pendingConfirmations` is empty
- **THEN** the AgentConfirmPanel SHALL not render

### Requirement: AgentMode shows compaction indicator
The system SHALL surface compaction status in AgentMode.

#### Scenario: Indicator visible during compaction
- **WHEN** the active session's `compactionInProgress` is `true`
- **THEN** AgentMode SHALL show a non-blocking indicator (e.g., "正在压缩对话上下文…")

#### Scenario: Indicator hidden after completion
- **WHEN** `compactionInProgress` becomes `false`
- **THEN** the indicator SHALL be removed
