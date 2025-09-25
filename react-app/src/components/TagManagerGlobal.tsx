import { useState } from 'react'
import type { TagUpdatePayload } from '../types'
import { useTranslation } from '../useTranslation'
import { TagManagerModal } from './TagManagerModal'

interface TagManagerGlobalProps {
  availableTags: string[]
  tagColors: Record<string, string>
  onUpdateTags: (processId: string, payload: TagUpdatePayload) => void
  onUpdateGlobalTags: (payload: TagUpdatePayload) => void
  selectedProcessId: string | null
}

export function TagManagerGlobal({
  availableTags,
  tagColors,
  onUpdateTags,
  onUpdateGlobalTags,
  selectedProcessId,
}: TagManagerGlobalProps) {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <button
        type="button"
        className="tag-manager-global-toggle"
        onClick={handleOpenModal}
        title={t('manageTags')}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M3 12.3l8.7 8.7a1 1 0 001.4 0l7.6-7.6a1 1 0 000-1.4L12.3 3H4a1 1 0 00-1 1v8.3z" />
          <circle cx="8.5" cy="8.5" r="1.8" />
        </svg>
        <span>{t('manageTags')}</span>
      </button>

      <TagManagerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        availableTags={availableTags}
        tagColors={tagColors}
        onUpdateTags={onUpdateTags}
        onUpdateGlobalTags={onUpdateGlobalTags}
        selectedProcessId={selectedProcessId}
      />
    </>
  )
}

