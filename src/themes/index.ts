import type { ThemeId } from '../stores/useThemeStore'

export interface ThemeDefinition {
  id: ThemeId
  name: string
  icon: string
  description: string
  isDark: boolean
  colors: {
    background: {
      primary: string
      secondary: string
      tertiary: string
      hover: string
      active: string
    }
    text: {
      primary: string
      secondary: string
      disabled: string
      accent: string
      link: string
    }
    border: {
      default: string
      active: string
    }
    success: string
    warning: string
    error: string
    info: string
  }
  editor: {
    background: string
    foreground: string
    lineHighlight: string
    selection: string
    gutterBackground: string
    gutterForeground: string
    cursor: string
  }
  syntax: {
    heading: string
    heading2: string
    heading3: string
    heading4: string
    bold: string
    italic: string
    strikethrough: string
    code: string
    codeBackground: string
    link: string
    quote: string
    quoteBorder: string
    list: string
    hr: string
    taskComplete: string
    taskIncomplete: string
  }
}

export const darkTheme: ThemeDefinition = {
  id: 'dark',
  name: '深色模式',
  icon: '🌙',
  description: '默认深色主题',
  isDark: true,
  colors: {
    background: { primary: '#1e1e1e', secondary: '#252526', tertiary: '#2d2d30', hover: '#2a2d2e', active: '#094771' },
    text: { primary: '#cccccc', secondary: '#858585', disabled: '#5a5a5a', accent: '#007acc', link: '#3794ff' },
    border: { default: '#3c3c3c', active: '#007acc' },
    success: '#4ec9b0', warning: '#dcdcaa', error: '#f14c4c', info: '#3794ff',
  },
  editor: {
    background: '#1e1e1e', foreground: '#d4d4d4', lineHighlight: '#2a2d2e',
    selection: '#264f78', gutterBackground: '#1e1e1e', gutterForeground: '#858585', cursor: '#aeafad',
  },
  syntax: {
    heading: '#569cd6', heading2: '#6a9955', heading3: '#c586c0', heading4: '#9cdcfe',
    bold: '#569cd6', italic: '#569cd6', strikethrough: '#858585',
    code: '#ce9178', codeBackground: '#2d2d30', link: '#3794ff',
    quote: '#6a9955', quoteBorder: '#6a9955', list: '#569cd6',
    hr: '#3c3c3c', taskComplete: '#4ec9b0', taskIncomplete: '#858585',
  },
}

export const lightTheme: ThemeDefinition = {
  id: 'light',
  name: '浅色模式',
  icon: '☀️',
  description: '浅色背景主题',
  isDark: false,
  colors: {
    background: { primary: '#ffffff', secondary: '#f3f4f6', tertiary: '#e5e7eb', hover: '#e5e7eb', active: '#cce8ff' },
    text: { primary: '#1f2937', secondary: '#6b7280', disabled: '#9ca3af', accent: '#0066cc', link: '#0066cc' },
    border: { default: '#d1d5db', active: '#0066cc' },
    success: '#059669', warning: '#d97706', error: '#dc2626', info: '#2563eb',
  },
  editor: {
    background: '#ffffff', foreground: '#1f2937', lineHighlight: '#f3f4f6',
    selection: '#add6ff', gutterBackground: '#ffffff', gutterForeground: '#6b7280', cursor: '#1f2937',
  },
  syntax: {
    heading: '#0066cc', heading2: '#059669', heading3: '#9333ea', heading4: '#6b7280',
    bold: '#0066cc', italic: '#0066cc', strikethrough: '#6b7280',
    code: '#c7254e', codeBackground: '#f9f2f4', link: '#0066cc',
    quote: '#059669', quoteBorder: '#059669', list: '#0066cc',
    hr: '#d1d5db', taskComplete: '#059669', taskIncomplete: '#6b7280',
  },
}

export const monokaiTheme: ThemeDefinition = {
  id: 'monokai',
  name: 'Monokai',
  icon: '🎨',
  description: '经典 Sublime 配色',
  isDark: true,
  colors: {
    background: { primary: '#272822', secondary: '#1e1f1c', tertiary: '#3e3d32', hover: '#3e3d32', active: '#49483e' },
    text: { primary: '#f8f8f2', secondary: '#75715e', disabled: '#5a5a5a', accent: '#a6e22e', link: '#66d9ef' },
    border: { default: '#49483e', active: '#a6e22e' },
    success: '#a6e22e', warning: '#e6db74', error: '#f92672', info: '#66d9ef',
  },
  editor: {
    background: '#272822', foreground: '#f8f8f2', lineHighlight: '#3e3d32',
    selection: '#49483e', gutterBackground: '#272822', gutterForeground: '#75715e', cursor: '#f8f8f0',
  },
  syntax: {
    heading: '#a6e22e', heading2: '#66d9ef', heading3: '#fd971f', heading4: '#75715e',
    bold: '#a6e22e', italic: '#a6e22e', strikethrough: '#75715e',
    code: '#e6db74', codeBackground: '#3e3d32', link: '#66d9ef',
    quote: '#75715e', quoteBorder: '#75715e', list: '#a6e22e',
    hr: '#49483e', taskComplete: '#a6e22e', taskIncomplete: '#75715e',
  },
}

export const solarizedTheme: ThemeDefinition = {
  id: 'solarized',
  name: 'Solarized',
  icon: '🎨',
  description: '暖色调 Solarized 配色',
  isDark: true,
  colors: {
    background: { primary: '#002b36', secondary: '#073642', tertiary: '#0a4050', hover: '#073642', active: '#073642' },
    text: { primary: '#839496', secondary: '#586e75', disabled: '#47564f', accent: '#268bd2', link: '#268bd2' },
    border: { default: '#073642', active: '#268bd2' },
    success: '#859900', warning: '#b58900', error: '#dc322f', info: '#268bd2',
  },
  editor: {
    background: '#002b36', foreground: '#839496', lineHighlight: '#073642',
    selection: '#073642', gutterBackground: '#002b36', gutterForeground: '#586e75', cursor: '#839496',
  },
  syntax: {
    heading: '#268bd2', heading2: '#859900', heading3: '#cb4b16', heading4: '#586e75',
    bold: '#268bd2', italic: '#268bd2', strikethrough: '#586e75',
    code: '#2aa198', codeBackground: '#073642', link: '#268bd2',
    quote: '#586e75', quoteBorder: '#586e75', list: '#268bd2',
    hr: '#073642', taskComplete: '#859900', taskIncomplete: '#586e75',
  },
}

export const nordTheme: ThemeDefinition = {
  id: 'nord',
  name: 'Nord',
  icon: '🎨',
  description: '冷色调 Nord 配色',
  isDark: true,
  colors: {
    background: { primary: '#2e3440', secondary: '#3b4252', tertiary: '#434c5e', hover: '#3b4252', active: '#434c5e' },
    text: { primary: '#d8dee9', secondary: '#81a1c1', disabled: '#4c566a', accent: '#88c0d0', link: '#88c0d0' },
    border: { default: '#3b4252', active: '#88c0d0' },
    success: '#a3be8c', warning: '#ebcb8b', error: '#bf616a', info: '#81a1c1',
  },
  editor: {
    background: '#2e3440', foreground: '#d8dee9', lineHighlight: '#3b4252',
    selection: '#434c5e', gutterBackground: '#2e3440', gutterForeground: '#4c566a', cursor: '#d8dee9',
  },
  syntax: {
    heading: '#88c0d0', heading2: '#81a1c1', heading3: '#b48ead', heading4: '#4c566a',
    bold: '#88c0d0', italic: '#88c0d0', strikethrough: '#4c566a',
    code: '#a3be8c', codeBackground: '#3b4252', link: '#88c0d0',
    quote: '#616e88', quoteBorder: '#616e88', list: '#81a1c1',
    hr: '#3b4252', taskComplete: '#a3be8c', taskIncomplete: '#4c566a',
  },
}

export const draculaTheme: ThemeDefinition = {
  id: 'dracula',
  name: 'Dracula',
  icon: '🎨',
  description: '紫色调 Dracula 配色',
  isDark: true,
  colors: {
    background: { primary: '#282a36', secondary: '#21222c', tertiary: '#343746', hover: '#343746', active: '#44475a' },
    text: { primary: '#f8f8f2', secondary: '#6272a4', disabled: '#44506c', accent: '#bd93f9', link: '#8be9fd' },
    border: { default: '#44475a', active: '#bd93f9' },
    success: '#50fa7b', warning: '#f1fa8c', error: '#ff5555', info: '#8be9fd',
  },
  editor: {
    background: '#282a36', foreground: '#f8f8f2', lineHighlight: '#44475a',
    selection: '#44475a', gutterBackground: '#282a36', gutterForeground: '#6272a4', cursor: '#f8f8f2',
  },
  syntax: {
    heading: '#bd93f9', heading2: '#8be9fd', heading3: '#ff79c6', heading4: '#6272a4',
    bold: '#bd93f9', italic: '#bd93f9', strikethrough: '#6272a4',
    code: '#f1fa8c', codeBackground: '#343746', link: '#8be9fd',
    quote: '#6272a4', quoteBorder: '#6272a4', list: '#bd93f9',
    hr: '#44475a', taskComplete: '#50fa7b', taskIncomplete: '#6272a4',
  },
}

export const githubTheme: ThemeDefinition = {
  id: 'github',
  name: 'GitHub',
  icon: '🎨',
  description: 'GitHub 风格浅色主题',
  isDark: false,
  colors: {
    background: { primary: '#ffffff', secondary: '#f6f8fa', tertiary: '#e1e4e8', hover: '#f3f4f6', active: '#cce8ff' },
    text: { primary: '#24292e', secondary: '#586069', disabled: '#959da5', accent: '#0366d6', link: '#0366d6' },
    border: { default: '#e1e4e8', active: '#0366d6' },
    success: '#28a745', warning: '#dbab09', error: '#d73a49', info: '#0366d6',
  },
  editor: {
    background: '#ffffff', foreground: '#24292e', lineHighlight: '#f6f8fa',
    selection: '#c8e1ff', gutterBackground: '#ffffff', gutterForeground: '#959da5', cursor: '#24292e',
  },
  syntax: {
    heading: '#005cc5', heading2: '#059669', heading3: '#6f42c1', heading4: '#586069',
    bold: '#005cc5', italic: '#005cc5', strikethrough: '#586069',
    code: '#d73a49', codeBackground: '#eff1f3', link: '#0366d6',
    quote: '#6a737d', quoteBorder: '#6a737d', list: '#005cc5',
    hr: '#e1e4e8', taskComplete: '#28a745', taskIncomplete: '#586069',
  },
}

export const allThemes: ThemeDefinition[] = [
  darkTheme, lightTheme, monokaiTheme, solarizedTheme, nordTheme, draculaTheme, githubTheme,
]

export function getThemeById(id: ThemeId): ThemeDefinition {
  return allThemes.find((t) => t.id === id) ?? darkTheme
}
