## ADDED Requirements

### Requirement: PiProvider bridges @pi/ai streaming to AIProvider interface
The system SHALL include a `PiProvider` class at `src/services/ai/providers/piProvider.ts` that implements `AIProvider` by delegating to `@pi/ai`.

#### Scenario: Provider name
- **WHEN** `PiProvider.name` is accessed
- **THEN** it SHALL return the string `"pi"`

#### Scenario: Non-streaming chat via Pi
- **WHEN** `chat(messages)` is called on `PiProvider`
- **THEN** it SHALL internally call `@pi/ai` `stream()` function with the configured model and apiKey
- **AND** it SHALL collect all text deltas from the stream
- **AND** it SHALL return the concatenated full response text

#### Scenario: Streaming chat via Pi
- **WHEN** `chatStream(messages)` is called on `PiProvider`
- **THEN** it SHALL call `@pi/ai` `stream()` function
- **AND** it SHALL yield text content deltas as they arrive from the Pi event stream
- **AND** the caller SHALL receive incremental content in real time

#### Scenario: Pi provider registers openai-completions
- **WHEN** `PiProvider` is instantiated
- **THEN** it SHALL call `registerApiProvider` from `@pi/ai` to register the `openai-completions` provider
- **AND** subsequent `stream()` calls SHALL resolve the registered provider correctly

#### Scenario: API key passthrough
- **WHEN** `PiProvider` makes a stream call
- **THEN** it SHALL pass the `apiKey` from the AI configuration to the Pi `stream()` function via `options.apiKey`
- **AND** it SHALL pass the `endpoint` as `baseURL` if configured

#### Scenario: Tool calling support
- **WHEN** `chatStream(messages, { tools })` is called with tool definitions
- **THEN** `PiProvider` SHALL pass the tools to Pi's `stream()` function
- **AND** the returned stream SHALL include tool call events when the model invokes tools
