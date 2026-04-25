import { useCommandStore, useUIStore, useThemeStore, useFileStore } from '../stores'
import { commandRegistry } from './registry'

/**
 * 注册所有内置命令到 CommandStore
 * 在 App 初始化时调用一次
 */
export function registerAllCommands() {
  const store = useCommandStore.getState()

  const allCommands = [
    // ===== 文件命令 =====
    { id: 'file.new', category: 'file' as const, title: '新建文件', shortcut: 'Ctrl+N', execute: () => { useFileStore.getState().openTab(null, '') } },
    { id: 'file.save', category: 'file' as const, title: '保存', shortcut: 'Ctrl+S', execute: () => { window.dispatchEvent(new CustomEvent('app:save-file')) } },
    { id: 'file.saveAs', category: 'file' as const, title: '另存为', shortcut: 'Ctrl+Shift+S', execute: () => { window.dispatchEvent(new CustomEvent('app:save-as')) } },
    { id: 'file.open', category: 'file' as const, title: '打开文件', shortcut: 'Ctrl+O', execute: () => { window.dispatchEvent(new CustomEvent('app:open-file')) } },
    { id: 'file.exportPdf', category: 'file' as const, title: '导出为 PDF', execute: () => { window.dispatchEvent(new CustomEvent('app:export-pdf')) } },
    { id: 'file.exportHtml', category: 'file' as const, title: '导出为 HTML', execute: () => { window.dispatchEvent(new CustomEvent('app:export-html')) } },

    // ===== 编辑命令 =====
    { id: 'edit.undo', category: 'edit' as const, title: '撤销', shortcut: 'Ctrl+Z', execute: () => { window.dispatchEvent(new CustomEvent('editor:undo')) } },
    { id: 'edit.redo', category: 'edit' as const, title: '重做', shortcut: 'Ctrl+Shift+Z', execute: () => { window.dispatchEvent(new CustomEvent('editor:redo')) } },
    { id: 'edit.find', category: 'edit' as const, title: '查找', shortcut: 'Ctrl+F', execute: () => { useUIStore.getState().setFindReplaceOpen(true); useUIStore.getState().setFindReplaceMode('find') } },
    { id: 'edit.replace', category: 'edit' as const, title: '替换', shortcut: 'Ctrl+H', execute: () => { useUIStore.getState().setFindReplaceOpen(true); useUIStore.getState().setFindReplaceMode('replace') } },
    { id: 'edit.format', category: 'edit' as const, title: '格式化文档', execute: () => { window.dispatchEvent(new CustomEvent('editor:format')) } },

    // ===== 视图命令 =====
    { id: 'view.split', category: 'view' as const, title: '分栏视图', execute: () => { useUIStore.getState().setViewMode('split') } },
    { id: 'view.editor', category: 'view' as const, title: '仅编辑器', execute: () => { useUIStore.getState().setViewMode('editor-only') } },
    { id: 'view.preview', category: 'view' as const, title: '仅预览', execute: () => { useUIStore.getState().setViewMode('preview-only') } },
    { id: 'view.sidebar', category: 'view' as const, title: '切换侧边栏', shortcut: 'Ctrl+B', execute: () => { useUIStore.getState().toggleSidebar() } },
    { id: 'view.zoomIn', category: 'view' as const, title: '放大', shortcut: 'Ctrl++', execute: () => { useUIStore.getState().zoomIn() } },
    { id: 'view.zoomOut', category: 'view' as const, title: '缩小', shortcut: 'Ctrl+-', execute: () => { useUIStore.getState().zoomOut() } },
    { id: 'view.zoomReset', category: 'view' as const, title: '重置缩放', shortcut: 'Ctrl+0', execute: () => { useUIStore.getState().setZoomLevel(14) } },
    { id: 'view.commandPalette', category: 'view' as const, title: '命令面板', shortcut: 'Ctrl+Shift+P', execute: () => { useUIStore.getState().toggleCommandPalette() } },
    { id: 'view.outline', category: 'view' as const, title: '切换大纲面板', execute: () => { useUIStore.getState().setActiveSidebarPanel('outline') } },

    // ===== 插入命令 =====
    { id: 'insert.table', category: 'insert' as const, title: '表格', execute: () => { window.dispatchEvent(new CustomEvent('editor:insert', { detail: '| 列1 | 列2 |\n|------|------|\n| | |' })) } },
    { id: 'insert.codeblock', category: 'insert' as const, title: '代码块', execute: () => { window.dispatchEvent(new CustomEvent('editor:insert', { detail: '```language\n\n```' })) } },
    { id: 'insert.tasklist', category: 'insert' as const, title: '任务列表', execute: () => { window.dispatchEvent(new CustomEvent('editor:insert', { detail: '- [ ] 任务' })) } },
    { id: 'insert.link', category: 'insert' as const, title: '链接', execute: () => { window.dispatchEvent(new CustomEvent('editor:insert', { detail: '[文本](url)' })) } },
    { id: 'insert.image', category: 'insert' as const, title: '图片', execute: () => { window.dispatchEvent(new CustomEvent('editor:insert', { detail: '![描述](url)' })) } },
    { id: 'insert.hr', category: 'insert' as const, title: '水平线', execute: () => { window.dispatchEvent(new CustomEvent('editor:insert', { detail: '\n---\n' })) } },

    // ===== 主题命令 =====
    { id: 'theme.dark', category: 'theme' as const, title: '切换到深色模式', execute: () => { useThemeStore.getState().setTheme('dark') } },
    { id: 'theme.light', category: 'theme' as const, title: '切换到浅色模式', execute: () => { useThemeStore.getState().setTheme('light') } },
    { id: 'theme.monokai', category: 'theme' as const, title: 'Monokai', execute: () => { useThemeStore.getState().setTheme('monokai') } },
    { id: 'theme.solarized', category: 'theme' as const, title: 'Solarized', execute: () => { useThemeStore.getState().setTheme('solarized') } },
    { id: 'theme.nord', category: 'theme' as const, title: 'Nord', execute: () => { useThemeStore.getState().setTheme('nord') } },
    { id: 'theme.dracula', category: 'theme' as const, title: 'Dracula', execute: () => { useThemeStore.getState().setTheme('dracula') } },
    { id: 'theme.github', category: 'theme' as const, title: 'GitHub', execute: () => { useThemeStore.getState().setTheme('github') } },

    // ===== AI 命令 =====
    { id: 'ai.open', category: 'ai' as const, title: '打开 AI 助手', execute: () => useUIStore.getState().setAIPanelOpen(true) },
    { id: 'ai.rewrite', category: 'ai' as const, title: '改写选中文本', execute: () => { useUIStore.getState().setAIPanelOpen(true); /* switch to rewrite mode */ } },
    { id: 'ai.translate', category: 'ai' as const, title: '翻译选中文本', execute: () => { useUIStore.getState().setAIPanelOpen(true) } },
  ]

  allCommands.forEach((cmd) => store.registerCommand(cmd))
}

export { commandRegistry }
