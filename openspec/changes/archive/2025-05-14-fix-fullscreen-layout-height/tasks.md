## 1. Add isFullscreen state to useUIStore

- [x] 1.1 In `src/stores/useUIStore.ts`, add `isFullscreen: boolean` to the `UIState` interface with default value `false`
- [x] 1.2 In `src/stores/useUIStore.ts`, add `setIsFullscreen: (fullscreen: boolean) => void` action to the interface and implementation
- [x] 1.3 Ensure `isFullscreen` is NOT included in the `partialize` config (it's a runtime-only state, not persisted)

## 2. Fix root container height strategy

- [x] 2.1 In `src/AppV2.tsx`, change the root `<div>` className from `h-screen` to use `h-dvh` for dynamic viewport height
- [x] 2.2 Add inline style fallback: `style={{ ...existing, height: '100dvh' }}` to ensure compatibility if Tailwind class is not available
- [x] 2.3 In `src/index.css`, add `html, body, #root { height: 100%; }` as additional safety measure for height inheritance

## 3. Restore fullscreen state detection in AppV2

- [x] 3.1 In `src/AppV2.tsx`, import `getCurrentWindow` from `@tauri-apps/api/window` at the top level (or dynamic import within the effect)
- [x] 3.2 In `src/AppV2.tsx`, in the existing setup `useEffect` (the one registering Tauri event listeners), add initial fullscreen detection: call `getCurrentWindow().isFullscreen()` and update `useUIStore.getState().setIsFullscreen()`
- [x] 3.3 In the same setup `useEffect`, add a `tauri://resize` event listener that queries `isFullscreen()` with a 50ms delay (via `setTimeout`) and updates the store

## 4. Restore TitleBar rendering with fullscreen support

- [x] 4.1 In `src/components/titlebar-v2/TitleBar.tsx`, modify the component to read `isFullscreen` from `useUIStore` instead of props
- [x] 4.2 In `src/components/titlebar-v2/TitleBar.tsx`, when `isFullscreen` is true, apply `style={{ height: 0, overflow: 'hidden' }}` to hide the TitleBar
- [x] 4.3 In `src/AppV2.tsx`, render `<TitleBar />` above the `<Toolbar />` div (inside the root flex-col container, as the first child after the opening div)

## 5. Verify and test

- [x] 5.1 Verify the application compiles without TypeScript errors after all changes
- [ ] 5.2 Verify entering fullscreen mode fills the entire screen with no blank areas at the bottom
- [ ] 5.3 Verify exiting fullscreen mode restores the layout correctly with TitleBar visible
- [ ] 5.4 Verify the TitleBar drag region still allows window dragging in normal mode
- [ ] 5.5 Verify the StatusBar remains anchored to the bottom of the screen in both modes
