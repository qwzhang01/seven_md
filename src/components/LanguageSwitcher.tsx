import { useTranslation } from 'react-i18next'
import { createLogger } from '../utils/logger'

const logger = createLogger('LanguageSwitcher')

const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const handleChange = async (langCode: string) => {
    try {
      await i18n.changeLanguage(langCode)
      logger.info('Language changed', { language: langCode })
    } catch (error) {
      logger.error('Failed to change language', { error: String(error) })
    }
  }

  return (
    <select
      value={i18n.language}
      onChange={(e) => handleChange(e.target.value)}
      className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
      aria-label="Select language"
    >
      {supportedLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  )
}
