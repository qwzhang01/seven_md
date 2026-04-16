import { describe, it, expect } from 'vitest'

describe('i18n configuration', () => {
  it('has language definitions', async () => {
    // Import the module to check it compiles
    const config = await import('./config')
    expect(config.languages).toBeDefined()
  })

  it('has English and Chinese languages', async () => {
    const config = await import('./config')
    expect(config.languages.some((l: { code: string }) => l.code === 'en')).toBe(true)
    expect(config.languages.some((l: { code: string }) => l.code === 'zh')).toBe(true)
  })

  it('exports helper functions', async () => {
    const config = await import('./config')
    expect(typeof config.t).toBe('function')
    expect(typeof config.changeLanguage).toBe('function')
    expect(typeof config.getCurrentLanguage).toBe('function')
  })
})
