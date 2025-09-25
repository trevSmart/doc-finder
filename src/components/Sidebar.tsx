import type { CSSProperties } from 'react'
import type { FiltersState } from '../types'

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
  className?: string
  style?: CSSProperties
}

export function Sidebar(props: SidebarProps) {
  const {
    categories,
    mechanisms,
    objects,
    integrations,
    tags,
    filters,
    onFilterChange,
    minimized,
    onToggle
  } = props

  const filterSections = [
    { key: 'category' as const, label: 'Categories', options: categories },
    { key: 'mechanism' as const, label: 'Mechanisms', options: mechanisms },
    { key: 'object' as const, label: 'Objects', options: objects },
    { key: 'integration' as const, label: 'Integrations', options: integrations },
    { key: 'tag' as const, label: 'Tags', options: tags },
  ]

  if (minimized) {
    return (
      <aside className="w-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl flex flex-col items-center py-4">
        <button
          type="button"
          onClick={onToggle}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
          aria-label="Expand sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-lg">Filters</h2>
              <p className="text-white/80 text-sm">Narrow your search</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
            aria-label="Collapse sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {filterSections.map((section) => (
          <div key={section.key} className="space-y-3">
            <h3 className="text-white/90 font-medium text-sm uppercase tracking-wide">
              {section.label}
            </h3>
            <div className="space-y-2">
              {section.options.length > 0 ? (
                section.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onFilterChange(section.key, option)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      filters[section.key] === option
                        ? 'bg-blue-500/30 text-white border border-blue-400/50'
                        : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-transparent'
                    }`}
                  >
                    {option}
                  </button>
                ))
              ) : (
                <p className="text-white/50 text-sm italic">No options available</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Clear Filters */}
      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => {
            onFilterChange('category', '')
            onFilterChange('mechanism', '')
            onFilterChange('object', '')
            onFilterChange('integration', '')
            onFilterChange('tag', '')
          }}
          className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 border border-white/20 text-sm font-medium"
        >
          Clear All Filters
        </button>
      </div>
    </aside>
  )
}


