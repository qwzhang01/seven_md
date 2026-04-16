# Debugging Guide

This guide explains how to debug Seven MD effectively.

## Table of Contents

- [Development Tools](#development-tools)
- [Frontend Debugging](#frontend-debugging)
- [Backend Debugging](#backend-debugging)
- [Performance Debugging](#performance-debugging)
- [Common Issues](#common-issues)

---

## Development Tools

### Required Tools

1. **Chrome DevTools** - Built into Tauri's webview
2. **Rust Analyzer** - For Rust debugging in VS Code
3. **React DevTools** - Browser extension for React debugging

### Setting Up Debug Environment

```bash
# Run in development mode with DevTools
npm run tauri dev
```

### Opening DevTools

In development mode:
- Press `Cmd+Option+I` to open DevTools
- Or right-click and select "Inspect"

---

## Frontend Debugging

### Using Console Logs

The app uses a structured logging system. Import the logger:

```typescript
import { createLogger } from '../utils/logger'

const logger = createLogger('MyComponent')

// Log levels
logger.trace('Detailed trace info')
logger.debug('Debug information')
logger.info('General information')
logger.warn('Warning message')
logger.error('Error occurred', { error: String(error) })
```

### Log Levels

| Level | Development | Production | Use Case |
|-------|-------------|------------|----------|
| trace | ✓ | ✗ | Detailed flow tracing |
| debug | ✓ | ✗ | Debug information |
| info | ✓ | ✓ | Important events |
| warn | ✓ | ✓ | Potential issues |
| error | ✓ | ✓ | Errors and failures |

### React DevTools

1. Install React DevTools extension
2. Open DevTools (`Cmd+Option+I`)
3. Go to "Components" or "Profiler" tab
4. Inspect component props, state, and hooks

### State Debugging

```tsx
import { useAppState } from '../context/AppContext'

function MyComponent() {
  const { state, dispatch } = useAppState()
  
  // Log state changes
  useEffect(() => {
    console.log('State changed:', state)
  }, [state])
  
  // ...
}
```

### Debugging Context

```tsx
// Add debug logging to context
const reducer = (state: State, action: Action) => {
  console.log('Action:', action.type, 'Payload:', action.payload)
  const newState = // ... reducer logic
  console.log('New state:', newState)
  return newState
}
```

### Using Breakpoints

1. Open DevTools → Sources
2. Find your source file (may be in webpack://)
3. Click line number to set breakpoint
4. Trigger the action to hit breakpoint

### Conditional Breakpoints

Right-click a breakpoint to add a condition:

```javascript
state.file.path !== null
```

---

## Backend Debugging

### Rust Logging

```rust
use log::{debug, info, warn, error};

fn my_function() {
    debug!("Debug message");
    info!("Info message");
    warn!("Warning message");
    error!("Error message");
}
```

### Setting Log Level

```rust
// In main.rs
env_logger::Builder::new()
    .filter_level(log::LevelFilter::Debug)
    .init();
```

### Using println! for Quick Debugging

```rust
println!("Variable value: {:?}", my_variable);
```

### VS Code Rust Debugging

1. Install `vadimcn.vscode-lldb` extension
2. Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Tauri Development Debug",
      "cargo": {
        "args": [
          "build",
          "--manifest-path=./src-tauri/Cargo.toml"
        ]
      },
      "preLaunchTask": "ui:dev"
    }
  ]
}
```

### Tauri Command Debugging

```rust
#[tauri::command]
async fn my_command(path: String) -> Result<String, String> {
    log::debug!("Received command with path: {}", path);
    
    // Your logic here
    
    log::debug!("Returning result");
    Ok(result)
}
```

---

## Performance Debugging

### Performance Dashboard

Seven MD includes a built-in performance dashboard for development:

1. Open DevTools
2. Look for the Performance panel
3. View render times, memory usage, and metrics

### Component Render Timing

```tsx
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'

function MyComponent() {
  const { metrics } = usePerformanceMonitor('MyComponent', {
    slowRenderThreshold: 16, // ms
    warnOnSlowRender: true,
    logRenders: true
  })
  
  // metrics.renderTime, metrics.renderCount, etc.
}
```

### Memory Monitoring

```tsx
import { useMemoryMonitor } from '../hooks/usePerformanceMonitor'

function App() {
  // Logs memory usage every 30 seconds in dev mode
  useMemoryMonitor(true)
}
```

### File Operation Timing

```tsx
import { useFileOperationTiming } from '../hooks/useFileOperationTiming'

function FileOperations() {
  const { measureOperation } = useFileOperationTiming()
  
  const handleOpen = async () => {
    await measureOperation('openFile', async () => {
      // File operation code
    })
  }
}
```

### React Profiler

1. Open React DevTools
2. Go to "Profiler" tab
3. Click record button
4. Perform actions
5. Stop recording to see component render times

### Finding Memory Leaks

1. Open DevTools → Memory
2. Take heap snapshot
3. Perform actions
4. Take another snapshot
5. Compare to find retained objects

---

## Common Issues

### Application Won't Start

**Symptoms**: App shows blank screen or crashes on startup

**Debug Steps**:
1. Check console for errors (`Cmd+Option+I`)
2. Check Rust logs in terminal
3. Verify all dependencies are installed:
   ```bash
   npm install
   cd src-tauri && cargo build
   ```

### File Operations Fail

**Symptoms**: Cannot open or save files

**Debug Steps**:
1. Check Tauri permissions in `tauri.conf.json5`
2. Verify file path is valid
3. Check file permissions
4. Look for path validation errors in logs

```tsx
// Add debug logging
logger.debug('File path:', path)
logger.debug('File exists:', await invoke('file_exists', { path }))
```

### Theme Not Applying

**Symptoms**: Theme setting doesn't take effect

**Debug Steps**:
1. Check if CSS classes are applied to `<html>` element
2. Verify theme state in React DevTools
3. Check localStorage for saved preference

```tsx
// Debug theme state
const { theme, setTheme } = useTheme()
logger.debug('Current theme:', theme)
```

### Sidebar State Not Persisting

**Symptoms**: Sidebar collapses after restart

**Debug Steps**:
1. Check localStorage for saved state
2. Verify persistence hook is working
3. Look for errors in persistence module

### Preview Not Updating

**Symptoms**: Preview panel doesn't show changes

**Debug Steps**:
1. Check if content is being updated in state
2. Verify debounce timer isn't stuck
3. Look for Markdown parsing errors

```tsx
// Debug content flow
useEffect(() => {
  logger.debug('Content updated, length:', content.length)
}, [content])
```

### Memory Usage Growing

**Symptoms**: App uses more memory over time

**Debug Steps**:
1. Use Memory tab in DevTools
2. Take heap snapshots to find retained objects
3. Check for unremoved event listeners
4. Verify useEffect cleanup

```tsx
useEffect(() => {
  const handler = () => {}
  window.addEventListener('resize', handler)
  
  // Don't forget cleanup!
  return () => window.removeEventListener('resize', handler)
}, [])
```

---

## Debug Checklist

When encountering issues, go through this checklist:

1. [ ] Check browser console for errors
2. [ ] Check terminal for Rust errors
3. [ ] Verify state is correct in React DevTools
4. [ ] Check network requests (if any)
5. [ ] Verify file permissions
6. [ ] Check Tauri configuration
7. [ ] Look for timing/race conditions
8. [ ] Check for memory leaks

---

## Getting Help

If you can't resolve an issue:

1. Search existing GitHub Issues
2. Create a minimal reproduction
3. Collect relevant logs and screenshots
4. Submit a new Issue with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Console/Rust logs
   - Environment details
