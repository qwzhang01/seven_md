## ADDED Requirements

### Requirement: Compaction module wraps Pi compaction with WebView-safe defaults
The system SHALL provide a `compaction` module at `src/services/ai/agent/compaction.ts` that integrates Pi's `compactTranscript` while staying compatible with the browser/WebView runtime.

#### Scenario: maybeCompact triggers when transcript exceeds threshold
- **WHEN** `maybeCompact(session)` is called and the estimated token count of `session.transcript` exceeds the threshold
- **THEN** Pi's `compactTranscript` SHALL be invoked with the current transcript
- **AND** the resulting compacted messages SHALL replace the session transcript
- **AND** an event of type `compaction_done` SHALL be emitted via the agent event bus

#### Scenario: maybeCompact is a no-op below threshold
- **WHEN** the estimated token count is below the threshold
- **THEN** the transcript SHALL be left unchanged
- **AND** no event SHALL be emitted

### Requirement: Threshold is computed per active model
The system SHALL select a token threshold based on the active model's context window.

#### Scenario: Threshold is 80% of context window
- **WHEN** `tokenThresholdFor(modelId)` is called
- **THEN** it SHALL return `Math.floor(contextWindow(modelId) * 0.8)`
- **AND** if the model is unknown, the default SHALL be `25_000`

### Requirement: Token estimation uses lightweight heuristic
The system SHALL provide an `estimateTokens(messages)` function that approximates the token count without a tokenizer dependency.

#### Scenario: Estimation algorithm
- **WHEN** `estimateTokens(messages)` is called
- **THEN** it SHALL return `Math.ceil(totalChars / 4) + messages.length * 4`
- **AND** the result SHALL be treated as a conservative upper bound (i.e., may overestimate)

### Requirement: Compaction failure falls back to truncation
The system SHALL gracefully degrade when compaction throws an error.

#### Scenario: Pi compaction throws
- **WHEN** `compactTranscript` throws an Error
- **THEN** the system SHALL truncate the transcript to the system prompt + last 20 messages
- **AND** an event of type `compaction_failed` SHALL be emitted with the error message
- **AND** the agent SHALL continue running

### Requirement: Compaction state is observable from useAgentStore
The system SHALL expose a `compactionInProgress` boolean per session.

#### Scenario: UI shows compaction indicator
- **WHEN** `maybeCompact` begins
- **THEN** the active session's `compactionInProgress` SHALL be set to `true`
- **AND** when completed (success or fallback), it SHALL be set back to `false`
