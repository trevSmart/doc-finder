import { useTranslation } from '../useTranslation'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const { t } = useTranslation()

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0a7 7 0 10-9.9-9.9 7 7 0 009.9 9.9z" />
        </svg>
        <input
          id="searchInput"
          className="search-input"
          type="search"
          placeholder={t('searchPlaceholder')}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {value && (
          <button type="button" className="clear-search" onClick={onClear} aria-label="Neteja la cerca">
            &times;
          </button>
        )}
      </div>
    </div>
  )
}
