/**
 * 微信公众号导出服务
 * Markdown → HTML → juice 内联 CSS → 剪贴板
 */

import type { ThemeName } from '../theme-css'
import { marked } from 'marked'
import juice from 'juice'
import { initRenderer } from '../renderer/renderer-impl'
import { buildThemeCSS } from '../theme/themeApplicator'

export interface WechatExportConfig {
  themeName: ThemeName
  primaryColor: string
  fontFamily: string
  fontSize: string
  customCSS?: string
}

/**
 * 将 Markdown 渲染为微信公众号可用的内联样式 HTML，并写入剪贴板
 */
export async function copyToWechat(markdown: string, config: WechatExportConfig): Promise<void> {
  // Step 1: 初始化渲染器并渲染 Markdown
  const renderer = initRenderer({ citeStatus: true, isMacCodeBlock: true })
  const { markdownContent } = renderer.parseFrontMatterAndContent(markdown)
  let html = marked.parse(markdownContent) as string

  // 追加脚注
  html += renderer.buildFootnotes()

  // 包裹容器
  html = renderer.createContainer(html)

  // Step 2: 构建主题 CSS
  const themeCSS = buildThemeCSS(config)

  // Step 3: 组合 HTML + CSS 并通过 juice 内联
  const fullHtml = `<style>${themeCSS}</style><div id="wechat-preview">${html}</div>`
  let inlinedHtml = juice(fullHtml, {
    removeStyleTags: true,
    preserveImportant: true,
  })

  // Step 4: 替换残留的 CSS 变量
  inlinedHtml = inlinedHtml.replace(/var\(--md-primary-color\)/g, config.primaryColor)
  inlinedHtml = inlinedHtml.replace(/var\(--md-font-family\)/g, config.fontFamily)
  inlinedHtml = inlinedHtml.replace(/var\(--md-font-size\)/g, config.fontSize)
  inlinedHtml = inlinedHtml.replace(/var\(--foreground\)/g, '0 0% 9%')
  inlinedHtml = inlinedHtml.replace(/hsl\(0 0% 9%\)/g, '#171717')
  inlinedHtml = inlinedHtml.replace(/var\(--blockquote-background\)/g, 'rgba(0, 0, 0, 0.03)')

  // Step 5: 写入剪贴板（text/html 格式）
  try {
    const blob = new Blob([inlinedHtml], { type: 'text/html' })
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': blob }),
    ])
  } catch (err) {
    throw new Error(`剪贴板写入失败：${err instanceof Error ? err.message : '请确保在 HTTPS 或本地环境中使用'}`)
  }
}

/**
 * 渲染预览 HTML（不写入剪贴板，用于面板实时预览）
 */
export function renderPreviewHtml(markdown: string, config: WechatExportConfig): string {
  const renderer = initRenderer({ citeStatus: true, isMacCodeBlock: true })
  const { markdownContent } = renderer.parseFrontMatterAndContent(markdown)
  let html = marked.parse(markdownContent) as string
  html += renderer.buildFootnotes()
  html = renderer.createContainer(html)
  return html
}
