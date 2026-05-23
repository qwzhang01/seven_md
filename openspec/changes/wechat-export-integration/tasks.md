## 1. Dependencies & Project Setup

- [ ] 1.1 Install npm dependencies: `pnpm add marked front-matter juice`
- [ ] 1.2 Install type definitions: `pnpm add -D @types/front-matter @types/juice`
- [ ] 1.3 Verify `vite.config.ts` supports `?raw` CSS imports (should work out of the box)

## 2. Create Module Skeleton

- [ ] 2.1 Create directory structure: `src/wechat/{types,theme-css,renderer,theme,utils,services,stores,components}/`
- [ ] 2.2 Create `src/wechat/index.ts` (empty barrel export, fill in later)

## 3. Port Theme CSS Files

- [ ] 3.1 Copy `base.css` from `.ext/md/packages/shared/src/configs/theme-css/` → `src/wechat/theme-css/base.css`
- [ ] 3.2 Copy `default.css` → `src/wechat/theme-css/default.css`
- [ ] 3.3 Copy `grace.css` → `src/wechat/theme-css/grace.css`
- [ ] 3.4 Copy `simple.css` → `src/wechat/theme-css/simple.css`
- [ ] 3.5 Create `src/wechat/theme-css/index.ts`: import all CSS files with `?raw`, export `baseCSSContent`, `themeMap`, `themeOptions`

## 4. Port Type Definitions

- [ ] 4.1 Copy `renderer-types.ts` from `.ext/md/packages/shared/src/types/` → `src/wechat/types/renderer-types.ts`
- [ ] 4.2 Fix import paths (remove `@md/shared` references)

## 5. Port Renderer

- [ ] 5.1 Copy `renderer-impl.ts` from `.ext/md/packages/core/src/renderer/` → `src/wechat/renderer/renderer-impl.ts`
- [ ] 5.2 Fix import paths: `@md/shared/types` → `../types/renderer-types`

## 6. Port Theme Utilities

- [ ] 6.1 Copy `cssProcessor.ts` from `.ext/md/packages/core/src/theme/` → `src/wechat/theme/cssProcessor.ts`
- [ ] 6.2 Copy `cssVariables.ts` → `src/wechat/theme/cssVariables.ts`
- [ ] 6.3 Copy `cssScopeWrapper.ts` → `src/wechat/theme/cssScopeWrapper.ts`
- [ ] 6.4 Copy `selectorMapping.ts` → `src/wechat/theme/selectorMapping.ts`
- [ ] 6.5 Fix import paths in all four files (remove `@md/` references)

## 7. Port Markdown Helpers

- [ ] 7.1 Copy `markdownHelpers.ts` from `.ext/md/packages/core/src/utils/` → `src/wechat/utils/markdownHelpers.ts`
- [ ] 7.2 Fix import paths: `@md/core/renderer` → `../renderer/renderer-impl`, `@md/shared/types` → `../types/renderer-types`

## 8. Write themeApplicator (Pure Function)

- [ ] 8.1 Create `src/wechat/theme/themeApplicator.ts`
- [ ] 8.2 Implement `buildThemeCSS(config: ThemeConfig): string` — combines base CSS + theme CSS + CSS variables + custom CSS, wraps with `#wechat-preview` scope, calls `processCSS()` to expand `var()`
- [ ] 8.3 Verify no DOM manipulation (no `document.head` injection)

## 9. Write Export Service

- [ ] 9.1 Create `src/wechat/services/wechatExport.ts`
- [ ] 9.2 Implement `copyToWechat(markdown: string, config: WechatExportConfig): Promise<void>`
  - Step 1: init renderer and call `renderMarkdown()` to get HTML
  - Step 2: call `buildThemeCSS()` to get theme CSS string
  - Step 3: wrap as `<style>...</style><div id="wechat-preview">...</div>` and pass to `juice()`
  - Step 4: replace residual `var(--md-primary-color)` with actual hex value
  - Step 5: write to clipboard via `navigator.clipboard.write` with `text/html` MIME type
- [ ] 9.3 Handle clipboard permission error — throw descriptive error for UI to catch

## 10. Write Zustand Store

- [ ] 10.1 Create `src/wechat/stores/useWechatStore.ts`
- [ ] 10.2 Define state: `isOpen`, `themeName`, `primaryColor`, `fontFamily`, `fontSize`, `customCSS`
- [ ] 10.3 Define actions: `open()`, `close()`, `setTheme()`, `setPrimaryColor()`, `setCustomCSS()`
- [ ] 10.4 Set defaults: `themeName: 'default'`, `primaryColor: '#1a73e8'`, `isOpen: false`

## 11. Build WechatPanel Component

- [ ] 11.1 Create `src/wechat/components/WechatPanel.tsx`
- [ ] 11.2 Use shadcn `Sheet` component (right side) as the panel container
- [ ] 11.3 Add theme selector (radio group or select) with options from `themeOptions`
- [ ] 11.4 Add primary color picker (`<input type="color">`)
- [ ] 11.5 Add live preview area: `<div id="wechat-preview">` with `dangerouslySetInnerHTML` showing rendered HTML
- [ ] 11.6 Apply theme CSS to preview via `<style>` tag injected into the panel
- [ ] 11.7 Add "复制到公众号" button — calls `copyToWechat()`, shows success/error toast
- [ ] 11.8 Add image handling notice banner

## 12. Update Barrel Export

- [ ] 12.1 Fill in `src/wechat/index.ts`: export `WechatPanel`, `useWechatStore`, `copyToWechat`

## 13. Integrate into Existing App

- [ ] 13.1 Add WeChat export button to `src/components/toolbar-v2/Toolbar.tsx` (use a WeChat icon or `MessageSquare` from lucide)
- [ ] 13.2 Wire button `onClick` to `useWechatStore.getState().open()`
- [ ] 13.3 Mount `<WechatPanel />` in `src/AppV2.tsx`

## 14. Verify & Cleanup

- [ ] 14.1 Run `pnpm build` — confirm zero TypeScript errors
- [ ] 14.2 Manual test: open panel, switch themes, change color, verify preview updates
- [ ] 14.3 Manual test: click copy, paste into WeChat editor, verify styles are preserved
- [ ] 14.4 Manual test: clipboard permission denied scenario (test in non-HTTPS context if possible)
- [ ] 14.5 Delete `.ext/md/` temporary directory after confirming all functionality works
