## ADDED Requirements

### Requirement: AI assistant panel provides multi-mode AI interaction
The system SHALL display an AI assistant panel supporting Chat, Rewrite, Translate, and Explain modes.

#### Scenario: AI panel opens
- **WHEN** user clicks the AI button in the toolbar OR selects "AI: 打开助手" from command palette
- **THEN** an AI assistant panel SHALL slide in from the right edge (or appear as a sidebar panel)
- **AND** the panel SHALL display mode tabs at the top:
  - 💬 对话 (Chat)
  - ✨ 改写 (Rewrite)
  - 🌐 翻译 (Translate)
  - 💡 解释 (Explain)
- **AND** a close (✕) button SHALL be in the top-right corner
- **AND** the default active mode SHALL be "对话"

### Requirement: Chat mode allows conversational AI interaction
The system SHALL provide a chat interface for free-form conversation with the AI.

#### Scenario: Chat mode UI
- **WHEN** "对话" mode is active in the AI panel
- **THEN** the panel SHALL display:
  - A welcome message from the AI assistant: "你好！我是 MD Mate AI 助手..."
  - A message history area showing user messages (👤) and AI responses (🤖)
  - A bottom input bar with text field and send (📤) button

#### Scenario: Send message and receive response
- **WHEN** user types a message in the chat input and clicks Send (or presses Enter)
- **THEN** the user message SHALL appear in the history
- **AND** an AI response SHALL stream in progressively (not wait for completion)
- **AND** a loading indicator SHALL show while the AI is generating

### Requirement: Rewrite mode allows text rewriting
The system SHALL provide AI-powered text rewriting with style options.

#### Scenario: Rewrite mode UI
- **WHEN** "改写" mode is active
- **THEN** the panel SHALL display:
  - Style selection options: 专业 / 随意 / 简洁 / 扩展
  - A preview area showing selected text from the editor
  - An "应用改写" button

#### Scenario: Apply rewrite result
- **WHEN** user has text selected in the editor
- **AND** chooses a rewrite style
- **AND** the AI generates a rewritten version
- **AND** user clicks "应用改写"
- **THEN** the selected text in the editor SHALL be replaced with the rewritten version

### Requirement: Translate mode allows text translation
The system SHALL provide AI-powered text translation between languages.

#### Scenario: Translate mode UI
- **WHEN** "翻译" mode is active
- **THEN** the panel SHALL display:
  - Language direction options: 中文→英文 / 英文→中文 / 中文→日文
  - A preview area showing selected text from the editor
  - An "应用翻译" button

#### Scenario: Apply translation result
- **WHEN** user has text selected in the editor
- **AND** chooses a translation direction
- **AND** the AI generates a translation
- **AND** user clicks "应用翻译"
- **THEN** the selected text in the editor SHALL be replaced with the translated version

### Requirement: Explain mode provides AI explanations
The system SHALL provide AI explanations for selected text or code.

#### Scenario: Explain mode UI
- **WHEN** "解释" mode is active
- **THEN** the panel SHALL display:
  - A preview area showing selected text/code from the editor
  - An explanation area below showing the AI's explanation (read-only)

#### Scenario: Explain selected content
- **WHEN** user has text or code selected in the editor
- **AND** activates Explain mode
- **THEN** the AI SHALL generate a human-readable explanation of what the selected content does or means
- **AND** there SHALL be no "apply" action (explanation is informational only)

### Requirement: AI panel can be closed
The system SHALL allow closing the AI assistant panel.

#### Scenario: Close with X button
- **WHEN** user clicks the ✕ button in the AI panel header
- **THEN** the AI panel SHALL close/animate out
- **AND** the editor area SHALL reclaim the space

#### Scenario: Close with Escape
- **WHEN** the AI panel is open
- **AND** user presses Escape
- **THEN** the AI panel SHALL close

### Requirement: AI handles errors gracefully
The system SHALL handle AI service errors with appropriate user feedback.

#### Scenario: Network error handling
- **WHEN** an AI request fails due to network issues
- **THEN** an error message SHALL be displayed in the AI panel
- **AND** a retry option SHALL be offered

#### Scenario: API rate limit handling
- **WHEN** the AI service returns a rate limit error
- **THEN** a friendly message SHALL inform the user about the limit
- **AND** a suggestion to wait or check API settings SHALL be provided
