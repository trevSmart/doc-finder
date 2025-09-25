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
  const { minimized, onToggle, className, style } = props
  return (
    <aside className={className} style={style}>
      <button type="button" onClick={onToggle} aria-label={minimized ? 'Expand sidebar' : 'Collapse sidebar'}>
        {minimized ? '▶' : '◀'}
      </button>
    </aside>
  )
}


