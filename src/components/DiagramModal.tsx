import type { Process } from '../types'
import { useTranslation } from '../useTranslation'

export interface DiagramModalProps {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur"
      role="dialog"
      aria-modal="true"
    >
      <div className="glass-panel relative w-full max-w-4xl overflow-hidden">
        <header className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">{t('viewDiagram')}</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{process.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ring-focus inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:border-white/20 hover:bg-white/20 hover:text-white"
            aria-label={t('close')}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 14l8-8M6 6l8 8" />
            </svg>
          </button>
        </header>
        <div className="max-h-[70vh] overflow-auto bg-slate-950/60">
          {process.diagram ? (
            <img src={process.diagram} alt={process.name} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-white/60">
              {t('noDiagramAvailable')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


