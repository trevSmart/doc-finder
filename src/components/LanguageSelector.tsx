import { useLanguage } from '../useLanguage'
import type { Language } from '../translations'

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      aria-label="Language"
    >
      <option value="ca">Català</option>
      <option value="es">Español</option>
    </select>
  )
}


