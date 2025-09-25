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

export function FiltersPanel({ onViewChange }: FiltersPanelProps) {
  return (
    <div className="filters-panel">
      <button type="button" onClick={() => onViewChange('grid')}>Grid</button>
      <button type="button" onClick={() => onViewChange('list')}>List</button>
    </div>
  )
}


