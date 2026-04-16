import { 
  FileText, 
  Folder, 
  FolderOpen, 
  Image, 
  FileCode, 
  FileJson,
  FileSpreadsheet,
  File,
  type LucideIcon
} from 'lucide-react'

export interface FileIconConfig {
  icon: LucideIcon
  color: string
  darkColor?: string
}

/**
 * Get file icon based on file type/extension
 */
export function getFileIcon(filename: string, isDirectory: boolean, isExpanded: boolean): FileIconConfig {
  // Directory
  if (isDirectory) {
    return {
      icon: isExpanded ? FolderOpen : Folder,
      color: 'text-blue-500',
      darkColor: 'text-blue-400'
    }
  }

  // Get file extension
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  // Image files
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp']
  if (imageExts.includes(ext)) {
    return {
      icon: Image,
      color: 'text-green-500',
      darkColor: 'text-green-400'
    }
  }

  // Code files
  const codeExts = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'go', 'rs', 'rb', 'php']
  if (codeExts.includes(ext)) {
    return {
      icon: FileCode,
      color: 'text-purple-500',
      darkColor: 'text-purple-400'
    }
  }

  // JSON files
  if (ext === 'json') {
    return {
      icon: FileJson,
      color: 'text-yellow-600',
      darkColor: 'text-yellow-500'
    }
  }

  // Spreadsheet files
  const spreadsheetExts = ['csv', 'xls', 'xlsx']
  if (spreadsheetExts.includes(ext)) {
    return {
      icon: FileSpreadsheet,
      color: 'text-green-600',
      darkColor: 'text-green-500'
    }
  }

  // Markdown files
  if (ext === 'md' || ext === 'markdown') {
    return {
      icon: FileText,
      color: 'text-gray-600',
      darkColor: 'text-gray-400'
    }
  }

  // Default file icon
  return {
    icon: File,
    color: 'text-gray-500',
    darkColor: 'text-gray-400'
  }
}

/**
 * Get icon size based on context
 */
export function getIconSize(context: 'tree' | 'breadcrumb' | 'tab' = 'tree'): number {
  switch (context) {
    case 'tree':
      return 16
    case 'breadcrumb':
      return 14
    case 'tab':
      return 16
    default:
      return 16
  }
}
