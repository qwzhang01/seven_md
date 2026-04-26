import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// English translations
const enTranslations = {
  common: {
    appName: 'Seven Markdown',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    search: 'Search',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
    show: 'Show',
    hide: 'Hide',
    viewControls: 'View controls',
  },
  menu: {
    file: 'File',
    edit: 'Edit',
    view: 'View',
    window: 'Window',
    help: 'Help',
    newFile: 'New File',
    openFile: 'Open File',
    openFolder: 'Open Folder',
    saveFile: 'Save File',
    saveAs: 'Save As',
    exportPdf: 'Export as PDF',
    exportHtml: 'Export as HTML',
    export: 'Export',
    exportAsPdf: 'Export as PDF',
    exportAsHtml: 'Export as HTML',
    preferences: 'Preferences',
    exit: 'Exit',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select All',
    toggleSidebar: 'Toggle Sidebar',
    togglePreview: 'Toggle Preview',
    showSidebar: 'Show Sidebar',
    hideSidebar: 'Hide Sidebar',
    showEditor: 'Show Editor',
    hideEditor: 'Hide Editor',
    showPreview: 'Show Preview',
    hidePreview: 'Hide Preview',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetZoom: 'Reset Zoom',
    fullscreen: 'Fullscreen',
    recentFiles: 'Recent Files',
    clearRecentFiles: 'Clear Recent Files',
    find: 'Find...',
    replace: 'Replace...',
    documentation: 'Documentation',
    githubRepository: 'GitHub Repository',
    aboutApp: 'About Seven Markdown',
    keyboardShortcuts: 'Keyboard Shortcuts',
  },
  sidebar: {
    files: 'Files',
    outline: 'Outline',
    search: 'Search',
    noFilesOpen: 'No files open',
    noOutline: 'No outline available',
    searchPlaceholder: 'Search in files...',
    noResults: 'No results found',
    ariaLabel: 'File explorer sidebar',
    loadingFiles: 'Loading files',
    loadingContents: 'Loading folder contents...',
    folderLoaded: 'Folder loaded with {{count}} items',
    noMarkdownFiles: 'No markdown files found in this folder',
    noFolderOpen: 'No folder open',
    openFolderPrompt: 'Open a folder to view its contents',
    refresh: 'Refresh',
  },
  fileTree: {
    newFile: 'New File',
    newFolder: 'New Folder',
    rename: 'Rename',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
    newFilePlaceholder: 'File name',
    newFolderPlaceholder: 'Folder name',
    errorEmpty: 'Name cannot be empty',
    errorDuplicate: 'A file or folder with this name already exists',
  },
  editor: {
    title: 'Editor',
    ariaLabel: 'Markdown editor',
    placeholder: 'Start writing your markdown here...',
    line: 'Line',
    column: 'Column',
    characters: 'Characters',
    words: 'Words',
    lines: 'Lines',
  },
  preview: {
    title: 'Preview',
    ariaLabel: 'Markdown preview',
    exportPdf: 'Export PDF',
    print: 'Print',
    refresh: 'Refresh',
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    toggle: 'Toggle theme',
    switchToDark: 'Switch to dark theme',
    switchToLight: 'Switch to light theme',
  },
  shortcuts: {
    title: 'Keyboard Shortcuts',
    openFile: 'Open File',
    saveFile: 'Save File',
    toggleSidebar: 'Toggle Sidebar',
    togglePreview: 'Toggle Preview',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    newFile: 'New File',
    search: 'Search',
    openSearchPanel: 'Open Search Panel',
  },
  search: {
    title: 'Search',
    placeholder: 'Search...',
    modeFiles: 'Files',
    modeText: 'Text',
    loading: 'Searching...',
    noResults: 'No results found',
    openFolderToSearch: 'Open a folder to search',
    truncated: 'Results limited to 200 matches',
    inputAriaLabel: 'Search input',
    resultsAriaLabel: 'Search results',
  },
  export: {
    successHtml: 'Exported HTML to {{path}}',
    successPdf: 'Print dialog opened',
    error: 'Export failed: {{message}}',
    cancelled: 'Export cancelled',
  },
  errors: {
    fileNotFound: 'File not found',
    fileLoadError: 'Failed to load file',
    fileSaveError: 'Failed to save file',
    permissionDenied: 'Permission denied',
    networkError: 'Network error',
    unknownError: 'An unknown error occurred',
  },
  errorBoundary: {
    title: 'Something went wrong',
    unexpectedError: 'An unexpected error occurred. Please try again.',
    caughtBy: 'Caught by',
    boundary: 'boundary',
    tryAgain: 'Try Again',
    reloadApplication: 'Reload Application',
    retryAriaLabel: 'Retry to recover from error',
    reloadAriaLabel: 'Reload the entire application',
    viewErrorDetails: 'View Error Details',
    errorMessage: 'Error Message',
    stackTrace: 'Stack Trace',
    componentStack: 'Component Stack',
  },
  about: {
    title: 'About Seven Markdown',
    version: 'Version',
    description: 'A modern Markdown reader for macOS built with Tauri + React',
    author: 'Seven Markdown Contributors',
    license: 'MIT License',
    website: 'Website',
    repository: 'Repository',
  },
}

// Chinese translations
const zhTranslations = {
  common: {
    appName: 'Seven Markdown',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    close: '关闭',
    confirm: '确认',
    yes: '是',
    no: '否',
    search: '搜索',
    settings: '设置',
    help: '帮助',
    about: '关于',
    show: '显示',
    hide: '隐藏',
    viewControls: '视图控制',
  },
  menu: {
    file: '文件',
    edit: '编辑',
    view: '视图',
    window: '窗口',
    help: '帮助',
    newFile: '新建文件',
    openFile: '打开文件',
    openFolder: '打开文件夹',
    saveFile: '保存文件',
    saveAs: '另存为',
    exportPdf: '导出为 PDF',
    exportHtml: '导出为 HTML',
    export: '导出',
    exportAsPdf: '导出为 PDF',
    exportAsHtml: '导出为 HTML',
    preferences: '偏好设置',
    exit: '退出',
    undo: '撤销',
    redo: '重做',
    cut: '剪切',
    copy: '复制',
    paste: '粘贴',
    selectAll: '全选',
    toggleSidebar: '切换侧边栏',
    togglePreview: '切换预览',
    showSidebar: '显示侧边栏',
    hideSidebar: '隐藏侧边栏',
    showEditor: '显示编辑器',
    hideEditor: '隐藏编辑器',
    showPreview: '显示预览',
    hidePreview: '隐藏预览',
    zoomIn: '放大',
    zoomOut: '缩小',
    resetZoom: '重置缩放',
    fullscreen: '全屏',
    recentFiles: '最近文件',
    clearRecentFiles: '清除最近文件',
    find: '查找...',
    replace: '替换...',
    documentation: '文档',
    githubRepository: 'GitHub 仓库',
    aboutApp: '关于 Seven Markdown',
    keyboardShortcuts: '键盘快捷键',
  },
  sidebar: {
    files: '文件',
    outline: '大纲',
    search: '搜索',
    noFilesOpen: '没有打开的文件',
    noOutline: '没有可用大纲',
    searchPlaceholder: '在文件中搜索...',
    noResults: '未找到结果',
    ariaLabel: '文件浏览器侧边栏',
    loadingFiles: '正在加载文件',
    loadingContents: '正在加载文件夹内容...',
    folderLoaded: '文件夹已加载，共 {{count}} 个项目',
    noMarkdownFiles: '此文件夹中未找到 Markdown 文件',
    noFolderOpen: '未打开文件夹',
    openFolderPrompt: '打开文件夹以查看其内容',
    refresh: '刷新',
  },
  fileTree: {
    newFile: '新建文件',
    newFolder: '新建文件夹',
    rename: '重命名',
    delete: '删除',
    deleteConfirm: '确定要删除「{{name}}」吗？此操作无法撤销。',
    newFilePlaceholder: '文件名',
    newFolderPlaceholder: '文件夹名',
    errorEmpty: '名称不能为空',
    errorDuplicate: '该目录下已存在同名文件或文件夹',
  },
  editor: {
    title: '编辑器',
    ariaLabel: 'Markdown 编辑器',
    placeholder: '在这里开始编写你的 Markdown...',
    line: '行',
    column: '列',
    characters: '字符',
    words: '词',
    lines: '行',
  },
  preview: {
    title: '预览',
    ariaLabel: 'Markdown 预览',
    exportPdf: '导出 PDF',
    print: '打印',
    refresh: '刷新',
  },
  theme: {
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
    toggle: '切换主题',
    switchToDark: '切换到深色主题',
    switchToLight: '切换到浅色主题',
  },
  shortcuts: {
    title: '键盘快捷键',
    openFile: '打开文件',
    saveFile: '保存文件',
    toggleSidebar: '切换侧边栏',
    togglePreview: '切换预览',
    zoomIn: '放大',
    zoomOut: '缩小',
    newFile: '新建文件',
    search: '搜索',
    openSearchPanel: '打开搜索面板',
  },
  search: {
    title: '搜索',
    placeholder: '搜索...',
    modeFiles: '文件',
    modeText: '文本',
    loading: '搜索中...',
    noResults: '未找到结果',
    openFolderToSearch: '请先打开文件夹以进行搜索',
    truncated: '结果已限制为 200 条',
    inputAriaLabel: '搜索输入框',
    resultsAriaLabel: '搜索结果',
  },
  export: {
    successHtml: '已导出 HTML 到 {{path}}',
    successPdf: '打印对话框已打开',
    error: '导出失败：{{message}}',
    cancelled: '导出已取消',
  },
  errors: {
    fileNotFound: '文件未找到',
    fileLoadError: '文件加载失败',
    fileSaveError: '文件保存失败',
    permissionDenied: '权限被拒绝',
    networkError: '网络错误',
    unknownError: '发生未知错误',
  },
  errorBoundary: {
    title: '出了点问题',
    unexpectedError: '发生了意外错误，请重试。',
    caughtBy: '被',
    boundary: '边界捕获',
    tryAgain: '重试',
    reloadApplication: '重新加载应用',
    retryAriaLabel: '重试以从错误中恢复',
    reloadAriaLabel: '重新加载整个应用程序',
    viewErrorDetails: '查看错误详情',
    errorMessage: '错误消息',
    stackTrace: '堆栈跟踪',
    componentStack: '组件堆栈',
  },
  about: {
    title: '关于 Seven Markdown',
    version: '版本',
    description: '基于 Tauri + React 构建的现代化 Markdown 阅读器',
    author: 'Seven Markdown 贡献者',
    license: 'MIT 许可证',
    website: '网站',
    repository: '代码仓库',
  },
}

// Available languages
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
] as const

export type LanguageCode = typeof languages[number]['code']

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      zh: { translation: zhTranslations },
    },
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n

// Helper function to get translation with fallback
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options)
}

// Helper to change language
export function changeLanguage(code: LanguageCode): Promise<void> {
  return new Promise((resolve, reject) => {
    i18n.changeLanguage(code, (err) => {
      if (err) {
        reject(err)
      } else {
        localStorage.setItem('i18nextLng', code)
        resolve()
      }
    })
  })
}

// Get current language
export function getCurrentLanguage(): LanguageCode {
  return (i18n.language || 'en') as LanguageCode
}

// RTL language codes
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'ps', 'yi']

// Check if current language is RTL
export function isRTL(): boolean {
  const lang = getCurrentLanguage()
  return RTL_LANGUAGES.includes(lang)
}

// Get text direction for current language
export function getTextDirection(): 'ltr' | 'rtl' {
  return isRTL() ? 'rtl' : 'ltr'
}

// Apply text direction to document
export function applyTextDirection(): void {
  const dir = getTextDirection()
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.setAttribute('lang', getCurrentLanguage())
}

// Subscribe to language changes and update text direction
export function subscribeToLanguageChanges(): () => void {
  const handler = () => {
    applyTextDirection()
  }
  
  i18n.on('languageChanged', handler)
  
  // Apply initial direction
  applyTextDirection()
  
  // Return unsubscribe function
  return () => {
    i18n.off('languageChanged', handler)
  }
}
