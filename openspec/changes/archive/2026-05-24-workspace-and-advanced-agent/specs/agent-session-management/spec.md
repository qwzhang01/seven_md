## ADDED Requirements

### Requirement: useAgentStore manages multiple sessions in memory
The system SHALL extend `useAgentStore` to support multiple in-memory Agent sessions.

#### Scenario: sessions and activeSessionId fields
- **WHEN** the store is inspected
- **THEN** it SHALL expose `sessions: Record<string, AgentSession>` and `activeSessionId: string`
- **AND** each `AgentSession` SHALL contain `{ id, title, createdAt, modelId, isRunning, messages, toolCalls, pendingPatches, pendingConfirmations, error, compactionInProgress, agentInstance }`

#### Scenario: Default session bootstrapped on first access
- **WHEN** `useAgentStore` is first read and `sessions` is empty
- **THEN** a default session SHALL be auto-created with id `'default'` and title `'对话 1'`
- **AND** `activeSessionId` SHALL be set to `'default'`

### Requirement: createSession creates a new session
The system SHALL provide `createSession()`.

#### Scenario: New session has fresh state
- **WHEN** `createSession()` is called
- **THEN** a new session id (uuid v4) SHALL be generated
- **AND** the new session SHALL have empty messages/toolCalls/pendingPatches/pendingConfirmations and `isRunning: false`
- **AND** the new session's modelId SHALL equal `activeModelId`
- **AND** `activeSessionId` SHALL be updated to the new id
- **AND** the function SHALL return the new id

### Requirement: setActiveSession switches the active session
The system SHALL provide `setActiveSession(id)`.

#### Scenario: Switch to existing session
- **WHEN** `setActiveSession(id)` is called with an existing id
- **THEN** `activeSessionId` SHALL be updated
- **AND** the previous session's running state SHALL not be affected

#### Scenario: Switch to non-existent session
- **WHEN** `setActiveSession(id)` is called with an unknown id
- **THEN** a warning SHALL be logged and `activeSessionId` SHALL not change

### Requirement: deleteSession aborts and removes a session
The system SHALL provide `deleteSession(id)`.

#### Scenario: Delete a running session
- **WHEN** `deleteSession(id)` is called for a session whose `isRunning` is true
- **THEN** the session's Agent's `abort()` SHALL be called
- **AND** the session SHALL be removed from `sessions`

#### Scenario: Delete the active session
- **WHEN** `deleteSession(id)` is called and `id === activeSessionId`
- **THEN** `activeSessionId` SHALL switch to the most recently created remaining session
- **AND** if no sessions remain, a fresh default session SHALL be auto-created

### Requirement: AgentSessionDrawer UI lists and switches sessions
The system SHALL render an `AgentSessionDrawer` component accessible from the AgentMode header.

#### Scenario: Drawer lists all sessions
- **WHEN** the drawer is opened
- **THEN** it SHALL list every session sorted by `createdAt` descending
- **AND** each entry SHALL show title, model id, message count, and a "running" badge if `isRunning`

#### Scenario: Drawer actions
- **WHEN** the user clicks a session entry
- **THEN** `setActiveSession(id)` SHALL be called and the drawer SHALL close
- **AND** each entry SHALL have a "新建" button (calls `createSession()`) and a "删除" button (calls `deleteSession()` after confirm)

### Requirement: Window unload aborts all running sessions
The system SHALL clean up Agent instances when the window unloads.

#### Scenario: beforeunload handler
- **WHEN** the `beforeunload` event fires
- **THEN** every session whose `isRunning` is true SHALL have `abort()` invoked
