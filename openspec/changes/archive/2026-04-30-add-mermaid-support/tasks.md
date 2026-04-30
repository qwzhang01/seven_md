## 1. Dependencies

- [x] 1.1 Add `mermaid` (^10.x) to `dependencies` in `package.json`
- [x] 1.2 Run `npm install` and verify lock file is updated

## 2. MermaidBlock Component

- [x] 2.1 Create `src/components/editor-v2/MermaidBlock.tsx` with props `{ code: string, theme: 'default' | 'dark' }`
- [x] 2.2 Implement lazy dynamic `import('mermaid')` inside the component (load only on first render)
- [x] 2.3 Use `useId()` (React 18) to generate a unique element ID for each `mermaid.render()` call
- [x] 2.4 Call `mermaid.initialize({ startOnLoad: false, theme })` before rendering
- [x] 2.5 Call `mermaid.render(id, code)` in a `useEffect` and inject the returned SVG string into the container div
- [x] 2.6 Show a `<pre>` placeholder while the diagram is loading (async)
- [x] 2.7 Wrap `mermaid.render()` in try/catch; on error render a styled inline error div with red border and the error message

## 3. Theme Integration

- [x] 3.1 In `MermaidBlock.tsx`, read the active theme from `useUIStore` (or accept it as a prop from `PreviewPaneV2`)
- [x] 3.2 Map theme name: dark/dark-* variants → `'dark'`, all others → `'default'`
- [x] 3.3 Re-run `mermaid.initialize()` and re-render the diagram when the theme prop/value changes (add theme to `useEffect` deps)

## 4. Preview Pane Integration

- [x] 4.1 In `PreviewPaneV2.tsx`, import `MermaidBlock`
- [x] 4.2 In the `code` component override, add a branch: if `className === 'language-mermaid'`, return `<MermaidBlock code={String(children)} theme={mermaidTheme} />`
- [x] 4.3 Derive `mermaidTheme` from `useUIStore` at the top of `PreviewPaneV2` and pass it down

## 5. Styling

- [x] 5.1 Add CSS for the Mermaid error state in `src/index.css` or a scoped style: red left border, light red background, monospace error text
- [x] 5.2 Ensure the rendered SVG diagram is responsive (`max-width: 100%`) and centered within the preview pane

## 6. Testing & Verification

- [x] 6.1 Manually test flowchart, sequence diagram, and ER diagram samples in light theme
- [x] 6.2 Manually test the same diagrams in dark theme and verify colors change
- [x] 6.3 Test an invalid Mermaid block and verify the error message appears without crashing the preview
- [x] 6.4 Test an empty ` ```mermaid ` block and verify graceful handling
- [x] 6.5 Test a document with multiple Mermaid blocks and verify each renders independently
- [x] 6.6 Test a document with no Mermaid blocks and verify the Mermaid bundle is not loaded (check Network tab)
