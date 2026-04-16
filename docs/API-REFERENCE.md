# API Reference

This document provides detailed API documentation for Seven MD's core modules.

## Table of Contents

- [Hooks](#hooks)
  - [useFileOperations](#usefileoperations)
  - [useAppState](#useappstate)
  - [usePerformanceMonitor](#useperformancemonitor)
  - [useFileOperationTiming](#usefileoperationtiming)
  - [useKeyboardNavigation](#usekeyboardnavigation)
  - [useTheme](#usetheme)
- [Components](#components)
  - [ErrorBoundary](#errorboundary)
  - [FallbackUI](#fallbackui)
- [Utilities](#utilities)
  - [Logger](#logger)
  - [PathValidator](#pathvalidator)
  - [InputSanitizer](#inputsanitizer)
  - [MemoryMonitor](#memorymonitor)
- [Internationalization](#internationalization)
  - [i18n Config](#i18n-config)

---

## Hooks

### useFileOperations

Hook for handling file operations (open, save, new file).

```typescript
import { useFileOperations } from '../hooks/useFileOperations'

const {
  openFile,
  saveCurrentFile,
  saveFileAs,
  newFile,
  isSaving,
  currentFilePath,
  isDirty,
  hasUnsavedChanges
} = useFileOperations()
```

#### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `openFile` | `() => Promise<string \| null>` | Opens a file dialog and loads the selected file |
| `saveCurrentFile` | `() => Promise<boolean>` | Saves the current file |
| `saveFileAs` | `() => Promise<boolean>` | Opens save dialog and saves to new location |
| `newFile` | `() => void` | Creates a new blank file |
| `isSaving` | `boolean` | Whether a save operation is in progress |
| `currentFilePath` | `string \| null` | Path of the currently open file |
| `isDirty` | `boolean` | Whether there are unsaved changes |
| `hasUnsavedChanges` | `boolean` | Alias for `isDirty` |

#### Example

```tsx
function Toolbar() {
  const { openFile, saveCurrentFile, isSaving, isDirty } = useFileOperations()
  
  const handleOpen = async () => {
    const path = await openFile()
    if (path) {
      console.log('Opened:', path)
    }
  }
  
  return (
    <>
      <button onClick={handleOpen}>Open</button>
      <button onClick={saveCurrentFile} disabled={isSaving || !isDirty}>
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </>
  )
}
```

---

### useAppState

Hook for accessing and managing global application state.

```typescript
import { useFolder, useFileTree, useSidebarState, usePaneState } from '../hooks/useAppState'
```

#### useFolder

Manages folder operations.

```typescript
const {
  folderPath,
  folderTree,
  openFolder,
  closeFolder
} = useFolder()
```

| Property | Type | Description |
|----------|------|-------------|
| `folderPath` | `string \| null` | Currently open folder path |
| `folderTree` | `FileTreeNode[] \| null` | Folder tree structure |
| `openFolder` | `() => Promise<string \| null>` | Opens folder picker dialog |
| `closeFolder` | `() => void` | Closes current folder |

#### useFileTree

Manages file tree navigation.

```typescript
const {
  tree,
  expandedDirs,
  loadDirectory,
  toggleDirectory,
  isExpanded
} = useFileTree()
```

| Property | Type | Description |
|----------|------|-------------|
| `tree` | `FileTreeNode[]` | File tree nodes |
| `expandedDirs` | `Set<string>` | Set of expanded directory paths |
| `loadDirectory` | `(path: string) => Promise<FileTreeNode[]>` | Loads directory contents |
| `toggleDirectory` | `(path: string) => void` | Toggles directory expansion |
| `isExpanded` | `(path: string) => boolean` | Checks if directory is expanded |

#### useSidebarState

Manages sidebar visibility.

```typescript
const { collapsed, toggle, setCollapsed } = useSidebarState()
```

#### usePaneState

Manages editor and preview pane visibility.

```typescript
const {
  editorCollapsed,
  previewCollapsed,
  toggleEditor,
  togglePreview,
  setEditorCollapsed,
  setPreviewCollapsed
} = usePaneState()
```

---

### usePerformanceMonitor

Hook for monitoring component render performance.

```typescript
import { usePerformanceMonitor, usePerformanceTiming, useMemoryMonitor } from '../hooks/usePerformanceMonitor'
```

#### usePerformanceMonitor

```typescript
const { metrics, getMetrics } = usePerformanceMonitor(componentName, options?)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `componentName` | `string` | required | Name for logging |
| `options.slowRenderThreshold` | `number` | `16` | Threshold in ms for slow render warning |
| `options.warnOnSlowRender` | `boolean` | `true` | Log warning on slow render |
| `options.logRenders` | `boolean` | `false` | Log every render |

**Returns:**

```typescript
interface PerformanceMetrics {
  componentName: string
  renderTime: number      // Current render time in ms
  renderCount: number     // Total render count
  avgRenderTime: number   // Average render time
  maxRenderTime: number   // Maximum render time
  slowRenders: number     // Count of slow renders
}
```

**Example:**

```tsx
function MyComponent() {
  const { metrics } = usePerformanceMonitor('MyComponent', {
    slowRenderThreshold: 16,
    warnOnSlowRender: true
  })
  
  // Access metrics
  console.log('Render count:', metrics.renderCount)
}
```

#### usePerformanceTiming

```typescript
const { measureSync, measureAsync } = usePerformanceTiming()

// Measure synchronous function
const result = measureSync('myFunction', () => computeExpensiveValue())

// Measure async function
const data = await measureAsync('fetchData', () => fetchData())
```

#### useMemoryMonitor

```typescript
useMemoryMonitor(enabled?: boolean)
```

Logs memory usage every 30 seconds in development mode.

---

### useFileOperationTiming

Hook for measuring file operation performance.

```typescript
import { useFileOperationTiming } from '../hooks/useFileOperationTiming'

const {
  measureOperation,
  getOperationStats,
  getSlowOperations,
  clearStats
} = useFileOperationTiming(options?)
```

**Options:**

```typescript
interface FileOperationTimingOptions {
  slowThreshold?: number    // Default: 100ms
  warnOnSlow?: boolean      // Default: true
}
```

**Methods:**

| Method | Type | Description |
|--------|------|-------------|
| `measureOperation` | `(name: string, fn: () => Promise<T>) => Promise<T>` | Wraps operation with timing |
| `getOperationStats` | `() => OperationStats` | Gets aggregated statistics |
| `getSlowOperations` | `() => TimedOperation[]` | Gets operations exceeding threshold |
| `clearStats` | `() => void` | Clears all recorded stats |

**Example:**

```tsx
const { measureOperation } = useFileOperationTiming()

const handleOpen = async () => {
  const content = await measureOperation('openFile', async () => {
    return await readFile(path)
  })
}
```

---

### useKeyboardNavigation

Hook for implementing keyboard navigation within containers.

```typescript
import { useKeyboardNavigation, useFocusTrap, announceToScreenReader } from '../hooks/useKeyboardNavigation'
```

#### useKeyboardNavigation

```typescript
const {
  focusIndex,
  focusAt,
  focusNext,
  focusPrevious,
  focusFirst,
  focusLast,
  activateCurrent,
  getFocusables
} = useKeyboardNavigation(containerRef, options?)
```

**Options:**

```typescript
interface KeyboardNavigationOptions {
  arrowKeys?: boolean       // Enable arrow keys (default: true)
  tabKey?: boolean          // Enable Tab navigation (default: true)
  activationKeys?: boolean  // Enable Enter/Space (default: true)
  escapeKey?: boolean       // Enable Escape (default: true)
  loop?: boolean            // Loop at boundaries (default: true)
  onEscape?: () => void     // Escape callback
  onActivate?: (element: HTMLElement) => void  // Activation callback
  onFocusChange?: (element: HTMLElement, index: number) => void  // Focus change callback
}
```

**Example:**

```tsx
const containerRef = useRef<HTMLDivElement>(null)

const { focusNext, focusPrevious } = useKeyboardNavigation(containerRef, {
  onEscape: () => closeModal(),
  loop: true
})

return (
  <div ref={containerRef} tabIndex={-1}>
    {/* Focusable items */}
  </div>
)
```

#### useFocusTrap

Traps focus within a container (for modals).

```typescript
const { restoreFocus } = useFocusTrap(containerRef, {
  initialFocus?: string     // Selector for initial focus
  onEscape?: () => void     // Escape callback
  autoFocus?: boolean       // Auto-focus on mount (default: true)
})
```

#### announceToScreenReader

```typescript
announceToScreenReader('File saved successfully', 'polite')
announceToScreenReader('Error occurred', 'assertive')
```

---

### useTheme

Hook for managing application theme.

```typescript
import { useTheme } from '../hooks/useTheme'

const { theme, setTheme, toggleTheme } = useTheme()
```

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `'light' \| 'dark' \| 'system'` | Current theme |
| `setTheme` | `(theme: 'light' \| 'dark' \| 'system') => void` | Set theme |
| `toggleTheme` | `() => void` | Toggle between light and dark |

---

## Components

### ErrorBoundary

React error boundary for catching and handling errors.

```tsx
import { ErrorBoundary } from '../components/ErrorBoundary'

<ErrorBoundary 
  boundaryName="Global"
  fallback={(error, errorInfo, retry) => <CustomFallback error={error} onRetry={retry} />}
>
  <App />
</ErrorBoundary>
```

**Props:**

```typescript
interface ErrorBoundaryProps {
  children: ReactNode
  boundaryName?: string     // Name for logging (default: 'Unknown')
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode
}
```

**Error Boundary Levels:**

The app implements multi-level error boundaries:

1. **Global** - Catches errors at root level
2. **Sidebar** - Catches errors in sidebar components
3. **MainContent** - Catches errors in editor/preview

**Example:**

```tsx
// Global level
<ErrorBoundary boundaryName="Global">
  <TitleBar />
  <ErrorBoundary boundaryName="Sidebar">
    <Sidebar />
  </ErrorBoundary>
  <ErrorBoundary boundaryName="MainContent">
    <EditorPane />
    <PreviewPane />
  </ErrorBoundary>
</ErrorBoundary>
```

---

### FallbackUI

Default error display component.

```tsx
import { FallbackUI } from '../components/ErrorBoundary'

<FallbackUI
  error={error}
  errorInfo={errorInfo}
  boundaryName="Global"
  onRetry={handleRetry}
  onReload={handleReload}
/>
```

**Props:**

```typescript
interface FallbackUIProps {
  error: Error
  errorInfo: ErrorInfo | null
  boundaryName: string
  onRetry: () => void
  onReload: () => void
}
```

---

## Utilities

### Logger

Structured logging system with multiple levels and persistence.

```typescript
import { createLogger, initLogger, setLogLevel, exportLogs, downloadLogs } from '../utils/logger'

// Create a logger with context
const logger = createLogger('MyModule')

// Log at different levels
logger.trace('Detailed trace info')
logger.debug('Debug information', { data: extraData })
logger.info('Important event', { action: 'file_opened' })
logger.warn('Warning message', { threshold: exceeded })
logger.error('Error occurred', { error: String(err) })
```

**Log Levels:**

| Level | Development | Production | Use Case |
|-------|-------------|------------|----------|
| `trace` | ✓ | ✗ | Detailed flow tracing |
| `debug` | ✓ | ✗ | Debug information |
| `info` | ✓ | ✓ | Important events |
| `warn` | ✓ | ✓ | Potential issues |
| `error` | ✓ | ✓ | Errors and failures |
| `silent` | - | - | Disable all logging |

**API:**

```typescript
// Initialize logger (auto-called on import)
initLogger({
  level: 'debug',
  persistToDisk: true,
  enableColors: true,
  timestamp: true
})

// Set log level at runtime
setLogLevel('info')

// Export logs as JSON
const logs = exportLogs()

// Download logs as file
downloadLogs()
```

**Log Entry Structure:**

```typescript
interface LogEntry {
  timestamp: string
  level: string
  message: string
  data?: unknown
  context?: string
}
```

---

### PathValidator

Utilities for validating and sanitizing file paths.

```typescript
import {
  validatePath,
  validateFileExtension,
  validateFilename,
  isWithinAllowedDir,
  isSuspiciousPath,
  getFileExtension
} from '../utils/pathValidator'
```

#### validatePath

Validates and sanitizes a file path.

```typescript
const result = validatePath(userInput)
// {
//   isValid: boolean
//   sanitizedPath: string
//   error?: string
// }
```

**Checks:**
- Null byte injection
- Path traversal attempts (`../`)
- Dangerous characters
- Normalizes path separators

#### validateFileExtension

```typescript
const result = validateFileExtension(path, ['md', 'markdown'])
```

#### validateFilename

```typescript
const result = validateFilename('my-file.md')
// Checks: reserved names, invalid chars, length, dots-only
```

#### isWithinAllowedDir

```typescript
const allowed = isWithinAllowedDir(filePath, ['/Users/Docs', '/Users/Projects'])
```

#### isSuspiciousPath

```typescript
if (isSuspiciousPath(input)) {
  // Potential attack pattern detected
}
```

---

### InputSanitizer

Utilities for sanitizing user input.

```typescript
import {
  sanitizeHtml,
  sanitizeUrl,
  sanitizeFilename,
  stripTags,
  escapeHtml,
  truncateText
} from '../utils/inputSanitizer'
```

#### sanitizeHtml

```typescript
const clean = sanitizeHtml('<script>alert("xss")</script>Hello')
// Returns: 'Hello'
```

#### sanitizeUrl

```typescript
const url = sanitizeUrl('javascript:alert(1)')
// Returns: '' (blocked)

const safe = sanitizeUrl('https://example.com')
// Returns: 'https://example.com'
```

#### escapeHtml

```typescript
const escaped = escapeHtml('<div>Hello</div>')
// Returns: '&lt;div&gt;Hello&lt;/div&gt;'
```

#### truncateText

```typescript
const short = truncateText('Long text here', 10)
// Returns: 'Long te...'
```

---

### MemoryMonitor

Utilities for monitoring memory usage.

```typescript
import {
  MemoryMonitor,
  createMemoryMonitor,
  getMemoryUsage,
  getMemoryHistory,
  calculateGrowthRate,
  isMemoryApiAvailable
} from '../utils/memoryMonitor'
```

#### getMemoryUsage

```typescript
const memory = getMemoryUsage()
// {
//   usedJSHeapSize: number
//   totalJSHeapSize: number
//   jsHeapSizeLimit: number
//   timestamp: number
// }
```

#### MemoryMonitor Class

```typescript
const monitor = createMemoryMonitor(
  {
    warningMB: 100,
    criticalMB: 200,
    growthRateMBPerMin: 10
  },
  {
    onWarning: (info, message) => console.warn(message),
    onCritical: (info, message) => alert(message),
    onGrowthWarning: (rate) => console.warn(`Growing at ${rate} MB/min`)
  }
)

monitor.start(1000) // Check every second
monitor.stop()
monitor.getStats()
```

---

## Internationalization

### i18n Config

Internationalization configuration and utilities.

```typescript
import { 
  t, 
  changeLanguage, 
  getCurrentLanguage,
  languages,
  LanguageCode 
} from '../i18n/config'
```

#### Available Languages

```typescript
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
]
```

#### Getting Translations

```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return <h1>{t('common.appName')}</h1>
}
```

#### Changing Language

```typescript
await changeLanguage('zh')
```

#### Getting Current Language

```typescript
const currentLang = getCurrentLanguage() // 'en' | 'zh'
```

#### Translation Keys Structure

```typescript
// Available translation namespaces
const keys = {
  common: { appName, loading, error, success, ... },
  menu: { file, edit, view, ... },
  sidebar: { files, outline, search, ... },
  editor: { placeholder, line, column, ... },
  preview: { title, exportPdf, print, ... },
  theme: { light, dark, system, ... },
  shortcuts: { title, openFile, saveFile, ... },
  errors: { fileNotFound, fileLoadError, ... },
  about: { title, version, description, ... }
}
```

---

## Types

### FileTreeNode

```typescript
interface FileTreeNode {
  name: string
  path: string
  isDir: boolean
  children?: FileTreeNode[]
}
```

### AppState

```typescript
interface AppState {
  folder: {
    path: string | null
    tree: FileTreeNode[] | null
    expandedDirs: Set<string>
  }
  file: {
    path: string | null
    content: string
    isDirty: boolean
  }
  ui: {
    sidebarCollapsed: boolean
    editorCollapsed: boolean
    previewCollapsed: boolean
    theme: 'light' | 'dark' | 'system'
  }
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean
  sanitizedPath: string
  error?: string
}
```

### PerformanceMetrics

```typescript
interface PerformanceMetrics {
  componentName: string
  renderTime: number
  renderCount: number
  avgRenderTime: number
  maxRenderTime: number
  slowRenders: number
}
```

### MemoryInfo

```typescript
interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  timestamp: number
}
```

---

## Export API

### `useExport(content, filePath)`

Hook for exporting the current document to PDF or HTML.

**Location:** `src/hooks/useExport.ts`

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `content` | `string` | The current Markdown document content |
| `filePath` | `string \| null` | The current file path (used to derive the default export filename) |

**Returns:** `UseExportReturn`

```typescript
interface UseExportReturn {
  exportPdf: () => Promise<void>   // Opens OS print dialog (print-to-PDF)
  exportHtml: () => Promise<void>  // Serializes to HTML and saves via native dialog
  isExporting: boolean             // True while an export operation is in progress
  exportError: string | null       // Last error message, or null if no error
}
```

**Usage:**

```tsx
const { exportPdf, exportHtml, isExporting } = useExport(activeContent, activeFilePath)

// Trigger PDF export (opens OS print dialog)
await exportPdf()

// Trigger HTML export (opens save-file dialog, writes self-contained HTML)
await exportHtml()
```

**Behavior:**
- Both functions are no-ops when `content` is empty.
- On success, dispatches an `export-status` CustomEvent on `window` that the `StatusBar` listens to for transient feedback.
- On error, sets `exportError` and dispatches an error `export-status` event.
- `exportHtml` invokes the `export_html` Tauri command; returns `null` if the user cancels the save dialog (not treated as an error).
- `exportPdf` calls `WebviewWindow.getCurrent().print()` (Tauri v2 WebView print API).

---

### `serializePreviewToHtml(markdown, title)`

Renders Markdown to a self-contained HTML string with all CSS inlined.

**Location:** `src/utils/exportUtils.ts`

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `markdown` | `string` | Markdown source text |
| `title` | `string` | Document title for the `<title>` element |

**Returns:** `string` — A complete `<!DOCTYPE html>` document with inlined styles.

---

### `extractDocumentTitle(markdown, fallback)`

Returns the text of the first `# heading` in the Markdown, or the fallback string.

**Location:** `src/utils/exportUtils.ts`

---

### `deriveExportFileName(filePath, extension)`

Returns `<basename>.<extension>` from a file path, or `Untitled.<extension>` if `filePath` is `null`.

**Location:** `src/utils/exportUtils.ts`

---

### Tauri Command: `export_html`

**Location:** `src-tauri/src/commands.rs`

Opens a native save-file dialog filtered to `.html` files and writes the provided HTML string to the chosen path.

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `html` | `String` | The HTML content to write |
| `suggested_name` | `String` | Default filename shown in the save dialog |

**Returns:** `Result<Option<String>, String>` — `Some(path)` on success, `None` if cancelled, `Err(message)` on write failure.

---

## Tab Management API

### `useTabManagement()`

**Location:** `src/hooks/useTabManagement.ts`

Core hook for managing tabs. Returns:

| Property | Type | Description |
|----------|------|-------------|
| `tabs` | `TabState[]` | All open tabs |
| `activeTab` | `TabState \| null` | Currently active tab |
| `activeTabId` | `string \| null` | Active tab ID |
| `recentlyClosed` | `TabState[]` | Recently closed tabs (up to 10) |
| `canReopenClosed` | `boolean` | Whether there are closed tabs to reopen |
| `tabCount` | `number` | Number of open tabs |
| `isAtMaxTabs` | `boolean` | Whether at the 50-tab limit |
| `openTab(path, content?)` | `async function` | Open file in new tab or switch to existing |
| `closeTab(tabId)` | `function` | Close a tab |
| `switchTab(tabId)` | `function` | Activate a tab |
| `closeAllTabs()` | `function` | Close all tabs |
| `closeOtherTabs(tabId)` | `function` | Close all except specified tab |
| `closeTabsToRight(tabId)` | `function` | Close tabs to the right |
| `reopenLastClosedTab()` | `async function` | Reopen last closed tab |
| `createUntitledTab()` | `function` | Create new untitled tab |
| `getTabName(tab)` | `function` | Get display name for tab |
| `saveActiveTab()` | `async function` | Save active tab to disk |
| `getDirtyTabs()` | `function` | Get all tabs with unsaved changes |
| `isFileOpen(path)` | `function` | Check if file is already open |
| `getTabByPath(path)` | `function` | Get tab for a file path |

---

### `saveTabState(tabsState)`

**Location:** `src/utils/tabPersistence.ts`

Saves tab state to `{appDataDir}/tabs.json`. Only persists content for dirty tabs.

---

### `restoreTabsFromStorage()`

**Location:** `src/utils/tabPersistence.ts`

Loads and restores tab state from storage. Reloads clean tab content from disk.

**Returns:** `Promise<TabsState | null>`

---

### `startTabAutosave(getTabsState)`

**Location:** `src/utils/tabPersistence.ts`

Starts a 5-minute autosave interval. Returns a cleanup function to stop autosave.

---

### `migrateToTabState(persisted)`

**Location:** `src/utils/tabPersistence.ts`

Migrates old single-file persisted state to the new tab-based state format. Used for backward compatibility on first launch after upgrade.

---

### `serializeTabsForPersistence(tabsState)`

**Location:** `src/utils/tabPersistence.ts`

Converts `TabsState` to `PersistedTabEntry[]` for storage. Omits content for clean tabs.

---

### `getTabDisplayName(tab)`

**Location:** `src/utils/tabUtils.ts`

Returns the display name for a tab: file name if path exists, or `Untitled` / `Untitled-N` for untitled tabs.

---

### `createNewTab(path?, content?)`

**Location:** `src/utils/tabUtils.ts`

Creates a new `TabState` object with a unique ID and default values.

