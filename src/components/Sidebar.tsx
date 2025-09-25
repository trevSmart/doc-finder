import type { FiltersState } from '../types'
import { useTranslation } from '../useTranslation'

export interface SidebarProps {
  categories: string[]
  mechanisms: string[]
  objects: string[]
  integrations: string[]
  tags: string[]
  filters: FiltersState
  onFilterChange: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void
  minimized: boolean
  onToggle: () => void
}

type ClearableFilterKey = Exclude<keyof FiltersState, 'view'>

export function Sidebar({
  categories,
  mechanisms,
  objects,
  integrations,
  tags,
  filters,
  onFilterChange,
  minimized,
  onToggle,
}: SidebarProps) {
  const { t } = useTranslation()

  const cleanLabel = (label: string) => label.replace(/:$/, '')

  const clearFilter = <K extends ClearableFilterKey>(key: K) => {
    onFilterChange(key, '' as FiltersState[K])
  }

  interface FilterDescriptor {
    key: ClearableFilterKey
    label: string
    value: string
  }

  const filterDescriptors: FilterDescriptor[] = [
    { key: 'search', label: t('searchDocuments'), value: filters.search },
    { key: 'category', label: cleanLabel(t('category')), value: filters.category },
    { key: 'mechanism', label: cleanLabel(t('mechanism')), value: filters.mechanism },
    { key: 'object', label: cleanLabel(t('objects')), value: filters.object },
    { key: 'integration', label: cleanLabel(t('integrations')), value: filters.integration },
    { key: 'tag', label: t('tagsFilter'), value: filters.tag },
  ]

  const activeFilters = filterDescriptors.filter((item) => item.value.trim().length > 0)

  const stats = [
    { label: t('categories'), value: categories.length },
    { label: t('mechanisms'), value: mechanisms.length },
    { label: cleanLabel(t('objects')), value: objects.length },
    { label: cleanLabel(t('integrations')), value: integrations.length },
  ]

  if (minimized) {
    return (
      <aside className="relative hidden h-full min-h-screen w-16 flex-shrink-0 items-center justify-between border-r border-white/5 bg-white/5/30 px-2 py-6 backdrop-blur lg:flex">
        <button
          type="button"
          onClick={onToggle}
          className="ring-focus flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-white/20 hover:bg-white/20"
          aria-label={t('mainNavigation')}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6l6 6-6 6" />
          </svg>
        </button>
        <span className="-rotate-90 text-sm font-semibold tracking-[0.3em] text-white/70">
          DocFinder
        </span>
      </aside>
    )
  }

  return (
    <aside className="relative hidden h-full min-h-screen w-[22rem] flex-shrink-0 border-r border-white/5 bg-white/5/40 backdrop-blur lg:flex">
      <div className="flex h-full w-full flex-col gap-8 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/60">
              {t('mainNavigation')}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">DocFinder</h2>
            <p className="mt-1 text-sm text-white/70">
              {t('businessProcessesSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="ring-focus flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-white/20 hover:bg-white/20"
            aria-label={t('minimizePanel')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 6l-6 6 6 6" />
            </svg>
          </button>
        </div>

        <div className="grid gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            {t('tagsFilter')}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onFilterChange('tag', tag)}
                className="ring-focus rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80 transition hover:border-white/20 hover:bg-white/20 hover:text-white"
              >
                #{tag}
              </button>
            ))}
            {tags.length === 0 && (
              <span className="text-xs text-white/60">{t('noTags')}</span>
            )}
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Filtres actius</p>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="ring-focus inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-xs text-violet-100 transition hover:border-violet-400/60 hover:bg-violet-500/20"
                  onClick={() => clearFilter(item.key)}
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="rounded-full bg-violet-400/20 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                    {item.value}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-3.5 w-3.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}


