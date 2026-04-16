## Context

Seven MD is a modern Markdown reader for macOS built with Tauri v2 + React 19 + TypeScript. The current title bar implementation displays file operations as standalone buttons (Open, Folder, Save), which violates desktop application design conventions. Users expect a standard menu bar with hierarchical menus (File, Edit, View, Help) similar to VS Code, Sublime Text, and other desktop editors.

The application uses:
- **Tauri v2** for native desktop integration
- **React 19** with TypeScript for the UI layer
- **Tailwind CSS** for styling
- **CodeMirror 6** for the editor component
- **lucide-react** for icons

Current constraints:
- Title bar must maintain Tauri's drag region (`data-tauri-drag-region`)
- Native window controls (close, minimize, maximize) are macOS-style traffic lights
- Dark/light theme support is required
- Keyboard shortcuts must follow platform conventions (Cmd on macOS)

## Goals / Non-Goals

**Goals:**
- Implement a standard desktop menu bar with File, Edit, View, and Help menus
- Consolidate file operations (Open, Folder, Save) under the File menu
- Add keyboard shortcuts for common operations (Cmd+O, Cmd+S, etc.)
- Implement Recent Files feature under File menu
- Maintain seamless integration with existing title bar and window controls
- Support both macOS and Windows/Linux keyboard shortcuts
- Ensure accessibility (keyboard navigation, ARIA labels)

**Non-Goals:**
- Implementing all menu items immediately (some can be placeholder/disabled)
- Custom theming beyond existing dark/light modes
- Context menus (right-click menus) - separate feature
- Menu bar customization (reordering menus)
- Touch/gesture support for menu navigation

## Decisions

### 1. Menu Implementation Approach
**Decision:** Build a custom React menu component with dropdown functionality  
**Alternatives Considered:**
- **Tauri's native menu API**: Requires Rust code, less flexible for React integration, harder to style
- **Electron-style menu**: Not applicable to Tauri
- **Third-party library (e.g., @ariakit/react)**: Adds dependency, may conflict with Tailwind

**Rationale:** Custom implementation provides full control over styling, seamless React integration, and maintains the existing design system without additional dependencies.

### 2. Keyboard Shortcut Management
**Decision:** Use a custom React hook with `useEffect` and keyboard event listeners  
**Alternatives Considered:**
- **mousetrap.js**: Additional dependency, overkill for our needs
- **Tauri global shortcuts**: Reserved for app-level shortcuts, not menu items

**Rationale:** Simple implementation for ~10 shortcuts, easy to maintain, no additional dependencies.

### 3. Recent Files Storage
**Decision:** Store recent files list in localStorage with a maximum of 10 items  
**Alternatives Considered:**
- **Tauri's app data storage**: More complex setup, not needed for simple list
- **In-memory only**: Lost between sessions

**Rationale:** localStorage provides persistence without complexity, sufficient for a recent files list.

### 4. Menu Bar Layout
**Decision:** Place menu bar between the window controls spacer and app title/breadcrumb  
**Layout:** `[Window Controls Spacer] | [Menu Items] | [App Title - Breadcrumb]`

**Rationale:** 
- Keeps window controls on the left (macOS convention)
- Menu items follow immediately after controls
- App title and breadcrumb fill remaining space
- Maintains drag region functionality

### 5. Component Structure
**Decision:** Create modular menu components:
- `MenuBar.tsx` - Main container
- `Menu.tsx` - Individual menu (File, Edit, etc.)
- `MenuItem.tsx` - Menu item with optional shortcut, icon
- `MenuSeparator.tsx` - Divider between menu sections

**Rationale:** Modular approach enables reuse, easier testing, and clear separation of concerns.

## Risks / Trade-offs

- **Risk:** Custom menu may not perfectly match native OS menu appearance  
  → **Mitigation:** Use platform-appropriate font sizes, padding, and follow macOS Human Interface Guidelines

- **Risk:** Keyboard shortcut conflicts with CodeMirror or browser defaults  
  → **Mitigation:** Use `event.preventDefault()` carefully, test all shortcuts, allow CodeMirror to handle editor-specific shortcuts

- **Risk:** Dropdown positioning issues on small screens  
  → **Mitigation:** Implement smart positioning logic that detects viewport boundaries

- **Trade-off:** Custom menus require more code than native menus  
  → **Benefit:** Full styling control and better React integration

- **Trade-off:** localStorage for recent files has size limits (~5MB)  
  → **Acceptable:** 10 recent file paths will use < 1KB

## Migration Plan

### Phase 1: Core Menu Structure
1. Create menu components (MenuBar, Menu, MenuItem, MenuSeparator)
2. Implement basic dropdown functionality with state management
3. Style menus to match existing dark/light themes
4. Add menu bar to TitleBar component

### Phase 2: File Menu Integration
1. Move Open, Folder, Save operations to File menu
2. Add keyboard shortcuts (Cmd+O, Cmd+S)
3. Implement Recent Files submenu
4. Add Save As, New File options (can be disabled initially)

### Phase 3: Additional Menus
1. Add Edit menu with Undo, Redo, Cut, Copy, Paste (some may be disabled)
2. Add View menu with Toggle Sidebar, Toggle Preview, Zoom controls
3. Add Help menu with About, Keyboard Shortcuts reference

### Rollback Strategy
If critical issues arise:
1. Menu bar is contained in a single component - can be easily hidden
2. Original button-based actions remain in the codebase initially
3. Feature flag can disable menu bar and restore button UI

## Open Questions

1. **Should we support menu bar customization?** (e.g., hiding certain menus)  
   → Defer to future iteration based on user feedback

2. **Should Recent Files show file previews or just names?**  
   → Start with names + paths for simplicity, can enhance later

3. **Should we implement tear-off menus?** (menus that can be detached)  
   → No, not common in modern desktop apps

4. **How to handle menu bar when window is very narrow?**  
   → Implement responsive collapse or hamburger menu for narrow widths (< 600px)
