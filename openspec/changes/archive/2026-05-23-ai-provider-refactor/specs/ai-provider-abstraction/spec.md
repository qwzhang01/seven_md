## ADDED Requirements

### Requirement: AIProvider interface defines unified LLM access contract
The system SHALL define an `AIProvider` interface at `src/services/ai/providers/types.ts` that all AI providers implement.

#### Scenario: Provider interface shape
- **WHEN** a class implements the `AIProvider` interface
- **THEN** it SHALL implement a `chat(messages, options?)` method returning `Promise<string>`
- **AND** it SHALL implement a `chatStream(messages, options?)` method returning `AsyncGenerator<string>`
- **AND** it SHALL implement a `name` property returning the provider identifier string

#### Scenario: Chat options support
- **WHEN** `chat()` or `chatStream()` is called with options
- **THEN** it SHALL accept optional `model`, `temperature`, `maxTokens`, and `tools` parameters
- **AND** if options are omitted, the provider SHALL use its configured defaults

### Requirement: Provider registry manages available providers
The system SHALL maintain a registry of available AI providers at `src/services/ai/providers/index.ts`.

#### Scenario: Register a provider
- **WHEN** code calls `registerProvider(provider)` with an `AIProvider` instance
- **THEN** the provider SHALL be stored in the registry keyed by its `name` property
- **AND** it SHALL be retrievable via `getProvider(name)`

#### Scenario: Get active provider
- **WHEN** code calls `getActiveProvider()`
- **THEN** the system SHALL return the provider matching the `provider` field in the current AI configuration
- **AND** if the configured provider is not registered, it SHALL throw an error with a descriptive message

#### Scenario: Default provider registration
- **WHEN** the AI service module is imported for the first time
- **THEN** both `OpenAICompatibleProvider` and `PiProvider` SHALL be automatically registered

### Requirement: OpenAICompatibleProvider implements direct OpenAI API access
The system SHALL include an `OpenAICompatibleProvider` class that calls OpenAI-compatible endpoints directly via `fetch`.

#### Scenario: Non-streaming chat
- **WHEN** `chat(messages)` is called on `OpenAICompatibleProvider`
- **THEN** it SHALL send a POST request to `{endpoint}/chat/completions` with the configured model
- **AND** it SHALL return the content of `choices[0].message.content` from the response
- **AND** it SHALL use `Bearer {apiKey}` authorization header

#### Scenario: Streaming chat
- **WHEN** `chatStream(messages)` is called on `OpenAICompatibleProvider`
- **THEN** it SHALL send a POST request with `stream: true`
- **AND** it SHALL yield text chunks as they arrive via SSE parsing
- **AND** the caller SHALL receive incremental content deltas

#### Scenario: Error handling
- **WHEN** the API returns a non-2xx response
- **THEN** the provider SHALL throw an error containing the HTTP status code and response body
- **AND** when the API key is not configured, it SHALL throw "AI 服务未配置。请先在设置中填写 API Key。"

### Requirement: AI configuration is managed centrally
The system SHALL provide configuration management functions at `src/services/ai/config.ts`.

#### Scenario: Read configuration
- **WHEN** `getAIConfig()` is called
- **THEN** it SHALL return the stored configuration from localStorage key `seven-markdown-ai-config`
- **AND** the configuration SHALL include `apiKey`, `endpoint`, `model`, and `provider` fields
- **AND** if no stored configuration exists, it SHALL return defaults: endpoint `https://api.openai.com/v1`, model `gpt-4o`, provider `openai-compatible`

#### Scenario: Write configuration
- **WHEN** `setAIConfig(partialConfig)` is called
- **THEN** it SHALL merge the partial config with the current config
- **AND** it SHALL persist the result to localStorage key `seven-markdown-ai-config`

#### Scenario: Check if configured
- **WHEN** `isAIConfigured()` is called
- **THEN** it SHALL return `true` only if `apiKey` is a non-empty string in the stored config
