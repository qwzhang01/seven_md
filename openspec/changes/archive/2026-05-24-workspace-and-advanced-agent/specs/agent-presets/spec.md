## ADDED Requirements

### Requirement: Built-in Agent presets are defined as data
The system SHALL provide a list of built-in Agent presets in `src/services/ai/agent/agentPresets.ts`.

#### Scenario: Preset shape
- **WHEN** the preset list is inspected
- **THEN** each preset SHALL be an object with `{ id: string, label: string, icon?: string, prompt: string, requiresSelection: boolean, category?: string }`
- **AND** `id` SHALL be unique kebab-case

#### Scenario: Built-in preset list
- **WHEN** the module exports `BUILTIN_PRESETS`
- **THEN** it SHALL include at least the following ids:
  - `organize-structure` — 整理文章结构（标题层级 + 段落组织）
  - `generate-toc` — 生成目录
  - `expand-selection` — 扩写选区（`requiresSelection: true`）
  - `draft-to-article` — 草稿转正文
  - `validate-links` — 检查链接
  - `generate-readme` — 生成 README

### Requirement: Preset trigger respects selection requirement
The system SHALL guard preset execution based on `requiresSelection`.

#### Scenario: requiresSelection but no selection
- **WHEN** a preset with `requiresSelection: true` is triggered while `useAIStore.selectedText` is null/empty
- **THEN** the AgentMode UI SHALL display a non-blocking notification "请先选中文本" and SHALL NOT start the agent

#### Scenario: requiresSelection and selection present
- **WHEN** a preset with `requiresSelection: true` is triggered with a non-empty selection
- **THEN** the agent SHALL be started with the preset prompt as user message
- **AND** the agent's `get_selection` tool SHALL be available to retrieve the selection text

### Requirement: Presets are surfaced in AgentMode UI
The system SHALL render a preset bar in the AgentMode component.

#### Scenario: Preset bar renders all built-in presets
- **WHEN** AgentMode is mounted
- **THEN** an `AgentPresetBar` component SHALL render each built-in preset as a clickable chip
- **AND** the chip SHALL show the preset's icon and label

#### Scenario: Clicking a preset starts the agent
- **WHEN** the user clicks a preset chip in AgentPresetBar
- **THEN** `useAgentStore.startAgent(preset.prompt)` SHALL be called for the active session
- **AND** the prompt SHALL appear as a user message in the conversation list

#### Scenario: Preset chip disabled when agent is running
- **WHEN** the active session's `isRunning` is true
- **THEN** all preset chips SHALL be disabled and visually dimmed
