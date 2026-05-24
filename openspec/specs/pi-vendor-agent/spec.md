### Requirement: Pi Agent vendor module provides Agent class and agentLoop
The system SHALL include a vendored Pi Agent module at `src/lib/pi/agent/` that exposes the `Agent` class and `agentLoop()` function.

#### Scenario: Import Agent class
- **WHEN** application code imports `Agent` from `@pi/agent`
- **THEN** the import SHALL resolve to `src/lib/pi/agent/index.ts`
- **AND** TypeScript compilation SHALL succeed without errors

#### Scenario: Import agentLoop function
- **WHEN** application code imports `agentLoop` from `@pi/agent`
- **THEN** the import SHALL resolve to `src/lib/pi/agent/index.ts`
- **AND** TypeScript compilation SHALL succeed without errors

### Requirement: Pi Agent vendor module provides InMemory session management
The system SHALL include InMemory session storage implementation (not JSONL file-based storage).

#### Scenario: InMemorySessionRepo is available
- **WHEN** code imports `InMemorySessionRepo` from `@pi/agent`
- **THEN** the import SHALL succeed
- **AND** instances SHALL store session data in memory only (no file system access)

#### Scenario: JSONL session storage is excluded
- **WHEN** the `src/lib/pi/agent/harness/session/` directory is inspected
- **THEN** it SHALL contain `memory-repo.ts` and `memory-storage.ts`
- **AND** it SHALL NOT contain `jsonl-repo.ts` or `jsonl-storage.ts`

### Requirement: Pi Agent vendor module provides context compaction
The system SHALL include the compaction subsystem for summarizing long conversation histories.

#### Scenario: Compaction module exists
- **WHEN** the `src/lib/pi/agent/harness/compaction/` directory is inspected
- **THEN** it SHALL contain `compaction.ts`
- **AND** it SHALL contain `branch-summarization.ts`
- **AND** it SHALL contain `utils.ts`

### Requirement: Pi Agent vendor module contains no Node.js dependencies
The system SHALL NOT include any code that imports Node.js built-in modules.

#### Scenario: No Node imports in Agent vendor
- **WHEN** the files under `src/lib/pi/agent/` are searched for `from 'node:` or `require('node:`
- **THEN** zero matches SHALL be found

#### Scenario: Node-only modules are excluded
- **WHEN** the `src/lib/pi/agent/` directory is inspected
- **THEN** it SHALL NOT contain `node.ts`
- **AND** it SHALL NOT contain `harness/env/nodejs.ts`
- **AND** it SHALL NOT contain `harness/session/jsonl-repo.ts`

### Requirement: Pi Agent vendor module provides AgentTool type definition
The system SHALL export the `AgentTool` type that defines the interface for tool implementations.

#### Scenario: AgentTool type is importable
- **WHEN** code imports `type AgentTool` from `@pi/agent`
- **THEN** the TypeScript compilation SHALL succeed
- **AND** the type SHALL include `name`, `description`, `schema`, and `execute` fields

### Requirement: Vite and TypeScript configuration resolves @pi/* aliases
The system SHALL configure path aliases so that `@pi/ai` and `@pi/agent` resolve to `src/lib/pi/ai` and `src/lib/pi/agent` respectively.

#### Scenario: Vite alias resolution
- **WHEN** Vite processes an import of `@pi/ai`
- **THEN** it SHALL resolve to `<project_root>/src/lib/pi/ai/index.ts`

#### Scenario: TypeScript path resolution
- **WHEN** TypeScript type-checks an import of `@pi/agent`
- **THEN** it SHALL resolve to `<project_root>/src/lib/pi/agent/index.ts`
- **AND** `npx tsc --noEmit` SHALL pass without path resolution errors

### Requirement: Required npm dependencies are installed
The system SHALL have `@sinclair/typebox`, `partial-json`, and `yaml` packages installed as dependencies.

#### Scenario: Dependencies in package.json
- **WHEN** `package.json` dependencies are inspected
- **THEN** it SHALL list `@sinclair/typebox` (^0.34.0 or compatible)
- **AND** it SHALL list `partial-json` (^0.1.7 or compatible)
- **AND** it SHALL list `yaml` (^2.4.0 or compatible)

#### Scenario: Dependencies are importable
- **WHEN** Pi vendor code imports from `@sinclair/typebox`
- **THEN** the module SHALL resolve correctly
- **AND** TypeScript compilation SHALL succeed
