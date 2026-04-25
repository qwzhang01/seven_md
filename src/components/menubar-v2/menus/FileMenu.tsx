import { useFileStore } from '../../../stores'
import type { MenuItemDef } from '../MenuBar'
import { MenuDropdown } from '../MenuDropdown'

interface FileMenuProps {
  onClose: () => void
}

export function FileMenu({ onClose }: FileMenuProps) {
  const handleNewFile = () => {
    useFileStore.getState().openTab(null, '')
    onClose()
  }

  const handleOpenFile = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
      })
      if (selected) {
        const { readFile } = await import('../../../tauriCommands')
        const content = await readFile(selected as string)
        useFileStore.getState().openTab(selected as string, content)
      }
    } catch (e) {
      console.error('Failed to open file:', e)
    }
    onClose()
  }

  const handleSave = async () => {
    const store = useFileStore.getState()
    const activeTab = store.getActiveTab()
    if (!activeTab) return
    // Delegate save to parent via event
    window.dispatchEvent(new CustomEvent('app:save-file'))
    onClose()
  }

  const handleSaveAs = () => {
    window.dispatchEvent(new CustomEvent('app:save-as'))
    onClose()
  }

  const handleExportPdf = () => {
    window.dispatchEvent(new CustomEvent('app:export-pdf'))
    onClose()
  }

  const handleExportHtml = () => {
    window.dispatchEvent(new CustomEvent('app:export-html'))
    onClose()
  }

  const items: MenuItemDef[] = [
    { label: '新建文件', shortcut: 'Ctrl+N', action: handleNewFile },
    { label: '新建窗口', shortcut: 'Ctrl+Shift+N', action: () => { onClose() } },
    { label: '', separator: true },
    { label: '打开文件', shortcut: 'Ctrl+O', action: handleOpenFile },
    { label: '打开文件夹', action: () => { window.dispatchEvent(new CustomEvent('app:open-folder')); onClose() } },
    { label: '', separator: true },
    { label: '保存', shortcut: 'Ctrl+S', action: handleSave },
    { label: '另存为', shortcut: 'Ctrl+Shift+S', action: handleSaveAs },
    { label: '', separator: true },
    { label: '导出为 PDF', action: handleExportPdf },
    { label: '导出为 HTML', action: handleExportHtml },
  ]

  return <MenuDropdown items={items} onClose={onClose} />
}
