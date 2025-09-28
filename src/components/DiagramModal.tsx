import type { Process } from '../types'

export interface DiagramModalProps {
  process: Process | null
  isOpen: boolean
  onClose: () => void
}

export function DiagramModal({ process, isOpen, onClose }: DiagramModalProps) {
  if (!isOpen || !process) return null
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__body">
        <h2>{process.name}</h2>
        {process.diagram ? <img src={process.diagram} alt="Diagram" /> : null}
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}


