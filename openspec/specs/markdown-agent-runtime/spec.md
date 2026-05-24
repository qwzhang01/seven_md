# markdown-agent-runtime Specification

## Purpose

Defines the Markdown Agent runtime, including the Pi `Agent` factory, system prompt, event mapper that translates Pi `AgentEvent` into application-layer `MarkdownAgentEvent`, and the discriminated union event types consumed by the UI/state layers.

## Requirements

### Requirement: Markdown Agent wraps Pi Agent class with Seven Markdown configuration
The system SHALL provide a `createMarkdownAgent()` factory function at `src/services/ai/agent/markdownAgent.ts` that instantiates a Pi `Agent` with the correct stream function, tools, and system prompt.

#### Scenario: Agent creation with current AI config
- **WHEN** `createMarkdownAgent()` is called
- **THEN** it SHALL return an `Agent` instance configured with:
  - `streamFn` derived from the current AI provider config (model, apiKey, baseURL)
  - `tools` from `getAllTools()` (the 7 editor tools)
  - system prompt from `MARKDOWN_AGENT_SYSTEM_PROMPT`
  - `toolExecution` set to `"sequential"`

#### Scenario: Agent prompt sends user message
- **WHEN** `agent.prompt(userMessage)` is called with a string
- **THEN** the Pi Agent SHALL begin a run (agent_start → turns → agent_end)
- **AND** tool calls SHALL be executed against the registered editor tools
- **AND** events SHALL be emitted via `agent.subscribe()`

#### Scenario: Agent abort cancels in-progress run
- **WHEN** `agent.abort()` is called while the agent is running
- **THEN** the current run SHALL be cancelled
- **AND** no further tool calls SHALL execute
- **AND** the agent SHALL emit `agent_end` event

### Requirement: Event mapper transforms Pi events to application events
The system SHALL provide an `eventMapper` module at `src/services/ai/agent/eventMapper.ts` that maps Pi `AgentEvent` to application-layer `MarkdownAgentEvent`.

#### Scenario: message_update maps to streaming text
- **WHEN** a Pi `message_update` event is received with text content delta
- **THEN** it SHALL emit a `MarkdownAgentEvent` of type `message` with `delta` containing the new text chunk
- **AND** `content` SHALL contain the full accumulated text so far

#### Scenario: tool_execution_start maps to tool_call event
- **WHEN** a Pi `tool_execution_start` event is received
- **THEN** it SHALL emit a `MarkdownAgentEvent` of type `tool_call` with `name` and `args`

#### Scenario: tool_execution_end for write tool maps to patch event
- **WHEN** a Pi `tool_execution_end` event is received
- **AND** the tool result contains a `MarkdownPatch` (has `type` field matching patch types)
- **THEN** it SHALL emit a `MarkdownAgentEvent` of type `patch` with the patch object

#### Scenario: tool_execution_end for read tool maps to tool_result event
- **WHEN** a Pi `tool_execution_end` event is received
- **AND** the tool result does NOT contain a `MarkdownPatch`
- **THEN** it SHALL emit a `MarkdownAgentEvent` of type `tool_result` with `name` and `result`

#### Scenario: agent_end maps to done event
- **WHEN** a Pi `agent_end` event is received
- **THEN** it SHALL emit a `MarkdownAgentEvent` of type `done`

#### Scenario: turn_start maps to thinking event
- **WHEN** a Pi `turn_start` event is received
- **THEN** it SHALL emit a `MarkdownAgentEvent` of type `thinking`

### Requirement: System prompt defines Markdown Writing Agent persona
The system SHALL provide a `MARKDOWN_AGENT_SYSTEM_PROMPT` constant at `src/services/ai/agent/prompts.ts`.

#### Scenario: System prompt content
- **WHEN** the system prompt is used in Agent initialization
- **THEN** it SHALL identify the agent as "Seven Markdown Writing Agent"
- **AND** it SHALL list available tools and their descriptions
- **AND** it SHALL instruct the agent to follow the Plan → Execute → Preview pattern
- **AND** it SHALL instruct the agent to use minimal modifications (don't over-edit)
- **AND** it SHALL instruct the agent to preserve special blocks (code, mermaid, math)

### Requirement: MarkdownAgentEvent type defines application-layer events
The system SHALL define a `MarkdownAgentEvent` discriminated union type.

#### Scenario: Event types are exhaustive
- **WHEN** the type system is inspected
- **THEN** `MarkdownAgentEvent` SHALL include these types:
  - `thinking`: Agent is processing (content: string)
  - `message`: Assistant text output (content: string, delta?: string)
  - `tool_call`: Tool invocation started (name: string, args: Record<string, unknown>, toolCallId: string)
  - `tool_result`: Read tool completed (name: string, result: unknown, toolCallId: string)
  - `patch`: Write tool generated a patch (patch: MarkdownPatch, toolCallId: string)
  - `error`: Error occurred (error: string)
  - `done`: Agent run completed
