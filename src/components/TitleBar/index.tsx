import { Moon, Sun, SidebarOpen, PanelLeftClose, PanelRightClose } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../../context/AppContext'
import { Breadcrumb } from './Breadcrumb'
import { LanguageSelector } from '../LanguageSelector'
import { MenuBar } from '../MenuBar'
import { useDPIScaling } from '../../utils/dpiScaling'

interface TitleBarProps {
  onToggleTheme?: () => void
  theme?: 'light' | 'dark'
  onToggleSidebar?: () => void
  onToggleEditor?: () => void
  onTogglePreview?: () => void
  sidebarCollapsed?: boolean
  editorCollapsed?: boolean
  previewCollapsed?: boolean
}

export function TitleBar({
  onToggleTheme,
  theme,
  onToggleSidebar,
  onToggleEditor,
  onTogglePreview,
  sidebarCollapsed,
  editorCollapsed,
  previewCollapsed
}: TitleBarProps) {
  const { state } = useAppState()
  const { t } = useTranslation()
  const { getDPIAwareSpacing, getDPIClasses } = useDPIScaling()
  
  // Detect platform for window controls
  const isWindows = navigator.platform.toLowerCase().includes('win')
  const isMacOS = navigator.platform.toLowerCase().includes('mac')
  
  // Apply DPI-aware spacing
  const titleBarHeight = getDPIAwareSpacing(48) // Base height 48px
  const buttonPadding = getDPIAwareSpacing(8) // Base padding 8px
  const dpiClasses = getDPIClasses()

  return (
    <div 
      className={`h-${titleBarHeight} flex items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 select-none ${Object.values(dpiClasses).join(' ')}`}
      data-tauri-drag-region
      style={{ height: `${titleBarHeight}px` }}
    >
      {/* Spacer for native window controls (macOS only) */}
      {isMacOS && <div className="w-20 shrink-0" data-tauri-drag-region></div>}

      {/* Menu Bar (Windows) or App name (macOS) */}
      <div className="flex items-center h-full" data-tauri-drag-region>
        {isWindows ? (
          <MenuBar />
        ) : (
          <div className="text-sm font-medium text-blue-500 dark:text-blue-400 shrink-0" data-tauri-drag-region>
            {t('common.appName')}
          </div>
        )}
      </div>

      {/* Breadcrumb - draggable, fills remaining space */}
      <div className="flex-1 flex items-center px-3" data-tauri-drag-region>
        <Breadcrumb folderPath={state.folder.path} filePath={state.tabs.tabs.find(t => t.id === state.tabs.activeTabId)?.path ?? null} />
      </div>

      {/* View control buttons */}
      <div className="flex items-center gap-1 mr-2" role="toolbar" aria-label={t('common.viewControls')}>
        <button
          onClick={onToggleSidebar}
          className={`flex items-center gap-1.5 px-${buttonPadding} py-1 text-xs rounded transition-colors ${
            sidebarCollapsed 
              ? 'text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label={sidebarCollapsed ? t('menu.showSidebar') : t('menu.hideSidebar')}
          aria-pressed={!sidebarCollapsed}
          title={sidebarCollapsed ? t('menu.showSidebar') : t('menu.hideSidebar')}
        >
          <SidebarOpen size={14} aria-hidden="true" />
        </button>
        
        <button
          onClick={onToggleEditor}
          className={`flex items-center gap-1.5 px-${buttonPadding} py-1 text-xs rounded transition-colors ${
            editorCollapsed 
              ? 'text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label={editorCollapsed ? t('menu.showEditor') : t('menu.hideEditor')}
          aria-pressed={!editorCollapsed}
          title={editorCollapsed ? t('menu.showEditor') : t('menu.hideEditor')}
        >
          <PanelLeftClose size={14} aria-hidden="true" />
        </button>
        
        <button
          onClick={onTogglePreview}
          className={`flex items-center gap-1.5 px-${buttonPadding} py-1 text-xs rounded transition-colors ${
            previewCollapsed 
              ? 'text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label={previewCollapsed ? t('menu.showPreview') : t('menu.hidePreview')}
          aria-pressed={!previewCollapsed}
          title={previewCollapsed ? t('menu.showPreview') : t('menu.hidePreview')}
        >
          <PanelRightClose size={14} aria-hidden="true" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-1.5 px-${buttonPadding} py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors`}
          aria-label={theme === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')}
          title={t('theme.toggle')}
        >
          {theme === 'light' ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
        </button>

        {/* Language selector */}
        <LanguageSelector />
      </div>
    </div>
  )
}
