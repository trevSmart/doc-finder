import { useLanguage } from './LanguageContext'
import { getTranslation, type Translations } from './translations'

export function useTranslation() {
  const { language } = useLanguage()

  const t = (key: keyof Translations): string => {
    return getTranslation(language, key)
  }

  return { t, language }
}
