import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'

interface PreviewPaneProps {
  markdown: string
  className?: string
}

export default function PreviewPane({ markdown, className = '' }: PreviewPaneProps) {
  // Performance monitoring
  usePerformanceMonitor('PreviewPane')
  const { t } = useTranslation()
  
  return (
    <div 
      className={className}
      role="region"
      aria-label={t('preview.ariaLabel')}
    >
      <div className="h-full flex flex-col">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300" id="preview-heading">
            {t('preview.title')}
          </h2>
        </div>
        
        <div 
          className="flex-1 p-4 overflow-y-auto"
          role="article"
          aria-labelledby="preview-heading"
          aria-live="polite"
        >
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeHighlight]}
              components={{
                code: ({ className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const isInline = !match && !className
                  return isInline ? (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className={className} {...props}>
                      <code className={className}>{children}</code>
                    </pre>
                  )
                }
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}