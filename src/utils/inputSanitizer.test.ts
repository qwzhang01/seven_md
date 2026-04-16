import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  stripHtmlTags,
  filterHtmlTags,
  escapeHtml,
  unescapeHtml,
  sanitizeObject,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeEmail,
  stripScripts,
  hasDangerousContent,
} from './inputSanitizer'

describe('sanitizeString', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeString(null as any)).toBe('')
    expect(sanitizeString(undefined as any)).toBe('')
    expect(sanitizeString(123 as any)).toBe('')
  })

  it('trims whitespace by default', () => {
    expect(sanitizeString('  hello world  ')).toBe('hello world')
  })

  it('removes null bytes by default', () => {
    expect(sanitizeString('hello\0world')).toBe('helloworld')
  })

  it('strips HTML tags by default', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")')
    expect(sanitizeString('<b>bold</b>')).toBe('bold')
  })

  it('enforces max length', () => {
    const result = sanitizeString('a'.repeat(20000))
    expect(result.length).toBe(10000)
  })

  it('allows HTML when allowHtml is true', () => {
    const result = sanitizeString('<b>bold</b>', { allowHtml: true })
    expect(result).toBe('<b>bold</b>')
  })
})

describe('stripHtmlTags', () => {
  it('removes HTML tags', () => {
    expect(stripHtmlTags('<p>Hello</p>')).toBe('Hello')
    expect(stripHtmlTags('<div><span>nested</span></div>')).toBe('nested')
  })

  it('handles self-closing tags', () => {
    expect(stripHtmlTags('line1<br/>line2')).toBe('line1line2')
    expect(stripHtmlTags('<img src="test.jpg"/>')).toBe('')
  })

  it('unescapes HTML entities', () => {
    expect(stripHtmlTags('&lt;test&gt;')).toBe('<test>')
    expect(stripHtmlTags('&amp;')).toBe('&')
  })
})

describe('filterHtmlTags', () => {
  it('keeps allowed tags', () => {
    const result = filterHtmlTags('<b>bold</b> and <i>italic</i>', ['b'])
    expect(result).toBe('<b>bold</b> and italic')
  })

  it('removes disallowed tags', () => {
    const result = filterHtmlTags('<p><b>text</b></p>', ['b'])
    expect(result).toBe('<b>text</b>')
  })
})

describe('escapeHtml', () => {
  it('escapes HTML entities', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;')
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;')
    expect(escapeHtml("'single'")).toBe('&#39;single&#39;')
    expect(escapeHtml('a & b')).toBe('a &amp; b')
  })
})

describe('unescapeHtml', () => {
  it('unescapes HTML entities', () => {
    expect(unescapeHtml('&lt;div&gt;')).toBe('<div>')
    expect(unescapeHtml('&amp;')).toBe('&')
  })
})

describe('sanitizeObject', () => {
  it('sanitizes all string values in object', () => {
    const obj = {
      name: '  <b>John</b>  ',
      age: 30,
      nested: {
        value: '<script>alert(1)</script>',
      },
    }

    const result = sanitizeObject(obj)
    expect(result.name).toBe('John')
    expect(result.age).toBe(30)
    expect(result.nested.value).toBe('alert(1)')
  })

  it('handles null values', () => {
    const obj = { name: 'test', value: null }
    const result = sanitizeObject(obj)
    expect(result.value).toBeNull()
  })
})

describe('sanitizeUrl', () => {
  it('allows safe schemes', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com')
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com')
  })

  it('allows relative URLs', () => {
    expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page')
    expect(sanitizeUrl('./relative')).toBe('./relative')
  })

  it('allows anchor links', () => {
    expect(sanitizeUrl('#section')).toBe('#section')
  })

  it('blocks dangerous schemes', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeUrl('data:text/html,<script>')).toBe('')
    expect(sanitizeUrl('vbscript:msgbox')).toBe('')
  })
})

describe('sanitizeFilename', () => {
  it('removes path separators', () => {
    expect(sanitizeFilename('path/to/file.md')).toBe('path_to_file.md')
    expect(sanitizeFilename('path\\to\\file.md')).toBe('path_to_file.md')
  })

  it('replaces invalid characters with underscore', () => {
    const result = sanitizeFilename('file<>:"|?*.md')
    // Each invalid char is replaced with _
    expect(result).toMatch(/^file_+\.md$/)
  })

  it('removes control characters', () => {
    expect(sanitizeFilename('file\x00\x1f.md')).toBe('file.md')
  })

  it('limits filename length', () => {
    const longName = 'a'.repeat(300) + '.md'
    const result = sanitizeFilename(longName)
    expect(result.length).toBeLessThanOrEqual(255)
  })

  it('returns "unnamed" for empty input', () => {
    expect(sanitizeFilename('')).toBe('unnamed')
    expect(sanitizeFilename('   ')).toBe('unnamed')
  })
})

describe('sanitizeEmail', () => {
  it('normalizes email to lowercase', () => {
    expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com')
  })

  it('trims whitespace', () => {
    expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com')
  })

  it('returns empty for invalid email', () => {
    expect(sanitizeEmail('invalid')).toBe('')
    expect(sanitizeEmail('test@')).toBe('')
    expect(sanitizeEmail('@example.com')).toBe('')
  })
})

describe('stripScripts', () => {
  it('removes script tags and content', () => {
    expect(stripScripts('<script>alert(1)</script>')).toBe('')
    expect(stripScripts('before<script>alert(1)</script>after')).toBe('beforeafter')
  })

  it('removes event handlers', () => {
    expect(stripScripts('<div onclick="alert(1)">')).toBe('<div >')
    expect(stripScripts("<div onerror='alert(1)'>")).toBe('<div >')
  })

  it('removes javascript: URLs', () => {
    const result = stripScripts('<a href="javascript:alert(1)">')
    expect(result).not.toContain('javascript:')
  })
})

describe('hasDangerousContent', () => {
  it('detects script tags', () => {
    expect(hasDangerousContent('<script>alert(1)</script>')).toBe(true)
  })

  it('detects javascript: URLs', () => {
    expect(hasDangerousContent('javascript:alert(1)')).toBe(true)
  })

  it('detects event handlers', () => {
    expect(hasDangerousContent('<div onclick="alert(1)">')).toBe(true)
  })

  it('detects iframe/object/embed tags', () => {
    expect(hasDangerousContent('<iframe src="evil.com">')).toBe(true)
    expect(hasDangerousContent('<object data="evil.swf">')).toBe(true)
    expect(hasDangerousContent('<embed src="evil.swf">')).toBe(true)
  })

  it('returns false for safe content', () => {
    expect(hasDangerousContent('<p>Hello World</p>')).toBe(false)
    expect(hasDangerousContent('Plain text')).toBe(false)
  })
})
