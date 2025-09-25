import type { TagUpdatePayload } from '../types'
import { useTranslation } from '../useTranslation'
import { TagManager } from './TagManager'

interface TagManagerModalProps {
  isOpen: boolean
  onClose: () => void
  availableTags: string[]
  tagColors: Record<string, string>
  onUpdateTags: (processId: string, payload: TagUpdatePayload) => void
  onUpdateGlobalTags: (payload: TagUpdatePayload) => void
  selectedProcessId: string | null
}

export function TagManagerModal({
  isOpen,
  onClose,
  availableTags,
  tagColors,
  onUpdateTags,
  onUpdateGlobalTags,
  selectedProcessId,
}: TagManagerModalProps) {
  const { t } = useTranslation()

  const handleUpdateTags = (payload: TagUpdatePayload) => {
    if (selectedProcessId) {
      onUpdateTags(selectedProcessId, payload)
    } else {
      onUpdateGlobalTags(payload)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="tag-manager-modal-overlay" onClick={onClose}>
      <div className="tag-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tag-manager-modal-header">
          <h2 className="tag-manager-modal-title">{t('manageTags')}</h2>
          <button
            type="button"
            className="tag-manager-modal-close"
            onClick={onClose}
            aria-label={t('close')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="tag-manager-modal-content">
          <TagManager
            id="modal-tag-manager"
            tags={[]} // Tags will be managed globally, not per process
            availableTags={availableTags}
            tagColors={tagColors}
            onChange={handleUpdateTags}
            isGlobal={true}
          />
        </div>
      </div>
    </div>
  )
}
