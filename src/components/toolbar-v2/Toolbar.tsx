import { ToolbarGroup } from './ToolbarGroup'
import { ToolbarButton } from './ToolbarButton'
import {
  Undo2, Redo2,
  Heading1, Heading2, Heading3,
  Bold, Italic, Strikethrough,
  Code, FileCode,
  Link, Image,
  List, ListOrdered, ListChecks,
  Quote, Table, Minus,
  Bot,
  Columns2, PanelLeft, PanelRight,
  Command,
} from 'lucide-react'
import { useUIStore } from '../../stores'

function insertAtCursor(text: string) {
  window.dispatchEvent(new CustomEvent('editor:insert', { detail: text }))
}

export function Toolbar() {
  const { viewMode, setViewMode, sidebarVisible, toggleCommandPalette, toggleSidebar } = useUIStore()
  const { setAIPanelOpen } = useUIStore()

  return (
    <div
      className="flex items-center gap-0 px-2 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] select-none"
      style={{ height: 'var(--toolbar-height, 40px)' }}
      role="toolbar"
      aria-label="编辑工具栏"
      data-component="toolbar"
      data-tauri-drag-region
    >
      {/* Undo/Redo */}
      <ToolbarGroup>
        <ToolbarButton
          icon={<Undo2 size={14} />}
          tooltip="撤销"
          shortcut="Ctrl+Z"
          onClick={() => window.dispatchEvent(new CustomEvent('editor:undo'))}
        />
        <ToolbarButton
          icon={<Redo2 size={14} />}
          tooltip="重做"
          shortcut="Ctrl+Shift+Z"
          onClick={() => window.dispatchEvent(new CustomEvent('editor:redo'))}
        />
      </ToolbarGroup>

      {/* Headings */}
      <ToolbarGroup>
        <ToolbarButton icon={<Heading1 size={14} />} tooltip="标题 1" onClick={() => insertAtCursor('# ')} />
        <ToolbarButton icon={<Heading2 size={14} />} tooltip="标题 2" onClick={() => insertAtCursor('## ')} />
        <ToolbarButton icon={<Heading3 size={14} />} tooltip="标题 3" onClick={() => insertAtCursor('### ')} />
      </ToolbarGroup>

      {/* Text Format */}
      <ToolbarGroup>
        <ToolbarButton icon={<Bold size={14} />} tooltip="加粗" shortcut="Ctrl+B" onClick={() => insertAtCursor('**加粗**')} />
        <ToolbarButton icon={<Italic size={14} />} tooltip="斜体" shortcut="Ctrl+I" onClick={() => insertAtCursor('*斜体*')} />
        <ToolbarButton icon={<Strikethrough size={14} />} tooltip="删除线" onClick={() => insertAtCursor('~~删除~~')} />
      </ToolbarGroup>

      {/* Code */}
      <ToolbarGroup>
        <ToolbarButton icon={<Code size={14} />} tooltip="行内代码" onClick={() => insertAtCursor('`代码`')} />
        <ToolbarButton icon={<FileCode size={14} />} tooltip="代码块" onClick={() => insertAtCursor('```language\n\n```')} />
      </ToolbarGroup>

      {/* Link/Image */}
      <ToolbarGroup>
        <ToolbarButton icon={<Link size={14} />} tooltip="链接" shortcut="Ctrl+K" onClick={() => insertAtCursor('[文本](url)')} />
        <ToolbarButton icon={<Image size={14} />} tooltip="图片" onClick={() => insertAtCursor('![描述](url)')} />
      </ToolbarGroup>

      {/* Lists */}
      <ToolbarGroup>
        <ToolbarButton icon={<List size={14} />} tooltip="无序列表" onClick={() => insertAtCursor('- ')} />
        <ToolbarButton icon={<ListOrdered size={14} />} tooltip="有序列表" onClick={() => insertAtCursor('1. ')} />
        <ToolbarButton icon={<ListChecks size={14} />} tooltip="任务列表" onClick={() => insertAtCursor('- [ ] ')} />
      </ToolbarGroup>

      {/* Other */}
      <ToolbarGroup>
        <ToolbarButton icon={<Quote size={14} />} tooltip="引用" onClick={() => insertAtCursor('> ')} />
        <ToolbarButton icon={<Table size={14} />} tooltip="表格" onClick={() => insertAtCursor('| 列1 | 列2 |\n|------|------|\n| | |')} />
        <ToolbarButton icon={<Minus size={14} />} tooltip="水平线" onClick={() => insertAtCursor('\n---\n')} />
      </ToolbarGroup>

      {/* View Mode Switcher */}
      <ToolbarGroup>
        <ToolbarButton
          icon={<Columns2 size={14} />}
          tooltip="分栏"
          shortcut="Ctrl+Alt+3"
          active={viewMode === 'split'}
          onClick={() => setViewMode('split')}
        />
        <ToolbarButton
          icon={<PanelLeft size={14} />}
          tooltip="仅编辑器"
          shortcut="Ctrl+Alt+1"
          active={viewMode === 'editor-only'}
          onClick={() => setViewMode('editor-only')}
        />
        <ToolbarButton
          icon={<PanelRight size={14} />}
          tooltip="仅预览"
          shortcut="Ctrl+Alt+2"
          active={viewMode === 'preview-only'}
          onClick={() => setViewMode('preview-only')}
        />
      </ToolbarGroup>

      {/* Command Palette + Sidebar Toggle + AI - 右对齐 */}
      <div className="ml-auto flex items-center gap-0">
        <ToolbarButton
          icon={<Command size={14} />}
          tooltip="命令面板 (Ctrl+Shift+P)"
          onClick={toggleCommandPalette}
        />
        <ToolbarButton
          icon={<PanelLeft size={14} />}
          tooltip={sidebarVisible ? '隐藏侧边栏 (Ctrl+B)' : '显示侧边栏 (Ctrl+B)'}
          active={sidebarVisible}
          onClick={toggleSidebar}
        />
        <div className="w-px h-4 mx-1 bg-[var(--border-default)]" />
        <ToolbarButton
          icon={<Bot size={14} />}
          label="AI"
          tooltip="AI 助手"
          onClick={() => setAIPanelOpen(true)}
          accent
        />
      </div>
    </div>
  )
}
