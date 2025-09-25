import type { Process } from '../types'
import { useTranslation } from '../useTranslation'

interface DiagramModalProps {
  process: Process | null
  isOpen: boolean
  onClose: () => void
}

export function DiagramModal({ process, isOpen, onClose }: DiagramModalProps) {
  const { t } = useTranslation()

  if (!isOpen || !process) {
    return null
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="modalTitle">{process.name}</h2>
          <button type="button" className="close" onClick={onClose} aria-label={t('close')}>
            &times;
          </button>
        </header>
        <div className="modal-body">
          <img src={`/doc-finder/documents/${process.diagram}`} alt={process.name} className="modal-image" />
        </div>
      </div>
    </div>
  )
}
