import type { FiltersState, ViewMode } from '../types'

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
  onViewChange
}: FiltersPanelProps) {
  const filterSections = [
    { key: 'category' as const, label: 'Category', options: categories },
    { key: 'mechanism' as const, label: 'Mechanism', options: mechanisms },
    { key: 'object' as const, label: 'Object', options: objects },
    { key: 'integration' as const, label: 'Integration', options: integrations },
    { key: 'tag' as const, label: 'Tag', options: tags },
  ]

  return (
    <div className="mt-6 space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-white/80 text-sm">
          Showing <span className="font-semibold text-white">{filtered}</span> of{' '}
          <span className="font-semibold text-white">{total}</span> processes
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/20">
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              filters.view === 'grid'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onViewChange('list')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              filters.view === 'list'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Active Filters */}
      <div className="space-y-4">
        {filterSections.map((section) => (
          <div key={section.key} className="space-y-2">
            <label className="block text-white/90 text-sm font-medium">
              {section.label}
            </label>
            <select
              value={filters[section.key]}
              onChange={(e) => onFilterChange(section.key, e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 backdrop-blur-sm"
            >
              <option value="">All {section.label}s</option>
              {section.options.map((option) => (
                <option key={option} value={option} className="bg-gray-800 text-white">
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Clear All Filters */}
      {(filters.category || filters.mechanism || filters.object || filters.integration || filters.tag) && (
        <div className="pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              onFilterChange('category', '')
              onFilterChange('mechanism', '')
              onFilterChange('object', '')
              onFilterChange('integration', '')
              onFilterChange('tag', '')
            }}
            className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 rounded-lg transition-all duration-200 border border-red-400/30 text-sm font-medium"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}


