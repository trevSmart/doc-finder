import { useState, useRef, useEffect } from 'react'
import type { TagUpdatePayload } from '../types'
import { useTranslation } from '../useTranslation'
import { TagManagerModal } from './TagManagerModal'

interface OptionsMenuProps {
  availableTags: string[]
  tagColors: Record<string, string>
  onUpdateTags: (processId: string, payload: TagUpdatePayload) => void
  onUpdateGlobalTags: (payload: TagUpdatePayload) => void
  selectedProcessId: string | null
  databasePath: string
  onInitializeDatabaseSuccess: () => void
}

export function OptionsMenu({
  availableTags,
  tagColors,
  onUpdateTags,
  onUpdateGlobalTags,
  selectedProcessId,
  databasePath,
  onInitializeDatabaseSuccess,
}: OptionsMenuProps) {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  const handleShowInfo = () => {
    setShowInfo(true)
    setIsMenuOpen(false)
    // Auto-hide info after 3 seconds
    setTimeout(() => setShowInfo(false), 3000)
  }

  const handleManageTags = () => {
    setIsModalOpen(true)
    setIsMenuOpen(false)
  }

  const handleInitializeDatabase = async () => {
    if (isInitializing) {
      return
    }
    setIsMenuOpen(false)
    const confirmed = window.confirm('Vols inicialitzar la base de dades buida? Aquesta acció sobreescriurà el fitxer actual si existeix.')
    if (!confirmed) {
      return
    }

    try {
      setIsInitializing(true)
      const response = await fetch('api/init-database', { method: 'POST' })
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(text || `Error ${response.status}`)
      }
      onInitializeDatabaseSuccess()
      setShowInfo(true)
      setTimeout(() => setShowInfo(false), 3000)
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(`No s'ha pogut inicialitzar la base de dades. ${error instanceof Error ? error.message : ''}`)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <>
      <div className="options-menu" ref={menuRef}>
        <button
          type="button"
          className="options-menu-toggle"
          onClick={handleToggleMenu}
          title="Opcions"
          aria-expanded={isMenuOpen}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {isMenuOpen && (
          <div className="options-menu-dropdown">
            <button
              type="button"
              className="options-menu-item"
              onClick={handleShowInfo}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>Informació</span>
            </button>

            <button
              type="button"
              className="options-menu-item"
              onClick={handleManageTags}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12.3l8.7 8.7a1 1 0 001.4 0l7.6-7.6a1 1 0 000-1.4L12.3 3H4a1 1 0 00-1 1v8.3z" />
                <circle cx="8.5" cy="8.5" r="1.8" />
              </svg>
              <span>{t('manageTags')}</span>
            </button>

            <button
              type="button"
              className="options-menu-item"
              onClick={handleInitializeDatabase}
              disabled={isInitializing}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12l2-2 3 3 6-6 5 5" />
              </svg>
              <span>{isInitializing ? 'Inicialitzant…' : 'Inicialitzar base de dades'}</span>
            </button>
          </div>
        )}
      </div>

      {showInfo && (
        <div className="info-toast">
          <div className="info-toast-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <div>
              <strong>Base de dades:</strong>
              <br />
              <code>{databasePath}</code>
            </div>
          </div>
        </div>
      )}

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
