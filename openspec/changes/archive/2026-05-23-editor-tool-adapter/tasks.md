## 1. Types & Patch Protocol

- [x] 1.1 Create `src/services/ai/agent/types.ts` — define `ToolPermission` type (`'auto' | 'confirm' | 'deny'`) and `RegisteredTool` interface
- [x] 1.2 Create `src/services/ai/agent/patchProtocol.ts` — define `MarkdownPatch` discriminated union type (5 patch types + metadata fields: id, applied, requiresConfirmation, createdAt)

## 2. Markdown Utilities

- [x] 2.1 Create `src/utils/markdownUtils.ts` — implement `extractTitle(content)`, `extractHeadings(content)`, `calculateCursorOffset(content, line, column)`, `getSelectionText(content, from, to)`
- [x] 2.2 Ensure `extractHeadings` skips headings inside fenced code blocks

## 3. Read Tools

- [x] 3.1 Create `src/services/ai/agent/tools/editorTools.ts` — implement `get_current_document` tool (reads useFileStore active tab)
- [x] 3.2 Implement `get_selection` tool (reads useAIStore.selectedText + useEditorStore.selection)
- [x] 3.3 Implement `get_cursor_position` tool (reads useEditorStore.cursorPosition)
- [x] 3.4 Implement `extract_headings` tool (calls markdownUtils.extractHeadings on current document)

## 4. Write Tools

- [x] 4.1 Implement `replace_selection` tool — validates selection exists, returns MarkdownPatch of type `replace_selection`
- [x] 4.2 Implement `insert_at_cursor` tool — calculates cursor offset, returns MarkdownPatch of type `insert_at_cursor`
- [x] 4.3 Implement `replace_document` tool — returns MarkdownPatch of type `replace_document`

## 5. Tool Registry

- [x] 5.1 Create `src/services/ai/agent/toolRegistry.ts` — implement `registerTool()`, `getTool()`, `getAllTools()`, `getToolPermission()`
- [x] 5.2 Create `src/services/ai/agent/tools/index.ts` — register all 7 editor tools with correct permission levels (4 auto + 3 confirm)

## 6. Integration & Verification

- [x] 6.1 Ensure all tool schemas use `@sinclair/typebox` `Type.Object()` and compile without TS errors
- [x] 6.2 Verify `getAllTools()` returns an array compatible with Pi `Agent` constructor's `tools` option
- [x] 6.3 Export tool registry and patch types from `src/services/ai/agent/index.ts`
