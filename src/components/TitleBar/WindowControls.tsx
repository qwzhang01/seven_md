import { X, Minus, Square } from 'lucide-react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useState } from 'react'

export function CloseButton() {
  const [isHovered, setIsHovered] = useState(false)
  
  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await getCurrentWindow().close()
  }

  return (
    <button
      onClick={handleClose}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
      aria-label="Close"
    >
      {isHovered && <X className="w-2 h-2 text-red-900" />}
    </button>
  )
}

export function MinimizeButton() {
  const [isHovered, setIsHovered] = useState(false)
  
  const handleMinimize = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await getCurrentWindow().minimize()
  }

  return (
    <button
      onClick={handleMinimize}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center transition-colors"
      aria-label="Minimize"
    >
      {isHovered && <Minus className="w-2 h-2 text-yellow-900" />}
    </button>
  )
}

export function MaximizeButton() {
  const [isHovered, setIsHovered] = useState(false)
  
  const handleMaximize = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const win = getCurrentWindow()
    const isMaximized = await win.isMaximized()
    if (isMaximized) {
      await win.unmaximize()
    } else {
      await win.maximize()
    }
  }

  return (
    <button
      onClick={handleMaximize}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
      aria-label="Maximize"
    >
      {isHovered && <Square className="w-2 h-2 text-green-900" />}
    </button>
  )
}
