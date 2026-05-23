## MODIFIED Requirements

### Requirement: AI service abstraction layer supports configurable API
The system SHALL provide an AI service module that encapsulates all AI API calls with configurable endpoint and authentication.

#### Scenario: AI service configuration
- **WHEN** the AI service is initialized
- **THEN** it SHALL read configuration (API Key, endpoint URL, model name, provider) from localStorage key `seven-markdown-ai-config`
- **AND** if no configuration exists, the service SHALL return an error indicating "请先配置 AI 服务"

#### Scenario: AI service handles network errors gracefully
- **WHEN** an AI API call fails due to network error, timeout, or API error
- **THEN** the service SHALL throw a descriptive error message
- **AND** the calling component SHALL display the error via notification system
- **AND** the UI SHALL NOT remain in a loading state

#### Scenario: AI service supports streaming responses (optional)
- **WHEN** the AI service receives a response
- **THEN** it SHALL support both streaming and non-streaming response modes
- **AND** the default mode SHALL be non-streaming for legacy compatibility

#### Scenario: Configuration key migration
- **WHEN** `getAIConfig()` is called for the first time
- **AND** localStorage contains data under the old key `md-mate-ai-config`
- **AND** localStorage does NOT contain data under the new key `seven-markdown-ai-config`
- **THEN** the system SHALL copy the old data to the new key
- **AND** the system SHALL remove the old key
- **AND** subsequent calls SHALL use only the new key

### Requirement: Chat mode uses real AI API instead of mock
The system SHALL replace the current mock implementation in ChatMode with real AI API calls.

#### Scenario: Send chat message to AI
- **WHEN** user types a message and presses Enter or clicks Send
- **THEN** the system SHALL send the message to the AI service's chat endpoint
- **AND** the response SHALL be displayed as an assistant message in the chat history

#### Scenario: Chat system prompt uses correct brand name
- **WHEN** a chat message is sent to the AI service
- **THEN** the system prompt SHALL identify itself as "Seven Markdown AI 助手"
- **AND** the system prompt SHALL NOT contain "MD Mate"

#### Scenario: Chat fallback when AI not configured
- **WHEN** the AI service is not configured (no API Key)
- **AND** the user sends a message
- **THEN** the system SHALL display an error notification "请先配置 AI 服务"
- **AND** the chat SHALL NOT show mock/fake responses

### Requirement: Legacy aiService.ts functions remain available
The system SHALL maintain backward compatibility by keeping `aiChat`, `aiRewrite`, `aiTranslate`, `aiExplain` functions importable from `src/services/aiService.ts`.

#### Scenario: Existing imports continue to work
- **WHEN** a component imports `aiChat` from `src/services/aiService.ts`
- **THEN** the import SHALL resolve successfully
- **AND** calling the function SHALL delegate to the new AI provider layer internally

#### Scenario: Legacy function signatures unchanged
- **WHEN** `aiRewrite(text, style)` is called
- **THEN** it SHALL accept the same parameters as before (`text: string, style: string`)
- **AND** it SHALL return the same type (`Promise<string>`)
- **AND** the behavior SHALL be identical to the previous implementation
