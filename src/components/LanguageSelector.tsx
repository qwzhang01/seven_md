import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'
import { createLogger } from '../utils/logger'

const logger = createLogger('LanguageSelector')

interface Language {
  code: string
  name: string
  nativeName: string
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
]

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0]

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode)
      // Persist language preference to localStorage
      localStorage.setItem('i18nextLng', languageCode)
      logger.info('Language changed', { language: languageCode })
      setIsOpen(false)
    } catch (error) {
      logger.error('Failed to change language', { error: String(error), language: languageCode })
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
        aria-label={`Current language: ${currentLanguage.name}. Click to change language.`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={14} aria-hidden="true" />
        <span>{currentLanguage.nativeName}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 py-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
          role="listbox"
          aria-label="Select language"
        >
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                i18n.language === language.code ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}
              role="option"
              aria-selected={i18n.language === language.code}
            >
              <span>
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
                  ({language.name})
                </span>
              </span>
              {i18n.language === language.code && (
                <Check size={14} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
