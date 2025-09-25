import { useLanguage } from '../LanguageContext'

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="language-selector">
      <label htmlFor="language-select" className="language-label">
        🌐
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'ca' | 'es')}
        className="language-select"
        aria-label="Seleccionar idioma"
      >
        <option value="ca">Català</option>
        <option value="es">Español</option>
      </select>
    </div>
  )
}
