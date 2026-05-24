## 1. Agent Runtime Core

- [x] 1.1 Create `src/services/ai/agent/prompts.ts` — define `MARKDOWN_AGENT_SYSTEM_PROMPT` constant with Markdown Writing Agent persona, tool descriptions, and behavioral rules
- [x] 1.2 Create `src/services/ai/agent/markdownAgent.ts` — implement `createMarkdownAgent()` factory: read AI config, construct Pi `streamSimple` as streamFn, inject tools from `getAllTools()`, set system prompt and `toolExecution: "sequential"`
- [x] 1.3 Create `src/services/ai/agent/eventMapper.ts` — define `MarkdownAgentEvent` type union and `mapPiEvent(event: AgentEvent): MarkdownAgentEvent | null` mapping function

## 2. Agent State Management

- [x] 2.1 Define `AgentStoreMessage` and `ToolCallRecord` types in `src/stores/useAgentStore.ts`
- [x] 2.2 Create `useAgentStore` with initial state: `isRunning`, `messages`, `toolCalls`, `pendingPatches`, `error`
- [x] 2.3 Implement `startAgent(userMessage)` action — create/reuse Agent instance, subscribe to events, call `agent.prompt()`
- [x] 2.4 Implement `cancelAgent()` action — call `agent.abort()`, set `isRunning = false`
- [x] 2.5 Implement event dispatch logic — on each mapped event, update `messages` / `toolCalls` / `pendingPatches` / `isRunning` / `error`
- [x] 2.6 Implement `applyPatch(patchId)` — dispatch editor events based on patch type (`editor:replace-selection` / `editor:insert` / update content)
- [x] 2.7 Implement `rejectPatch(patchId)`, `applyAllPatches()`, `rejectAllPatches()`
- [x] 2.8 Implement `clearHistory()` action — reset messages, toolCalls, pendingPatches, error

## 3. Store Integration

- [x] 3.1 Extend `AIMode` type in `src/stores/useAIStore.ts` — add `'agent'` to the union
- [x] 3.2 Update `src/services/ai/agent/index.ts` — export `createMarkdownAgent`, `MarkdownAgentEvent`, event mapper, and prompts

## 4. Agent Panel UI — AgentMode

- [x] 4.1 Create `src/components/ai-panel/AgentMode.tsx` — message list (scrollable) + input area (textarea + send button + cancel button)
- [x] 4.2 Implement message rendering — user messages right-aligned, assistant messages with Markdown rendering, streaming indicator
- [x] 4.3 Implement input handling — Enter to send, Shift+Enter for newline, disable while running, show cancel button

## 5. Agent Panel UI — Tool & Patch Components

- [x] 5.1 Create `src/components/ai-panel/AgentToolCallLog.tsx` — list tool calls with status icons (spinner/check/error), expandable args/result
- [x] 5.2 Create `src/components/ai-panel/DiffPreview.tsx` — render patch diffs (replace_selection: red/green inline, insert_at_cursor: green insertion, replace_document: summary)
- [x] 5.3 Create `src/components/ai-panel/PatchActions.tsx` — per-patch Apply/Reject buttons + batch Apply All/Reject All

## 6. AIPanel Integration

- [x] 6.1 Modify `src/components/ai-panel/AIPanel.tsx` — add Agent tab (icon + label), render `AgentMode` when `mode === 'agent'`
- [x] 6.2 Add error banner in AgentMode — display `useAgentStore.error` with retry option

## 7. Verification

- [x] 7.1 Verify TypeScript compilation passes with zero errors
- [x] 7.2 Verify Agent can be started from UI — input message → agent runs → streaming text appears → tool calls log → patches generated
- [x] 7.3 Verify Patch apply/reject works — clicking Apply dispatches correct editor event, clicking Reject removes patch
