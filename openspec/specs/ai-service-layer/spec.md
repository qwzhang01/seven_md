## ADDED Requirements

### Requirement: AI service abstraction layer supports configurable API
The system SHALL provide an AI service module that encapsulates all AI API calls with configurable endpoint and authentication.

#### Scenario: AI service configuration
- **WHEN** the AI service is initialized
- **THEN** it SHALL read configuration (AI provider, API Key, endpoint URL, model name) from localStorage via `useAIStore`
- **AND** if no configuration exists, the service SHALL return an error indicating "请先配置 AI 服务"

#### Scenario: AI service handles network errors gracefully
- **WHEN** an AI API call fails due to network error, timeout, or API error
- **THEN** the service SHALL throw a descriptive error message
- **AND** the calling component SHALL display the error via notification system
- **AND** the UI SHALL NOT remain in a loading state

### Requirement: AI service layer supports multiple providers
The system SHALL provide a provider abstraction at `src/services/ai/providers/` supporting at least two providers.

#### Scenario: OpenAI Compatible provider
- **WHEN** the user configures provider as "OpenAI Compatible"
- **THEN** the service SHALL use `openaiCompatible.ts` to call any OpenAI-format API
- **AND** it SHALL support custom Base URL for third-party services (e.g., DeepSeek, Qwen)

#### Scenario: Pi provider
- **WHEN** the user configures provider as "Pi"
- **THEN** the service SHALL use `piProvider.ts` which wraps `src/lib/pi/ai/` stream function
- **AND** it SHALL support streaming responses via Pi AI framework

#### Scenario: Provider selection persists
- **WHEN** the user selects a provider in AI settings
- **THEN** the selection SHALL be persisted in `useAIStore` (localStorage)
- **AND** subsequent AI calls SHALL use the selected provider

### Requirement: Chat mode uses real AI API with streaming
The system SHALL replace any mock implementation in ChatMode with real AI API calls.

#### Scenario: Send chat message to AI
- **WHEN** user types a message and presses Enter or clicks Send
- **THEN** the system SHALL call the configured AI provider's stream endpoint
- **AND** the response SHALL stream progressively into the chat history

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
