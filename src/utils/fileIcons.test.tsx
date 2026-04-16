import { describe, it, expect } from 'vitest'
import { getFileIcon } from './fileIcons'

describe('getFileIcon', () => {
  describe('directory icons', () => {
    it('returns folder icon for collapsed directory', () => {
      const result = getFileIcon('test-folder', true, false)
      expect(result.color).toBe('text-blue-500')
    })

    it('returns folder-open icon for expanded directory', () => {
      const result = getFileIcon('test-folder', true, true)
      expect(result.color).toBe('text-blue-500')
    })
  })

  describe('image files', () => {
    it('returns image icon for .png files', () => {
      const result = getFileIcon('image.png', false, false)
      expect(result.color).toBe('text-green-500')
    })

    it('returns image icon for .jpg files', () => {
      const result = getFileIcon('photo.jpg', false, false)
      expect(result.color).toBe('text-green-500')
    })

    it('returns image icon for .svg files', () => {
      const result = getFileIcon('logo.svg', false, false)
      expect(result.color).toBe('text-green-500')
    })

    it('returns image icon for .gif files', () => {
      const result = getFileIcon('animation.gif', false, false)
      expect(result.color).toBe('text-green-500')
    })

    it('returns image icon for .webp files', () => {
      const result = getFileIcon('image.webp', false, false)
      expect(result.color).toBe('text-green-500')
    })
  })

  describe('code files', () => {
    it('returns code icon for .js files', () => {
      const result = getFileIcon('script.js', false, false)
      expect(result.color).toBe('text-purple-500')
    })

    it('returns code icon for .ts files', () => {
      const result = getFileIcon('module.ts', false, false)
      expect(result.color).toBe('text-purple-500')
    })

    it('returns code icon for .tsx files', () => {
      const result = getFileIcon('component.tsx', false, false)
      expect(result.color).toBe('text-purple-500')
    })

    it('returns code icon for .py files', () => {
      const result = getFileIcon('script.py', false, false)
      expect(result.color).toBe('text-purple-500')
    })

    it('returns code icon for .go files', () => {
      const result = getFileIcon('main.go', false, false)
      expect(result.color).toBe('text-purple-500')
    })

    it('returns code icon for .rs files', () => {
      const result = getFileIcon('main.rs', false, false)
      expect(result.color).toBe('text-purple-500')
    })
  })

  describe('JSON files', () => {
    it('returns json icon for .json files', () => {
      const result = getFileIcon('config.json', false, false)
      expect(result.color).toBe('text-yellow-600')
    })
  })

  describe('spreadsheet files', () => {
    it('returns spreadsheet icon for .csv files', () => {
      const result = getFileIcon('data.csv', false, false)
      expect(result.color).toBe('text-green-600')
    })

    it('returns spreadsheet icon for .xlsx files', () => {
      const result = getFileIcon('report.xlsx', false, false)
      expect(result.color).toBe('text-green-600')
    })
  })

  describe('markdown files', () => {
    it('returns file-text icon for .md files', () => {
      const result = getFileIcon('README.md', false, false)
      expect(result.color).toBe('text-gray-600')
    })

    it('returns file-text icon for .markdown files', () => {
      const result = getFileIcon('doc.markdown', false, false)
      expect(result.color).toBe('text-gray-600')
    })
  })

  describe('unknown files', () => {
    it('returns default file icon for unknown extensions', () => {
      const result = getFileIcon('unknown.xyz', false, false)
      expect(result.color).toBe('text-gray-500')
    })

    it('returns default file icon for files without extension', () => {
      const result = getFileIcon('README', false, false)
      expect(result.color).toBe('text-gray-500')
    })
  })

  describe('case insensitivity', () => {
    it('handles uppercase extensions', () => {
      const result = getFileIcon('IMAGE.PNG', false, false)
      expect(result.color).toBe('text-green-500')
    })

    it('handles mixed case extensions', () => {
      const result = getFileIcon('Script.Js', false, false)
      expect(result.color).toBe('text-purple-500')
    })
  })
})
