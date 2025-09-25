import type { CSSProperties } from 'react'
import type { FiltersState } from '../types'
import { useTranslation } from '../useTranslation'
import { translateValue } from '../translations'

interface SidebarProps {
  categories: string[]
  mechanisms: string[]
  objects: string[]
  integrations: string[]
  tags: string[]
  filters: FiltersState
  onFilterChange: (
    key: keyof Pick<FiltersState, 'category' | 'mechanism' | 'object' | 'integration' | 'tag'>,
    value: string,
  ) => void
  minimized: boolean
  onToggle: () => void
  className?: string
  style?: CSSProperties & { '--surface-delay'?: string }
}

const ICON_PATHS: Record<string, string> = {
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  bars: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  toggle: 'M9 18l6-6-6-6',
}

interface FilterSectionProps {
  title: string
  icon: keyof typeof ICON_PATHS
  options: string[]
  selected: string
  onSelect: (value: string) => void
  translateOptions?: (option: string) => string
  maxItems?: number
}

function FilterSection({ title, icon, options, selected, onSelect, translateOptions, maxItems }: FilterSectionProps) {
  const limitedOptions = typeof maxItems === 'number' ? options.slice(0, maxItems) : options
  return (
    <div className="nav-section">
      <div className="nav-section-title">{title}</div>
      <div className="nav-items">
        {limitedOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={`nav-item ${selected === option ? 'active' : ''}`}
            onClick={() => onSelect(selected === option ? '' : option)}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ICON_PATHS[icon]} />
            </svg>
            {translateOptions ? translateOptions(option) : option}
          </button>
        ))}
      </div>
    </div>
  )
}

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
  className,
  style,
}: SidebarProps) {
  const { t, language } = useTranslation()

  const NAV_ITEMS = [
    { label: t('searchDocuments'), href: '#', icon: 'search', active: true },
    { label: t('diagrams'), href: '/doc-finder/documents/', icon: 'bars' },
    { label: t('businessProcesses'), href: '../business-processes/', icon: 'clipboard' },
  ]

  const rootClassName = ['sidebar', minimized ? 'minimized' : '', className].filter(Boolean).join(' ')
  const vodafoneLogoSrc = `${import.meta.env.BASE_URL}vodafone-logo.webp`

  return (
    <aside className={rootClassName} id="sidebar" style={style}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={vodafoneLogoSrc} alt="Vodafone" className="sidebar-logo-img" />
          <div>
            <h1 className="sidebar-title">Vodafone PYME</h1>
            <p className="sidebar-subtitle">{t('knowledgeBase')}</p>
          </div>
        </div>
        <button type="button" className="sidebar-toggle" onClick={onToggle} title={minimized ? 'Mostrar navegació' : 'Minimitzar navegació'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={ICON_PATHS.toggle} />
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">{t('mainNavigation')}</div>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`nav-item ${item.active ? 'active' : ''}`}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ICON_PATHS[item.icon]} />
              </svg>
              {item.label}
            </a>
          ))}
        </div>

        <FilterSection
          title={t('tagsFilter')}
          icon="search"
          options={tags}
          selected={filters.tag}
          onSelect={(value) => onFilterChange('tag', value)}
        />

        <FilterSection
          title={t('categories')}
          icon="clock"
          options={categories}
          selected={filters.category}
          onSelect={(value) => onFilterChange('category', value)}
          translateOptions={(option) => translateValue(language, option)}
        />

        <FilterSection
          title={t('mechanisms')}
          icon="refresh"
          options={mechanisms}
          selected={filters.mechanism}
          onSelect={(value) => onFilterChange('mechanism', value)}
          translateOptions={(option) => translateValue(language, option)}
        />

        <FilterSection
          title={t('objects')}
          icon="document"
          options={objects}
          selected={filters.object}
          onSelect={(value) => onFilterChange('object', value)}
        />

        <FilterSection
          title={t('integrations')}
          icon="check"
          options={integrations}
          selected={filters.integration}
          onSelect={(value) => onFilterChange('integration', value)}
        />
      </nav>
    </aside>
  )
}
