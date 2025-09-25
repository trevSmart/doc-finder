import type { Process, ViewMode } from '../types'

export interface ProcessResultsProps {
  processes: Process[]
  view: ViewMode
  onSelect: (process: Process) => void
  onTagClick: (tag: string) => void
  onShowDiagram: (process: Process) => void
  tagColors: Record<string, string>
}

export function ProcessResults({ processes, onSelect }: ProcessResultsProps) {
  return (
    <div className="process-results">
      <ul>
        {processes.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onSelect(p)}>{p.name}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}


