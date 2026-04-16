import { Moon, Sun, SidebarOpen, PanelLeftClose, PanelRightClose } from 'lucide-react'
import { createLogger } from '../utils/logger'

const logger = createLogger('Toolbar')

interface ToolbarProps {
  onToggleTheme: () => void
  theme: 'light' | 'dark'
  onToggleSidebar?: () => void
  onToggleEditor?: () => void
  onTogglePreview?: () => void
  sidebarCollapsed?: boolean
  editorCollapsed?: boolean
  previewCollapsed?: boolean
}

export default function Toolbar({ 
  onToggleTheme, 
  theme,
  onToggleSidebar,
  onToggleEditor,
  onTogglePreview,
  sidebarCollapsed,
  editorCollapsed,
  previewCollapsed
}: ToolbarProps) {
  logger.debug('Toolbar component rendered')
  
  return (
    <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-300/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between px-4 h-12">
        {/* 左侧视图控制按钮组 */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSidebar}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              sidebarCollapsed 
                ? 'text-gray-400 dark:text-gray-500 bg-gray-200/50 dark:bg-gray-700/50' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/80'
            }`}
            title={sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
          >
            <SidebarOpen size={15} />
            <span className="hidden sm:inline">Sidebar</span>
          </button>
          
          <button
            onClick={onToggleEditor}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              editorCollapsed 
                ? 'text-gray-400 dark:text-gray-500 bg-gray-200/50 dark:bg-gray-700/50' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/80'
            }`}
            title={editorCollapsed ? 'Show Editor' : 'Hide Editor'}
          >
            <PanelLeftClose size={15} />
            <span className="hidden sm:inline">Editor</span>
          </button>
          
          <button
            onClick={onTogglePreview}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
              previewCollapsed 
                ? 'text-gray-400 dark:text-gray-500 bg-gray-200/50 dark:bg-gray-700/50' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/80'
            }`}
            title={previewCollapsed ? 'Show Preview' : 'Hide Preview'}
          >
            <PanelRightClose size={15} />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>

        {/* 右侧主题切换 */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 rounded-md transition-colors"
          title="Toggle theme"
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
      </div>
    </div>
  )
}