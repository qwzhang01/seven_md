## Context

The Seven MD editor currently uses a single-file state architecture where `FileState` contains only one file's path, content, and dirty state. When users open a new file, the previous file's state is completely replaced, losing cursor position, scroll position, and unsaved changes.

This design proposes a multi-tab architecture that maintains an array of open files with independent states while preserving the existing codebase's simplicity and performance characteristics.

**Current Architecture:**
```
AppState {
  file: {
    path: string | null
    content: string
    isDirty: boolean
  }
}
```

**Constraints:**
- Must maintain backward compatibility with existing file operations
- Must preserve React performance (avoid unnecessary re-renders)
- Must handle large files efficiently (memory management)
- Must integrate seamlessly with existing components (FileTree, MenuBar, Editor)
- Must support Tauri's IPC for file operations

## Goals / Non-Goals

**Goals:**
- Enable opening multiple files simultaneously in separate tabs
- Preserve editing state (content, cursor, scroll) for each tab independently
- Provide intuitive tab UI with drag-and-drop reordering
- Support tab persistence across app sessions
- Maintain performance with up to 50+ open tabs
- Integrate seamlessly with existing file tree and menu systems

**Non-Goals:**
- Split view / side-by-side editing (future enhancement)
- Tab groups or pinned tabs (can be added later)
- Tab color coding or custom naming (future enhancement)
- Cloud sync for open tabs (separate feature)
- Unlimited tabs (will implement reasonable limits)

## Decisions

### 1. State Architecture: Tab-Centric vs File-Centric

**Decision:** Use a tab-centric state model with `TabState` array and `activeTabId`.

**Rationale:**
- **Tab-Centric Model:** Maintains an array of tabs, where each tab contains file path, content, cursor state, scroll position, and dirty flag. Active tab is tracked by ID.
- **File-Centric Model:** Would maintain a separate file cache and tabs would reference cached files by path.
- **Why Tab-Centric:**
  - Simpler mental model - tabs own their state
  - Easier to handle unsaved buffers (files not yet saved to disk)
  - Better for per-tab metadata (scroll position, cursor)
  - Avoids complex cache invalidation logic
- **Trade-off:** Slightly higher memory usage if same file opened multiple times (acceptable edge case)

**Implementation:**
```typescript
interface TabState {
  id: string // Unique tab ID (UUID)
  path: string | null // File path (null for unsaved files)
  content: string
  isDirty: boolean
  cursorPosition: CursorPosition
  scrollPosition: { line: number }
  lastAccessed: number // For LRU eviction
}

interface TabsState {
  tabs: TabState[]
  activeTabId: string | null
  tabOrder: string[] // Ordered list of tab IDs for drag-and-drop
}

// New AppState structure
interface AppState {
  folder: FolderState
  tabs: TabsState // Replaces single FileState
  ui: UIState
  editor: EditorState
}
```

### 2. Tab Identification: UUID vs File Path

**Decision:** Use UUID for tab IDs, not file path.

**Rationale:**
- Allows opening the same file in multiple tabs (useful for comparing sections)
- Handles unsaved "Untitled" files without path
- Stable identifier even if file is renamed/moved
- Simpler than path-based lookup with conflict resolution

**Alternative Considered:** File path as ID would prevent duplicate tabs but limits flexibility.

### 3. Active Tab Tracking: Single vs Multiple Active States

**Decision:** Track only one active tab at a time.

**Rationale:**
- Matches user mental model (one active editing context)
- Simpler state management
- Editor, preview, and status bar can all derive state from active tab
- Future: Can extend to split view by having multiple active tabs per split

### 4. Tab Bar Rendering: Virtual Scrolling vs Simple Rendering

**Decision:** Implement simple rendering initially, add virtual scrolling if performance issues arise.

**Rationale:**
- Most users open <20 tabs (virtual scrolling overkill initially)
- Simple implementation reduces complexity
- Can add virtual scrolling later without changing architecture
- Premature optimization concern

**Threshold for Virtual Scrolling:** If tab count exceeds 30, show overflow menu ("...X more tabs") or scroll buttons.

### 5. State Persistence: Full Content vs File Paths Only

**Decision:** Persist both file paths AND unsaved content.

**Rationale:**
- **Paths Only:** Loses unsaved work on app restart (bad UX)
- **Full Content:** Restores complete state but increases storage
- **Hybrid:** Persist paths for saved files, content for dirty tabs
- **Decision:** Persist full content for dirty tabs, paths for clean tabs
- **Trade-off:** Slightly larger storage, but acceptable for <50 tabs

**Implementation:**
```typescript
interface PersistedTabState {
  id: string
  path: string | null
  content?: string // Only persisted if isDirty=true
  isDirty: boolean
  cursorPosition: CursorPosition
  scrollPosition: { line: number }
}
```

### 6. Drag-and-Drop Implementation: Native HTML5 vs Third-Party Library

**Decision:** Use native HTML5 Drag and Drop API with custom implementation.

**Rationale:**
- No additional dependencies (keeps bundle small)
- Full control over drag preview and behavior
- Simple use case (horizontal reordering in tab bar)
- Libraries like `react-dnd` add complexity for minimal benefit

**Implementation:** Use `draggable`, `onDragStart`, `onDragOver`, `onDrop` events.

### 7. Tab Close Behavior: Warn Always vs Smart Warning

**Decision:** Warn only if tab has unsaved changes (smart warning).

**Rationale:**
- **Always Warn:** Annoying for users closing clean tabs
- **Never Warn:** Risk of data loss
- **Smart Warning:** Best balance - warn only when needed
- **Additional UX:** Add "Don't ask again" option for power users (future)

**Implementation:**
```typescript
const handleCloseTab = (tabId: string) => {
  const tab = tabs.find(t => t.id === tabId)
  if (tab?.isDirty) {
    showConfirmDialog({
      title: 'Unsaved Changes',
      message: 'This file has unsaved changes. Close anyway?',
      options: ['Save', 'Discard', 'Cancel']
    })
  } else {
    dispatch({ type: 'CLOSE_TAB', payload: tabId })
  }
}
```

### 8. Memory Management: Unlimited Tabs vs LRU Eviction

**Decision:** Implement soft limit of 50 tabs with LRU (Least Recently Used) eviction for clean tabs.

**Rationale:**
- Prevents memory exhaustion from hundreds of open tabs
- LRU preserves frequently-used tabs
- Never evict dirty tabs (user might lose work)
- Show warning when approaching limit: "You have many tabs open. Consider closing unused ones."

**Eviction Strategy:**
```typescript
const MAX_TABS = 50
const EVICTION_THRESHOLD = 40

const maybeEvictTabs = (tabs: TabState[]) => {
  if (tabs.length < EVICTION_THRESHOLD) return tabs
  
  // Evict oldest clean tabs
  const cleanTabs = tabs.filter(t => !t.isDirty)
  const sortedByAccess = cleanTabs.sort((a, b) => b.lastAccessed - a.lastAccessed)
  const toEvict = sortedByAccess.slice(MAX_TABS - EVICTION_THRESHOLD)
  
  return tabs.filter(t => !toEvict.includes(t))
}
```

## Risks / Trade-offs

### Risk 1: Performance Degradation with Many Tabs
**Risk:** Opening 50+ files could slow down the app due to memory pressure and React re-renders.
**Mitigation:**
- Implement LRU eviction for clean tabs
- Use React.memo for Tab components
- Lazy load tab content (only active tab in memory, others cached to disk)
- Add performance monitoring to detect issues early

### Risk 2: State Sync Issues
**Risk:** Tab state might get out of sync with actual file content (e.g., file modified externally).
**Mitigation:**
- Implement file watcher to detect external changes
- Show warning banner: "File changed on disk. Reload?"
- Add "Reload from Disk" option in tab context menu
- Track file modification timestamps for conflict detection

### Risk 3: Migration Complexity
**Risk:** Existing users might lose current file state during upgrade to multi-tab architecture.
**Mitigation:**
- Implement migration logic to convert single-file state to single tab
- Preserve unsaved content during migration
- Test thoroughly with existing test suites
- Add fallback: If migration fails, save unsaved content to temp file

### Risk 4: UI Complexity
**Risk:** Tab bar might clutter the interface, especially on small screens.
**Mitigation:**
- Hide tab bar when only one tab is open (VS Code behavior)
- Add horizontal scrolling for tab bar overflow
- Implement responsive design for small screens
- Allow users to toggle tab bar visibility (future preference)

### Risk 5: Keyboard Shortcut Conflicts
**Risk:** New tab shortcuts might conflict with existing OS or app shortcuts.
**Mitigation:**
- Use standard shortcuts (Cmd/Ctrl+W, Cmd/Ctrl+Tab) widely adopted by editors
- Allow users to customize shortcuts (future enhancement)
- Test on macOS, Windows, Linux for conflicts

## Migration Plan

### Phase 1: State Architecture Refactoring (Week 1)
1. Create new `TabState` and `TabsState` interfaces
2. Update `AppState` to use `TabsState` instead of `FileState`
3. Refactor reducers to handle tab actions
4. Write unit tests for new state management
5. Implement migration logic for existing persisted state

### Phase 2: Core Tab Management (Week 2)
1. Implement `useTabManagement` hook
2. Create actions: OPEN_TAB, CLOSE_TAB, SWITCH_TAB, REORDER_TABS
3. Update `useFileOperations` to work with tabs
4. Integrate with file tree click handler
5. Test tab lifecycle (open, switch, close)

### Phase 3: Tab Bar UI (Week 3)
1. Build `TabBar` component with basic styling
2. Add drag-and-drop reordering
3. Implement tab context menu
4. Add dirty indicator (dot or icon)
5. Test UI interactions and accessibility

### Phase 4: Persistence & Polish (Week 4)
1. Implement tab state persistence
2. Add LRU eviction logic
3. Integrate keyboard shortcuts
4. Performance testing with 50+ tabs
5. Bug fixes and edge case handling

### Rollback Strategy
- If critical issues arise, revert to single-file state (retain migration compatibility)
- Backup persisted state before migration
- Add feature flag to disable multi-tab if needed
- Monitor error rates in production

## Open Questions

1. **Tab Naming for Unsaved Files:** Should unsaved files be named "Untitled-1", "Untitled-2" or allow users to name them? (TBD: Follow VS Code convention with "Untitled-N")

2. **Tab Limit User Experience:** Should we show a modal when users approach tab limit, or silently evict? (TBD: Show notification at 40 tabs, evict silently at 50)

3. **External File Change Detection:** Should we auto-reload clean tabs when files change externally, or always prompt? (TBD: Prompt for dirty tabs, auto-reload clean tabs with notification)

4. **Tab Bar Visibility:** Should tab bar hide when only one tab exists, or always show? (TBD: Hide when single tab, like VS Code)

5. **Split View Integration:** How will tabs work with future split view feature? (TBD: Each split has its own active tab, share tab pool)
