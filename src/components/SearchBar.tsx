import { useTranslation } from '../useTranslation'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const { t } = useTranslation()

  return (
    <div className="glass-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="relative flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 shadow-inner">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-5 w-5 text-white/50"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A6.65 6.65 0 1 0 6.3 6.3a6.65 6.65 0 0 0 10.35 10.35z"
          />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t('searchPlaceholder')}
          className="ring-focus h-10 w-full bg-transparent text-sm text-white placeholder:text-white/40"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="ring-focus inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
            aria-label={t('close')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-white/50">
        <span className="hidden sm:inline">⌘K</span>
        <span>{t('searchDocuments')}</span>
      </div>
    </div>
  )
}


