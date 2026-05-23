/**
 * 微信公众号 Markdown 渲染器
 * 基于 marked，简化版（不含 mermaid/katex 等微信不支持的扩展）
 */

import type { IOpts, RendererAPI } from '../types/renderer-types'
import type { RendererObject, Tokens } from 'marked'
import frontMatter from 'front-matter'
import hljs from 'highlight.js/lib/core'
import { marked } from 'marked'

// 注册常用语言
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('java', java)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('rs', rust)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)

const HEADING_TAG_REGEX = /^h\d$/
const UNDERSCORE_REGEX = /_/g
const PARAGRAPH_WRAPPER_REGEX = /^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/
const MP_WEIXIN_LINK_REGEX = /^https?:\/\/mp\.weixin\.qq\.com/

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
}

function buildAddition(): string {
  return `
    <style>
      .preview-wrapper pre::before {
        position: absolute;
        top: 0;
        right: 0;
        color: #ccc;
        text-align: center;
        font-size: 0.8em;
        padding: 5px 10px 0;
        line-height: 15px;
        height: 15px;
        font-weight: 600;
      }
    </style>
  `
}

function buildFootnoteArray(footnotes: [number, string, string][]): string {
  return footnotes
    .map(([index, title, link]) =>
      link === title
        ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i style="word-break: break-all">${title}</i><br/>`
        : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`,
    )
    .join('\n')
}

const macCodeSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130">
    <ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" />
    <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" />
    <ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" />
  </svg>
`.trim()

export function initRenderer(opts: IOpts = {}): RendererAPI {
  const footnotes: [number, string, string][] = []
  let footnoteIndex = 0
  const listOrderedStack: boolean[] = []
  const listCounters: number[] = []

  function getOpts(): IOpts {
    return opts
  }

  function styledContent(styleLabel: string, content: string, tagName?: string, style?: string): string {
    const tag = tagName ?? styleLabel
    const className = `${styleLabel.replace(UNDERSCORE_REGEX, '-')}`
    const headingAttr = HEADING_TAG_REGEX.test(tag) ? ' data-heading="true"' : ''
    const styleAttr = style ? ` style="${style}"` : ''
    return `<${tag} class="${className}"${headingAttr}${styleAttr}>${content}</${tag}>`
  }

  function addFootnote(title: string, link: string): number {
    const existingFootnote = footnotes.find(([, , existingLink]) => existingLink === link)
    if (existingFootnote) {
      return existingFootnote[0]
    }
    footnotes.push([++footnoteIndex, title, link])
    return footnoteIndex
  }

  function reset(newOpts: Partial<IOpts>): void {
    footnotes.length = 0
    footnoteIndex = 0
    setOptions(newOpts)
  }

  function setOptions(newOpts: Partial<IOpts>): void {
    opts = { ...opts, ...newOpts }
  }

  const buildFootnotes = () => {
    if (!footnotes.length) return ''
    return (
      styledContent('h4', '引用链接')
      + styledContent('footnotes', buildFootnoteArray(footnotes), 'p')
    )
  }

  const renderer: RendererObject = {
    heading({ tokens, depth }: Tokens.Heading) {
      const text = this.parser.parseInline(tokens)
      const tag = `h${depth}`
      return styledContent(tag, text)
    },

    paragraph({ tokens }: Tokens.Paragraph): string {
      const text = this.parser.parseInline(tokens)
      const isFigureImage = text.includes('<figure') && text.includes('<img')
      const isEmpty = text.trim() === ''
      if (isFigureImage || isEmpty) return text
      return styledContent('p', text)
    },

    blockquote({ tokens }: Tokens.Blockquote): string {
      const text = this.parser.parse(tokens)
      return styledContent('blockquote', text)
    },

    code({ text, lang = '' }: Tokens.Code): string {
      const langText = lang.split(' ')[0]
      const isLanguageRegistered = hljs.getLanguage(langText)
      const language = isLanguageRegistered ? langText : 'plaintext'

      let highlighted: string
      if (language !== 'plaintext') {
        highlighted = hljs.highlight(text, { language }).value
      } else {
        highlighted = escapeHtml(text)
      }

      const span = `<span class="mac-sign" style="padding: 10px 14px 0; display: flex;">${macCodeSvg}</span>`
      const code = `<code class="language-${lang}">${highlighted}</code>`
      return `<pre class="hljs code__pre">${span}${code}</pre>`
    },

    codespan({ text }: Tokens.Codespan): string {
      return styledContent('codespan', escapeHtml(text), 'code')
    },

    list({ ordered, items, start = 1 }: Tokens.List) {
      listOrderedStack.push(ordered)
      listCounters.push(Number(start))

      const html = items
        .map(item => this.listitem(item))
        .join('')

      listOrderedStack.pop()
      listCounters.pop()

      return styledContent(ordered ? 'ol' : 'ul', html)
    },

    listitem(token: Tokens.ListItem) {
      const ordered = listOrderedStack[listOrderedStack.length - 1]
      const idx = listCounters[listCounters.length - 1]!
      listCounters[listCounters.length - 1] = idx + 1

      const prefix = ordered ? `${idx}. ` : '• '

      let content: string
      try {
        content = this.parser.parseInline(token.tokens)
      } catch {
        content = this.parser
          .parse(token.tokens)
          .replace(PARAGRAPH_WRAPPER_REGEX, '$1')
      }

      return styledContent('listitem', `${prefix}${content}`, 'li')
    },

    image({ href, title, text }: Tokens.Image): string {
      const titleAttr = title ? ` title="${title}"` : ''
      return `<figure><img src="${href}"${titleAttr} alt="${text}" style="max-width: 100%;"/></figure>`
    },

    link({ href, title, text, tokens }: Tokens.Link): string {
      const parsedText = this.parser.parseInline(tokens)
      if (MP_WEIXIN_LINK_REGEX.test(href)) {
        return `<a href="${href}" title="${title || text}">${parsedText}</a>`
      }
      if (href === text) return parsedText
      if (opts.citeStatus) {
        const ref = addFootnote(title || text, href)
        return `<a href="${href}" title="${title || text}">${parsedText}<sup>[${ref}]</sup></a>`
      }
      return `<a href="${href}" title="${title || text}">${parsedText}</a>`
    },

    strong({ tokens }: Tokens.Strong): string {
      return styledContent('strong', this.parser.parseInline(tokens))
    },

    em({ tokens }: Tokens.Em): string {
      return styledContent('em', this.parser.parseInline(tokens))
    },

    table({ header, rows }: Tokens.Table): string {
      const headerRow = header
        .map((cell) => {
          const text = this.parser.parseInline(cell.tokens)
          return styledContent('th', text, undefined, `text-align: ${cell.align || 'left'}`)
        })
        .join('')
      const body = rows
        .map((row) => {
          const rowContent = row
            .map(cell => this.tablecell(cell))
            .join('')
          return styledContent('tr', rowContent)
        })
        .join('')
      return `
        <section style="max-width: 100%; overflow: auto;">
          <table class="preview-table">
            <thead>${headerRow}</thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `
    },

    tablecell(token: Tokens.TableCell): string {
      const text = this.parser.parseInline(token.tokens)
      return styledContent('td', text, undefined, `text-align: ${token.align || 'left'}`)
    },

    hr(_token: Tokens.Hr): string {
      return '<hr class="hr">'
    },
  }

  marked.use({ renderer, breaks: true })

  return {
    buildAddition,
    buildFootnotes,
    setOptions,
    reset,
    getOpts,
    parseFrontMatterAndContent(markdownText: string) {
      try {
        const parsed = frontMatter(markdownText)
        return { markdownContent: parsed.body }
      } catch {
        return { markdownContent: markdownText }
      }
    },
    createContainer(content: string) {
      return styledContent('container', content, 'section')
    },
  }
}
