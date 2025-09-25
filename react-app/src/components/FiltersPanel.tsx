import type { CSSProperties } from 'react'
import type { FiltersState } from '../types'
import { useTranslation } from '../useTranslation'
import { translateValue } from '../translations'

interface FiltersPanelProps {
  filters: FiltersState
  onFilterChange: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void
  objects: string[]
  integrations: string[]
  categories: string[]
  mechanisms: string[]
  tags: string[]
  total: number
  filtered: number
  onViewChange: (view: FiltersState['view']) => void
  className?: string
  style?: CSSProperties & { '--surface-delay'?: string }
}

const VIEW_OPTIONS: FiltersState['view'][] = ['grid', 'list']

export function FiltersPanel({
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
  className,
  style,
}: FiltersPanelProps) {
  const { t, language } = useTranslation()
  const rootClassName = ['search-section', className].filter(Boolean).join(' ')

  return (
    <div className={rootClassName} style={style}>
      <div className="search-container">
        <SearchSelect
          label={t('category')}
          id="categoryFilter"
          value={filters.category}
          options={categories}
          onChange={(value) => onFilterChange('category', value)}
          translateOptions={(option) => translateValue(language, option)}
          emptyLabel={t('allCategories')}
        />
        <SearchSelect
          label={t('mechanism')}
          id="mechanismFilter"
          value={filters.mechanism}
          options={mechanisms}
          onChange={(value) => onFilterChange('mechanism', value)}
          translateOptions={(option) => translateValue(language, option)}
          emptyLabel={t('allMechanisms')}
        />
        <SearchSelect
          label={t('objects')}
          id="objectFilter"
          value={filters.object}
          options={objects}
          onChange={(value) => onFilterChange('object', value)}
          emptyLabel={t('allObjects')}
        />
        <SearchSelect
          label={t('integrations')}
          id="integrationFilter"
          value={filters.integration}
          options={integrations}
          onChange={(value) => onFilterChange('integration', value)}
          emptyLabel={t('allIntegrations')}
        />
        <SearchSelect
          label={t('tagsFilter')}
          id="tagFilter"
          value={filters.tag}
          options={tags}
          onChange={(value) => onFilterChange('tag', value)}
          emptyLabel={t('allTags')}
        />
      </div>

      <div className="results-toolbar">
        <span className="results-count">{filtered} {t('resultsCount')} {total} processos</span>
        <div className="view-toggle">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`view-btn ${filters.view === option ? 'active' : ''}`}
              onClick={() => onViewChange(option)}
            >
              {option === 'grid' ? t('gridView') : t('listView')}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface SearchSelectProps {
  id: string
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  translateOptions?: (option: string) => string
  emptyLabel: string
}

function SearchSelect({ id, label, value, options, onChange, translateOptions, emptyLabel }: SearchSelectProps) {
  return (
    <label className="filter-select" htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {translateOptions ? translateOptions(option) : option}
          </option>
        ))}
      </select>
    </label>
  )
}
