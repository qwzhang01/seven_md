## ADDED Requirements

### Requirement: AI service abstraction layer supports configurable API
The system SHALL provide an AI service module that encapsulates all AI API calls with configurable endpoint and authentication.

#### Scenario: AI service configuration
- **WHEN** the AI service is initialized
- **THEN** it SHALL read configuration (API Key, endpoint URL, model name) from localStorage
- **AND** if no configuration exists, the service SHALL return an error indicating "请先配置 AI 服务"

#### Scenario: AI service handles network errors gracefully
- **WHEN** an AI API call fails due to network error, timeout, or API error
- **THEN** the service SHALL throw a descriptive error message
- **AND** the calling component SHALL display the error via notification system
- **AND** the UI SHALL NOT remain in a loading state

#### Scenario: AI service supports streaming responses (optional)
- **WHEN** the AI service receives a response
- **THEN** it SHALL support both streaming and non-streaming response modes
- **AND** the default mode SHALL be non-streaming for initial implementation

### Requirement: Rewrite mode executes AI rewriting with selected text
The system SHALL allow users to rewrite selected text using AI with configurable style options.

#### Scenario: Trigger rewrite with selected text
- **WHEN** the user has text selected in the editor
- **AND** the user switches to the Rewrite tab in the AI panel
- **THEN** the selected text SHALL appear in the rewrite preview area
- **AND** the system SHALL send the text to the AI service with the selected style (专业/随意/简洁/扩展)

#### Scenario: Apply rewrite result to editor
- **WHEN** the AI returns a rewrite result
- **AND** the user clicks "应用改写" button
- **THEN** the originally selected text in the editor SHALL be replaced with the rewrite result
- **AND** the replacement SHALL be a single undoable transaction

#### Scenario: Rewrite with no selected text
- **WHEN** the user is in Rewrite mode
- **AND** no text is selected in the editor
- **THEN** the preview area SHALL display "选中文本将显示在此处..."
- **AND** the "应用改写" button SHALL be disabled

### Requirement: Translate mode executes AI translation with selected text
The system SHALL allow users to translate selected text using AI with configurable direction options.

#### Scenario: Trigger translation with selected text
- **WHEN** the user has text selected in the editor
- **AND** the user switches to the Translate tab in the AI panel
- **THEN** the selected text SHALL appear in the translation preview area
- **AND** the system SHALL send the text to the AI service with the selected direction (中→英 / 英→中 / 中→日)

#### Scenario: Apply translation result to editor
- **WHEN** the AI returns a translation result
- **AND** the user clicks "应用翻译" button
- **THEN** the originally selected text in the editor SHALL be replaced with the translation result
- **AND** the replacement SHALL be a single undoable transaction

### Requirement: Explain mode executes AI explanation for selected text
The system SHALL allow users to get AI-generated explanations for selected text.

#### Scenario: Trigger explanation with selected text
- **WHEN** the user has text selected in the editor
- **AND** the user switches to the Explain tab in the AI panel
- **THEN** the selected text SHALL appear in the "选中内容" section
- **AND** an "解释" button SHALL be displayed
- **WHEN** the user clicks the "解释" button
- **THEN** the system SHALL send the text to the AI service for explanation

#### Scenario: Display explanation result
- **WHEN** the AI returns an explanation
- **THEN** the explanation text SHALL appear in the "AI 解释" section
- **AND** the explanation SHALL remain visible until the user selects new text or switches mode

### Requirement: Chat mode uses real AI API instead of mock
The system SHALL replace the current mock implementation in ChatMode with real AI API calls.

#### Scenario: Send chat message to AI
- **WHEN** user types a message and presses Enter or clicks Send
- **THEN** the system SHALL send the message to the AI service's chat endpoint
- **AND** the response SHALL be displayed as an assistant message in the chat history

#### Scenario: Chat fallback when AI not configured
- **WHEN** the AI service is not configured (no API Key)
- **AND** the user sends a message
- **THEN** the system SHALL display an error notification "请先配置 AI 服务"
- **AND** the chat SHALL NOT show mock/fake responses

### Requirement: Editor selection syncs to AI store
The system SHALL synchronize the editor's text selection with the AI store's `selectedText` field.

#### Scenario: Text selection updates AI store
- **WHEN** the user selects text in the CodeMirror editor
- **THEN** `useAIStore.selectedText` SHALL be updated with the selected text content
- **AND** the update SHALL occur on selection change (not on every keystroke)

#### Scenario: Empty selection clears AI store
- **WHEN** the user clears their text selection (clicks without selecting)
- **THEN** `useAIStore.selectedText` SHALL be set to `null`
