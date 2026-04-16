import { describe, it, expect } from 'vitest'
import {
  validatePath,
  validateFileExtension,
  isWithinAllowedDir,
  validateFilename,
  getFileExtension,
  isSuspiciousPath,
} from './pathValidator'

describe('validatePath', () => {
  describe('basic validation', () => {
    it('accepts valid paths', () => {
      const result = validatePath('/users/test/file.md')
      expect(result.isValid).toBe(true)
      expect(result.sanitizedPath).toBe('users/test/file.md')
    })

    it('rejects empty path', () => {
      const result = validatePath('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('rejects null/undefined', () => {
      expect(validatePath(null as any).isValid).toBe(false)
      expect(validatePath(undefined as any).isValid).toBe(false)
    })

    it('trims whitespace', () => {
      const result = validatePath('  /test/file.md  ')
      expect(result.isValid).toBe(true)
      expect(result.sanitizedPath).toBe('test/file.md')
    })
  })

  describe('path traversal prevention', () => {
    it('rejects ../ patterns', () => {
      expect(validatePath('../../../etc/passwd').isValid).toBe(false)
      expect(validatePath('test/../../../etc/passwd').isValid).toBe(false)
    })

    it('rejects ..\\ patterns', () => {
      expect(validatePath('..\\..\\windows\\system32').isValid).toBe(false)
    })

    it('rejects mixed separators in traversal', () => {
      expect(validatePath('test/..\\../etc/passwd').isValid).toBe(false)
    })
  })

  describe('null byte injection', () => {
    it('rejects null bytes', () => {
      expect(validatePath('/test/file\0.md').isValid).toBe(false)
    })
  })

  describe('dangerous characters', () => {
    it('removes < > | : * ? " characters', () => {
      const result = validatePath('test<file>.md')
      expect(result.isValid).toBe(true)
      expect(result.sanitizedPath).toBe('testfile.md')
    })
  })

  describe('path normalization', () => {
    it('converts backslashes to forward slashes', () => {
      const result = validatePath('test\\folder\\file.md')
      expect(result.sanitizedPath).toBe('test/folder/file.md')
    })

    it('removes duplicate slashes', () => {
      const result = validatePath('test//folder///file.md')
      expect(result.sanitizedPath).toBe('test/folder/file.md')
    })

    it('removes leading/trailing slashes', () => {
      const result = validatePath('///test/folder///')
      expect(result.sanitizedPath).toBe('test/folder')
    })
  })
})

describe('validateFileExtension', () => {
  it('accepts allowed extensions', () => {
    const result = validateFileExtension('test.md', ['.md', '.txt'])
    expect(result.isValid).toBe(true)
  })

  it('accepts extensions without leading dot', () => {
    const result = validateFileExtension('test.md', ['md', 'txt'])
    expect(result.isValid).toBe(true)
  })

  it('rejects disallowed extensions', () => {
    const result = validateFileExtension('test.exe', ['.md', '.txt'])
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('.exe')
  })

  it('rejects files with disallowed extension', () => {
    const result = validateFileExtension('README', ['.md'])
    expect(result.isValid).toBe(false)
  })

  it('is case insensitive', () => {
    const result = validateFileExtension('test.MD', ['.md'])
    expect(result.isValid).toBe(true)
  })
})

describe('isWithinAllowedDir', () => {
  it('returns true for paths within allowed dir', () => {
    expect(isWithinAllowedDir('/home/user/docs/file.md', ['/home/user/docs'])).toBe(true)
  })

  it('returns false for paths outside allowed dir', () => {
    expect(isWithinAllowedDir('/etc/passwd', ['/home/user/docs'])).toBe(false)
  })

  it('handles multiple allowed dirs', () => {
    expect(
      isWithinAllowedDir('/home/user/docs/file.md', ['/home/user/images', '/home/user/docs'])
    ).toBe(true)
    expect(
      isWithinAllowedDir('/home/user/images/photo.jpg', ['/home/user/images', '/home/user/docs'])
    ).toBe(true)
  })

  it('is case insensitive', () => {
    expect(isWithinAllowedDir('/HOME/USER/DOCS/file.md', ['/home/user/docs'])).toBe(true)
  })

  it('normalizes path separators', () => {
    expect(isWithinAllowedDir('C:\\Users\\test\\file.md', ['C:/Users/test'])).toBe(true)
  })
})

describe('validateFilename', () => {
  it('accepts valid filenames', () => {
    const result = validateFilename('document.md')
    expect(result.isValid).toBe(true)
  })

  it('rejects empty filename', () => {
    expect(validateFilename('').isValid).toBe(false)
  })

  it('rejects reserved Windows names', () => {
    expect(validateFilename('CON').isValid).toBe(false)
    expect(validateFilename('PRN').isValid).toBe(false)
    expect(validateFilename('AUX').isValid).toBe(false)
    expect(validateFilename('NUL').isValid).toBe(false)
    expect(validateFilename('COM1').isValid).toBe(false)
    expect(validateFilename('LPT1').isValid).toBe(false)
  })

  it('rejects reserved names with extensions', () => {
    expect(validateFilename('CON.txt').isValid).toBe(false)
    expect(validateFilename('NUL.md').isValid).toBe(false)
  })

  it('rejects invalid characters', () => {
    expect(validateFilename('file<name>.md').isValid).toBe(false)
    expect(validateFilename('file|name.md').isValid).toBe(false)
    expect(validateFilename('file:name.md').isValid).toBe(false)
  })

  it('rejects filenames that are only dots', () => {
    expect(validateFilename('.').isValid).toBe(false)
    expect(validateFilename('..').isValid).toBe(false)
    expect(validateFilename('...').isValid).toBe(false)
  })

  it('rejects filenames over 255 characters', () => {
    const longName = 'a'.repeat(256) + '.md'
    expect(validateFilename(longName).isValid).toBe(false)
  })

  it('accepts filenames with 255 characters', () => {
    const longName = 'a'.repeat(251) + '.md'
    expect(validateFilename(longName).isValid).toBe(true)
  })
})

describe('getFileExtension', () => {
  it('extracts extension correctly', () => {
    expect(getFileExtension('document.md')).toBe('md')
    expect(getFileExtension('file.TXT')).toBe('txt')
    expect(getFileExtension('/path/to/file.jpeg')).toBe('jpeg')
  })

  it('returns empty string for no extension', () => {
    expect(getFileExtension('README')).toBe('')
    expect(getFileExtension('/path/to/file')).toBe('')
  })

  it('handles multiple dots', () => {
    expect(getFileExtension('file.test.md')).toBe('md')
    expect(getFileExtension('archive.tar.gz')).toBe('gz')
  })
})

describe('isSuspiciousPath', () => {
  it('detects path traversal', () => {
    expect(isSuspiciousPath('../../../etc/passwd')).toBe(true)
    expect(isSuspiciousPath('..\\..\\windows')).toBe(true)
  })

  it('detects URL encoded traversal', () => {
    expect(isSuspiciousPath('%2e%2e/etc/passwd')).toBe(true)
    expect(isSuspiciousPath('%252e%252e/etc/passwd')).toBe(true)
  })

  it('detects null bytes', () => {
    expect(isSuspiciousPath('/test/file\0.md')).toBe(true)
  })

  it('detects system file access', () => {
    expect(isSuspiciousPath('/etc/passwd')).toBe(true)
    expect(isSuspiciousPath('/etc/shadow')).toBe(true)
    expect(isSuspiciousPath('/proc/self/environ')).toBe(true)
    expect(isSuspiciousPath('C:\\Windows\\System32')).toBe(true)
  })

  it('returns false for normal paths', () => {
    expect(isSuspiciousPath('/home/user/documents/file.md')).toBe(false)
    expect(isSuspiciousPath('C:\\Users\\test\\Documents\\file.md')).toBe(false)
  })
})
