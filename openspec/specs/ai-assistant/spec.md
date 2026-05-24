## ADDED Requirements

### Requirement: AI assistant panel provides multi-mode AI interaction
The system SHALL display an AI assistant panel supporting Chat and Agent modes.

#### Scenario: AI panel opens and closes
- **WHEN** user clicks the AI button in the toolbar OR selects "AI: 打开助手" from command palette
- **THEN** the AI assistant panel SHALL slide in from the right edge
- **AND** the panel SHALL display mode tabs at the top:
  - 💬 对话 (Chat)
  - 🤖 Agent
- **AND** a settings (⚙️) button SHALL be in the top-right corner
- **AND** the default active mode SHALL be "对话"
- **WHEN** user clicks the AI button again
- **THEN** the AI panel SHALL close

### Requirement: Chat mode allows conversational AI interaction
The system SHALL provide a chat interface for free-form conversation with the AI.

#### Scenario: Chat mode UI
- **WHEN** "对话" mode is active in the AI panel
- **THEN** the panel SHALL display:
  - A welcome message from the AI assistant: "你好！我是 Seven Markdown AI 助手..."
  - A message history area showing user messages (👤) and AI responses (🤖)
  - A bottom input bar with text field (minHeight 60px, rows=2) and send (📤) button

#### Scenario: Send message and receive response
- **WHEN** user types a message in the chat input and clicks Send (or presses Enter)
- **THEN** the user message SHALL appear in the history
- **AND** an AI response SHALL stream in progressively (not wait for completion)
- **AND** a loading indicator SHALL show while the AI is generating

### Requirement: Agent mode allows autonomous document editing
The system SHALL provide an Agent interface where the AI can autonomously read and write the document.

#### Scenario: Agent mode UI
- **WHEN** "Agent" mode is active in the AI panel
- **THEN** the panel SHALL display:
  - A message history area with the same styling as Chat mode
  - A bottom input area with text field and send button
  - A cancel button (■) replacing the send button while the agent is running

#### Scenario: Agent executes tool calls
- **WHEN** user submits an instruction in Agent mode
- **THEN** `useAgentStore.startAgent(message)` SHALL be called
- **AND** the agent SHALL autonomously call editor tools (get_document, replace_selection, etc.)
- **AND** results SHALL be shown as diff previews with Apply/Reject controls

### Requirement: Global AI settings panel
The system SHALL provide a settings panel accessible from any AI panel mode.

#### Scenario: Settings panel opens
- **WHEN** user clicks the ⚙️ button in the AI panel header (top-right)
- **THEN** a settings overlay SHALL appear within the AI panel
- **AND** it SHALL be accessible from both Chat and Agent modes

#### Scenario: Settings fields
- **WHEN** the settings panel is open
- **THEN** it SHALL allow configuring: AI provider, API Key, model name, Base URL

### Requirement: AI panel can be resized
The system SHALL allow resizing the AI panel width.

#### Scenario: Drag to resize
- **WHEN** user drags the left edge of the AI panel
- **THEN** the panel width SHALL change accordingly
- **AND** the maximum width SHALL be 3/4 of the editor area width

#### Scenario: Input area height resize
- **WHEN** user drags the resize handle above the input area
- **THEN** the input area height SHALL change accordingly

### Requirement: AI handles errors gracefully
The system SHALL handle AI service errors with appropriate user feedback.

#### Scenario: Network error handling
- **WHEN** an AI request fails due to network issues
- **THEN** an error banner SHALL be displayed with AlertCircle icon and error message
- **AND** a retry (RefreshCw) button SHALL be offered

#### Scenario: API rate limit handling
- **WHEN** the AI service returns a rate limit error
- **THEN** a friendly message SHALL inform the user about the limit
- **AND** a suggestion to wait or check API settings SHALL be provided
