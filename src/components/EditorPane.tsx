import { useTranslation } from 'react-i18next'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'
import { CodeMirrorEditor } from './CodeMirrorEditor'

interface EditorPaneProps {
  markdown: string
  onChange: (content: string) => void
  className?: string
}

export default function EditorPane({ className = '' }: EditorPaneProps) {
  // Performance monitoring
  usePerformanceMonitor('EditorPane')
  const { t } = useTranslation()
  
  return (
    <div 
      className={`border-r border-gray-200 dark:border-gray-700 ${className}`}
      role="region"
      aria-label={t('editor.ariaLabel')}
    >
      <div className="h-full flex flex-col">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300" id="editor-heading">
            {t('editor.title')}
          </h2>
        </div>
        
        <div className="flex-1 overflow-hidden" role="textbox" aria-labelledby="editor-heading">
          <CodeMirrorEditor className="h-full" />
        </div>
      </div>
    </div>
  )
}