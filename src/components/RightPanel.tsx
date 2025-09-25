import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { Process } from '../types'

export interface RightPanelProps {
  process: Process | null
  onClose: () => void
  minimized: boolean
  width: number
  onToggle: () => void
  onResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void
  className?: string
  surfaceStyle?: CSSProperties
}

export function RightPanel({ process, onClose, className, surfaceStyle, width, minimized, onResizeStart }: RightPanelProps) {
  if (!process) {
    return <aside className={className} style={surfaceStyle}></aside>
  }
  return (
    <aside className={className} style={{ ...surfaceStyle, width: minimized ? undefined : width }}>
      <div>{process.name}</div>
      <button type="button" onClick={onClose}>Close</button>
      <div role="separator" onPointerDown={onResizeStart} />
    </aside>
  )
}


