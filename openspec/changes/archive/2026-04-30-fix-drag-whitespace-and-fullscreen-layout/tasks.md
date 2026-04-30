## 1. CSS: Add resizing state rule to disable drag region

- [x] 1.1 In `src/index.css`, add CSS rule: `[data-resizing] [data-tauri-drag-region] { -webkit-app-region: no-drag; }` to disable window drag during resize operations

## 2. Fix Toolbar: Remove data-tauri-drag-region

- [x] 2.1 In `src/components/toolbar-v2/Toolbar.tsx`, remove the `data-tauri-drag-region` attribute from the toolbar `<div>` element

## 3. Fix Gutter: Disable drag region during resize

- [x] 3.1 In `src/components/editor-v2/Gutter.tsx`, in the `handleMouseDown` callback, add `document.documentElement.setAttribute('data-resizing', '')` after setting cursor style
- [x] 3.2 In `src/components/editor-v2/Gutter.tsx`, in the `handleMouseUp` callback, add `document.documentElement.removeAttribute('data-resizing')` before removing event listeners

## 4. Fix Sidebar: Disable drag region during resize

- [x] 4.1 In `src/components/sidebar-v2/Sidebar.tsx`, in the `handleMouseDown` callback, add `document.documentElement.setAttribute('data-resizing', '')` after setting cursor style
- [x] 4.2 In `src/components/sidebar-v2/Sidebar.tsx`, in the `handleMouseUp` callback, add `document.documentElement.removeAttribute('data-resizing')` before removing event listeners

## 5. Render TitleBar and handle fullscreen

- [x] 5.1 In `src/AppV2.tsx`, add a `isFullscreen` state variable (boolean, default `false`)
- [x] 5.2 In `src/AppV2.tsx`, in the `useEffect` that sets up Tauri event listeners, add a listener for `tauri://resize` event that calls `getCurrentWindow().isFullscreen()` and updates `isFullscreen` state
- [x] 5.3 In `src/AppV2.tsx`, render `<TitleBar />` at the top of the main layout (above `<Toolbar />`), passing `isFullscreen` as a prop or using inline style to hide it when fullscreen
- [x] 5.4 In `src/components/titlebar-v2/TitleBar.tsx`, accept an `isFullscreen` prop and apply `style={{ height: isFullscreen ? 0 : undefined, overflow: 'hidden' }}` conditionally

## 6. Verify and test

- [x] 6.1 Verify dragging the Gutter does not trigger window movement or show white areas
- [x] 6.2 Verify dragging the Sidebar resize handle does not trigger window movement or show white areas
- [x] 6.3 Verify entering fullscreen mode does not show white areas at the top
- [x] 6.4 Verify exiting fullscreen mode restores the TitleBar correctly
- [x] 6.5 Verify the TitleBar drag region still allows window dragging in normal mode
