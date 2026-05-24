## ADDED Requirements

### Requirement: agent:run-preset event bus integrates external triggers
The system SHALL define a custom DOM event `agent:run-preset` whose payload is `{ presetId: string }`.

#### Scenario: Event triggers AgentMode
- **WHEN** any component dispatches `new CustomEvent('agent:run-preset', { detail: { presetId } })`
- **THEN** AgentMode SHALL switch `useAIStore.mode` to `'agent'`
- **AND** AgentMode SHALL look up the preset by id and trigger it (respecting `requiresSelection`)

#### Scenario: Unknown preset id is ignored
- **WHEN** an `agent:run-preset` event is dispatched with an unknown id
- **THEN** AgentMode SHALL log a warning and SHALL NOT start the agent

### Requirement: Command palette exposes Agent preset commands
The system SHALL register one command per built-in preset in the command palette.

#### Scenario: Command id and label
- **WHEN** the command palette is opened
- **THEN** each preset SHALL appear as a command with id `agent.preset.<presetId>` and label `Agent: <label>`
- **AND** all preset commands SHALL be grouped under category "Agent"

#### Scenario: Selecting a command dispatches agent:run-preset
- **WHEN** the user selects an agent preset command in the command palette
- **THEN** the system SHALL dispatch `agent:run-preset` with the preset's id

### Requirement: Editor right-click menu offers Run-with-Agent submenu
The system SHALL add a "Run with Agent…" submenu to the editor context menu.

#### Scenario: Submenu lists selection-aware presets
- **WHEN** the user right-clicks in the editor with a non-empty selection
- **THEN** the context menu SHALL include a "Run with Agent…" submenu
- **AND** the submenu SHALL list only presets where `requiresSelection: true` (e.g., `expand-selection`)
- **AND** clicking an entry SHALL dispatch `agent:run-preset`

#### Scenario: Submenu lists global presets when no selection
- **WHEN** the user right-clicks in the editor with no selection
- **THEN** the "Run with Agent…" submenu SHALL list presets where `requiresSelection: false` (e.g., `organize-structure`, `generate-toc`)

### Requirement: Explorer right-click menu offers workspace presets
The system SHALL add a "Run with Agent…" submenu to the explorer (file tree) context menu.

#### Scenario: Workspace preset entries
- **WHEN** the user right-clicks a folder or file in the explorer
- **THEN** the context menu SHALL include "Run with Agent…" with entries `generate-readme` and `validate-links`
- **AND** clicking an entry SHALL dispatch `agent:run-preset`
