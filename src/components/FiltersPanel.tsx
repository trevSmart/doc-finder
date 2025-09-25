import type { ReactNode } from 'react'
import type { FiltersState, ViewMode } from '../types'
import { useTranslation } from '../useTranslation'

export interface FiltersPanelProps {
  filters: FiltersState
  onFilterChange: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void
  objects: string[]
  integrations: string[]
  categories: string[]
  mechanisms: string[]
  tags: string[]
  total: number
  filtered: number
  onViewChange: (view: ViewMode) => void
}

type SelectableFilterKey = 'category' | 'mechanism' | 'object' | 'integration' | 'tag'

export function FiltersPanel(props: FiltersPanelProps) {
  const {
    filters,
    onFilterChange,
    objects,
    integrations,
    categories,
    mechanisms,
    tags,
    total,
    filtered,
    onViewChange,
  } = props
  const { t } = useTranslation()

  const cleanLabel = (label: string) => label.replace(/:$/, '')

  const selectConfigs: {
    key: SelectableFilterKey
    label: string
    placeholder: string
    options: string[]
  }[] = [
    { key: 'category', label: cleanLabel(t('category')), placeholder: t('allCategories'), options: categories },
    { key: 'mechanism', label: cleanLabel(t('mechanism')), placeholder: t('allMechanisms'), options: mechanisms },
    { key: 'object', label: cleanLabel(t('objects')), placeholder: t('allObjects'), options: objects },
    { key: 'integration', label: cleanLabel(t('integrations')), placeholder: t('allIntegrations'), options: integrations },
    { key: 'tag', label: t('tagsFilter'), placeholder: t('allTags'), options: tags },
  ]

  const handleSelectChange = <K extends SelectableFilterKey>(key: K, value: string) => {
    onFilterChange(key, value as FiltersState[K])
  }

  const viewModes: { label: string; value: ViewMode; icon: ReactNode }[] = [
    {
      label: t('gridView'),
      value: 'grid',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4">
          <rect x="3" y="3" width="5" height="5" rx="1.2" />
          <rect x="12" y="3" width="5" height="5" rx="1.2" />
          <rect x="3" y="12" width="5" height="5" rx="1.2" />
          <rect x="12" y="12" width="5" height="5" rx="1.2" />
        </svg>
      ),
    },
    {
      label: t('listView'),
      value: 'list',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4">
          <path strokeLinecap="round" d="M4 6h12M4 10h12M4 14h12" />
        </svg>
      ),
    },
  ]

  return (
    <section className="glass-panel space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/60">
            <span className="text-2xl font-semibold text-white">{filtered}</span>{' '}
            {t('resultsCount')}{' '}
            <span className="text-sm text-white/50">{total}</span>
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            {t('businessProcesses')}
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1">
          {viewModes.map((mode) => {
            const isActive = filters.view === mode.value
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => onViewChange(mode.value)}
                className={`ring-focus inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
                  isActive
                    ? 'bg-white text-slate-900 shadow'
                    : 'text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {selectConfigs.map((config) => (
          <label key={config.key} className="space-y-2 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">{config.label}</span>
            <select
              value={filters[config.key]}
              onChange={(event) => handleSelectChange(config.key, event.target.value)}
              className="ring-focus h-12 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm text-white/80 transition hover:border-white/20 hover:bg-slate-900/60"
            >
              <option value="">{config.placeholder}</option>
              {config.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {filtered === 0 && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-medium text-amber-50">{t('noResults')}</p>
          <p className="mt-1 text-amber-100/80">{t('noResultsDescription')}</p>
        </div>
      )}
    </section>
  )
}


