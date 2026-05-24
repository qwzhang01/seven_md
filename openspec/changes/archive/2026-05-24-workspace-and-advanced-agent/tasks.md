## 1. Permission Model Foundation

- [x] 1.1 Define `ToolPermission` type and `PermissionModel` interface in `src/services/ai/agent/permissionModel.ts`
- [x] 1.2 Implement default permission map for built-in tools (auto / confirm / deny)
- [x] 1.3 Add session-scoped override map (in-memory) and `getEffectivePermission(name, sessionId)`
- [x] 1.4 Implement `setSessionPermissionOverride` and `clearSessionOverrides`
- [x] 1.5 Wrap registered tools with permission gating in `toolRegistry.ts` (auto → passthrough; confirm → await UI; deny → throw)

## 2. Workspace Path Guard

- [x] 2.1 Create `src/services/ai/agent/tools/workspaceGuard.ts` with `assertInsideWorkspace(path)`
- [x] 2.2 Implement absolute/relative path resolution against `useWorkspaceStore.workspacePath`
- [x] 2.3 Implement traversal detection (normalize `..`, reject prefix-mismatch)
- [x] 2.4 Add unit tests for typical traversal payloads (`../../etc/passwd`, `./..//../`, absolute outside root)
- [x] 2.5 Add no-workspace short-circuit returning friendly error

## 3. Workspace AgentTools

- [x] 3.1 Create `src/services/ai/agent/tools/fileTools.ts`
- [x] 3.2 Implement `search_workspace` (content + filename modes) using Tauri `search_in_files`
- [x] 3.3 Implement `read_workspace_file` with extension check + 200KB size limit
- [x] 3.4 Implement `create_markdown_file` with existence check + extension check
- [x] 3.5 Implement `list_workspace_files` with 500-entry truncation
- [x] 3.6 Each tool calls `assertInsideWorkspace` before invoking Tauri commands
- [x] 3.7 Each tool returns plain JSON-serializable results (success or `{ error: string }`)
- [x] 3.8 Register all four tools in `toolRegistry` with the correct default permissions

## 4. Markdown AgentTools

- [x] 4.1 Create `src/services/ai/agent/tools/markdownTools.ts`
- [x] 4.2 Implement `generate_toc` (returns `insert_at_cursor` patch with bullet TOC)
- [x] 4.3 Implement `format_markdown_table` (parse → pad → reassemble; replace_selection patch)
- [x] 4.4 Implement `validate_markdown_links` (local file existence; external links marked unchecked)
- [x] 4.5 Implement `generate_mermaid` (returns insert_at_cursor patch with fenced mermaid block)
- [x] 4.6 Register all four tools in `toolRegistry` with the correct default permissions
- [x] 4.7 Add a 100KB processing length cap inside each markdown tool

## 5. Compaction Module

- [x] 5.1 Create `src/services/ai/agent/compaction.ts`
- [x] 5.2 Implement `estimateTokens(messages)` heuristic
- [x] 5.3 Implement `tokenThresholdFor(modelId)` (80% of context window with sane default)
- [x] 5.4 Wire `maybeCompact(session)` to Pi's `compactTranscript` from `src/lib/pi/agent/harness/compaction/`
- [x] 5.5 Implement truncation fallback (system prompt + last 20 messages) on compaction error
- [x] 5.6 Emit `compaction_done` and `compaction_failed` events through the event mapper

## 6. Markdown Agent Runtime Updates

- [x] 6.1 Extend `createMarkdownAgent({ modelId? })` signature in `markdownAgent.ts`
- [x] 6.2 Resolve modelId precedence: arg → `useAgentStore.activeModelId` → AI config default
- [x] 6.3 Inject `maybeCompact` call before each `prompt()` invocation
- [x] 6.4 Attach modelId metadata to the returned Agent for compaction lookup
- [x] 6.5 Update `prompts.ts` system prompt to enumerate workspace + markdown tools and workspace path constraints

## 7. Event Mapper Extensions

- [x] 7.1 Extend `MarkdownAgentEvent` union with `confirmation_required`, `compaction_done`, `compaction_failed`
- [x] 7.2 Map permission gate suspensions to `confirmation_required` events
- [x] 7.3 Map compaction module hooks to compaction events- [ ] 7.4 Update unit tests for event mapping

## 8. useAgentStore Multi-Session Refactor

- [x] 8.1 Define `AgentSession` and updated store shape in `src/stores/useAgentStore.ts`
- [x] 8.2 Implement default session bootstrap on first access
- [x] 8.3 Implement `createSession`, `setActiveSession`, `deleteSession`
- [x] 8.4 Implement `activeModelId` field with localStorage hydration / persistence (`seven-markdown-agent-active-model`)
- [x] 8.5 Implement `setActiveModel(modelId)` action
- [x] 8.6 Add `pendingConfirmations`, `compactionInProgress` to per-session state
- [x] 8.7 Implement `approveConfirmation`, `rejectConfirmation` actions with timeout (5 min auto-reject)
- [x] 8.8 Migrate existing single-session actions (`startAgent`, `cancelAgent`, `applyPatch`, etc.) to operate on the active session
- [x] 8.9 Add `beforeunload` handler to abort all running sessions

## 9. Agent Presets Data + Bus

- [x] 9.1 Create `src/services/ai/agent/agentPresets.ts` with `BUILTIN_PRESETS` (6 entries)
- [x] 9.2 Define preset shape `{ id, label, icon, prompt, requiresSelection, category }`
- [x] 9.3 Define `agent:run-preset` CustomEvent constant and dispatch helper
- [x] 9.4 AgentMode listens for `agent:run-preset` and triggers preset on the active session
- [x] 9.5 Selection guard: if `requiresSelection` and no selection, show notification and abort

## 10. AgentMode UI Components

- [x] 10.1 Create `src/components/ai-panel/AgentPresetBar.tsx`
- [x] 10.2 Create `src/components/ai-panel/AgentModelSelector.tsx`
- [x] 10.3 Create `src/components/ai-panel/AgentSessionDrawer.tsx` with new/select/delete actions
- [x] 10.4 Create `src/components/ai-panel/AgentConfirmPanel.tsx` rendering pending confirmation entries
- [x] 10.5 Compose new components into `AgentMode.tsx` (preset bar top, model selector + session button in header, confirm panel above patch list)
- [x] 10.6 Add compaction indicator banner inside AgentMode

## 11. Command Palette + Context Menu Integration

- [x] 11.1 Add command entries `agent.preset.<id>` for every built-in preset, grouped under "Agent" category
- [x] 11.2 Wire commands to dispatch `agent:run-preset` with the preset id
- [x] 11.3 Add "Run with Agent…" submenu to editor context menu (selection-aware filtering)
- [x] 11.4 Add "Run with Agent…" submenu to explorer context menu (workspace-relevant presets)
- [x] 11.5 Verify dispatched events switch `useAIStore.mode` to `'agent'` automatically

## 12. Verification

- [x] 12.1 Verify TypeScript compilation passes with zero errors
- [x] 12.2 Verify workspace tools fail closed when no workspace is open
- [x] 12.3 Verify path traversal payloads are rejected by workspaceGuard tests
- [x] 12.4 Verify confirm-permission tools block until UI approval; reject path returns tool error to Agent
- [x] 12.5 Verify long conversation triggers compaction and UI shows indicator
- [x] 12.6 Verify model switching does not affect a running session and is persisted across reloads
- [x] 12.7 Verify multi-session: create / switch / delete; deleting active session falls back to most-recent remaining session
- [x] 12.8 Verify all 6 presets dispatchable from preset bar, command palette, and context menu
- [x] 12.9 Verify Markdown tools (`generate_toc`, `format_markdown_table`, `validate_markdown_links`, `generate_mermaid`) produce valid patches and are appliable
