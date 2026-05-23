/**
 * 微信导出渲染器类型定义
 */

/**
 * 渲染器选项
 */
export interface IOpts {
  legend?: string
  citeStatus?: boolean
  countStatus?: boolean
  isMacCodeBlock?: boolean
  isShowLineNumber?: boolean
  themeMode?: 'light' | 'dark'
}

/**
 * 渲染器 API
 */
export interface RendererAPI {
  reset: (newOpts: Partial<IOpts>) => void
  setOptions: (newOpts: Partial<IOpts>) => void
  getOpts: () => IOpts
  parseFrontMatterAndContent: (markdown: string) => {
    markdownContent: string
  }
  buildFootnotes: () => string
  buildAddition: () => string
  createContainer: (html: string) => string
}
