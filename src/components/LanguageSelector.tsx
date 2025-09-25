import { useLanguage } from '../useLanguage'
import type { Language } from '../translations'

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  return (
    <label className="relative">
      <span className="sr-only">Language</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        aria-label="Language"
        className="ring-focus h-10 rounded-full border border-white/10 bg-white/10 px-4 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/20"
      >
        <option value="ca">Català</option>
        <option value="es">Español</option>
      </select>
    </label>
  )
}


