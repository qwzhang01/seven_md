## ADDED Requirements

### Requirement: AgentMode displays a model selector
The system SHALL render an `AgentModelSelector` component at the top of AgentMode.

#### Scenario: Selector lists configured providers and models
- **WHEN** AgentModelSelector is mounted
- **THEN** it SHALL list every `{ providerId, modelId }` pair from `useAIStore.providers`
- **AND** the currently active model SHALL be marked as selected (read from `useAgentStore.activeModelId`)

#### Scenario: Empty configuration
- **WHEN** no AI provider is configured
- **THEN** the selector SHALL display "请先配置 AI 服务" and a link to the AI settings dialog

### Requirement: Active model id is persisted to localStorage
The system SHALL persist the user's selection across sessions.

#### Scenario: Selection writes localStorage
- **WHEN** the user picks a model in AgentModelSelector
- **THEN** `useAgentStore.activeModelId` SHALL be updated
- **AND** the value SHALL be persisted to localStorage under key `seven-markdown-agent-active-model`

#### Scenario: Selection restores on app start
- **WHEN** the application boots and `useAgentStore` initializes
- **THEN** `activeModelId` SHALL be hydrated from localStorage if a value exists and the model is still configured
- **AND** if the persisted model is no longer available, `activeModelId` SHALL fall back to the configured default model

### Requirement: Switching models does not affect running sessions
The system SHALL bind the model id at Agent creation time.

#### Scenario: Running session keeps its model
- **WHEN** a session is currently running with model A
- **AND** the user switches the active model to B
- **THEN** the running session SHALL continue using model A until completion or abort

#### Scenario: New session uses newly selected model
- **WHEN** the user creates a new session via `createSession()`
- **THEN** the new session's Agent SHALL be constructed with `createMarkdownAgent({ modelId: useAgentStore.getState().activeModelId })`
