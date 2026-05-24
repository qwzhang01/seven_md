### Requirement: Pi AI vendor module provides LLM streaming interface
The system SHALL include a vendored Pi AI module at `src/lib/pi/ai/` that exposes `stream()` and `complete()` functions for LLM API calls.

#### Scenario: Import stream function
- **WHEN** application code imports `stream` from `@pi/ai`
- **THEN** the import SHALL resolve to `src/lib/pi/ai/index.ts`
- **AND** TypeScript compilation SHALL succeed without errors

#### Scenario: Import complete function
- **WHEN** application code imports `complete` from `@pi/ai`
- **THEN** the import SHALL resolve to `src/lib/pi/ai/index.ts`
- **AND** TypeScript compilation SHALL succeed without errors

### Requirement: Pi AI vendor module provides Provider registration
The system SHALL include Provider registration APIs (`registerApiProvider`, `getApiProvider`) that allow registering custom API providers.

#### Scenario: Register a provider
- **WHEN** code calls `registerApiProvider('openai', provider)`
- **THEN** the provider SHALL be registered in the internal registry
- **AND** subsequent calls to `getApiProvider('openai')` SHALL return the registered provider

### Requirement: Pi AI vendor module includes only openai-completions Provider
The system SHALL include only the `openai-completions` provider implementation, removing all other providers.

#### Scenario: openai-completions provider exists
- **WHEN** the `src/lib/pi/ai/providers/` directory is inspected
- **THEN** it SHALL contain `openai-completions.ts`
- **AND** it SHALL contain `transform-messages.ts` (dependency)
- **AND** it SHALL contain `simple-options.ts` (dependency)
- **AND** it SHALL contain `cloudflare.ts` (Cloudflare Workers AI adapter)
- **AND** it SHALL contain `github-copilot-headers.ts` (GitHub Copilot header helper)
- **AND** it SHALL contain `openai-prompt-cache.ts` (prompt cache support)
- **AND** it SHALL NOT contain `anthropic.ts`, `amazon-bedrock.ts`, `google.ts`, `mistral.ts`, or `azure-openai-responses.ts`

### Requirement: Pi AI vendor module provides minimal model definitions
The system SHALL include a `models-minimal.ts` file that defines commonly used models, replacing the 416KB generated file.

#### Scenario: Model definitions are available
- **WHEN** code calls `getModel('gpt-4o')` from `@pi/ai`
- **THEN** it SHALL return a valid model definition object
- **AND** the `models-minimal.ts` file SHALL be less than 10KB in size

#### Scenario: Generated models file is not included
- **WHEN** the `src/lib/pi/ai/` directory is inspected
- **THEN** it SHALL NOT contain `models.generated.ts`

### Requirement: Pi AI vendor module contains no Node.js dependencies
The system SHALL NOT include any code that imports Node.js built-in modules (`node:fs`, `node:http`, `node:os`, `node:path`, etc.).

#### Scenario: No Node imports in AI vendor
- **WHEN** the files under `src/lib/pi/ai/` are searched for `from 'node:` or `require('node:`
- **THEN** zero matches SHALL be found

#### Scenario: env-api-keys is excluded
- **WHEN** the `src/lib/pi/ai/` directory is inspected
- **THEN** it SHALL NOT contain `env-api-keys.ts`
- **AND** it SHALL NOT contain `utils/node-http-proxy.ts`
- **AND** it SHALL NOT contain `utils/oauth/` directory

### Requirement: Pi AI vendor utility modules are available
The system SHALL include necessary utility modules for stream processing and validation.

#### Scenario: Utility files exist
- **WHEN** the `src/lib/pi/ai/utils/` directory is inspected
- **THEN** it SHALL contain `event-stream.ts`
- **AND** it SHALL contain `json-parse.ts`
- **AND** it SHALL contain `validation.ts`
- **AND** it SHALL contain `overflow.ts`
- **AND** it SHALL contain `sanitize-unicode.ts`
- **AND** it SHALL contain `typebox-helpers.ts`
