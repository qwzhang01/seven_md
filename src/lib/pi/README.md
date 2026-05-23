# Pi Vendor Source

Vendored source code from [earendil-works/pi](https://github.com/earendil-works/pi-mono).

## Source Info

- **Origin**: `@earendil-works/pi-ai` v0.75.4 + `@earendil-works/pi-agent-core` v0.75.4
- **Vendored Date**: 2026-05-23
- **Commit**: (from .ext/pi/ temporary directory)

## What's Included

### `ai/` — LLM Calling Layer
- `stream()` / `complete()` / `streamSimple()` / `completeSimple()`
- Provider registry (`registerApiProvider` / `getApiProvider`)
- Model registry (`getModel` / `getModels`)
- Only the `openai-completions` provider (compatible with all OpenAI-format APIs)
- Utilities: event-stream, json-parse, validation, overflow detection, unicode sanitization

### `agent/` — Agent Runtime
- `Agent` class + `agentLoop()`
- AgentHarness (orchestration layer)
- InMemory session management
- Context compaction (long conversation summarization)
- Prompt templates and system prompt building

## What's Excluded

- All non-openai providers (anthropic, bedrock, google, vertex, mistral, azure, cloudflare)
- `models.generated.ts` (416KB) — replaced with `models-minimal.ts`
- Node-only code (`env-api-keys.ts`, `node-http-proxy.ts`, `harness/env/nodejs.ts`)
- JSONL file storage (`jsonl-repo.ts`, `jsonl-storage.ts`)
- Skills loader (file-system dependent) — stub provided
- CLI tools, OAuth, image generation
- `pi-coding-agent` and `pi-tui` packages entirely

## Modifications from Original

1. `stream.ts`: Removed `import "./providers/register-builtins.ts"` and `export { getEnvApiKey }`
2. `providers/openai-completions.ts`: Removed `getEnvApiKey` import; `process.env.OPENAI_API_KEY` fallback replaced with mandatory `apiKey` param
3. `models.ts`: Changed import from `./models.generated.ts` to `./models-minimal.ts`
4. `agent/index.ts`: Removed `jsonl-repo`, `skills`, `shell-output` exports
5. `agent/harness/skills.ts`: Stub with only `formatSkillInvocation`
6. `agent/proxy.ts`: Fixed exhaustive check for TS `noUnusedLocals`

## Dependencies (added to project package.json)

- `openai` ^6.26.0 — OpenAI SDK (runtime, used for API calls)
- `typebox` ^1.1.38 — JSON Schema definition/validation
- `partial-json` ^0.1.7 — Streaming JSON parsing
- `yaml` ^2.9.0 — YAML parsing (prompt templates)

## Updating from Upstream

1. Check upstream changes relevant to `openai-completions.ts` and `agent-loop.ts`
2. Manually diff and cherry-pick changes
3. Run `npx tsc --noEmit` to verify no regressions
4. Update this README with new commit/version info
