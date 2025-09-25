import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { Process } from '../types'
import { useTranslation } from '../useTranslation'

export interface RightPanelProps {
  process: Process | null
  onClose: () => void
  minimized: boolean
  width: number
  onToggle: () => void
  onResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void
  tagColors: Record<string, string>
}

const detailRow = (label: string, value: string | string[]) => {
  const displayValue = Array.isArray(value) ? value.join(', ') || '—' : value || '—'
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">{label}</p>
      <p className="text-sm text-white/70">{displayValue}</p>
    </div>
  )
}

export function RightPanel({
  process,
  onClose,
  minimized,
  width,
  onToggle,
  onResizeStart,
  tagColors,
}: RightPanelProps) {
  const { t } = useTranslation()
  const style = minimized
    ? undefined
    : ({ '--panel-width': `${Math.round(width)}px` } as CSSProperties)

  if (minimized) {
    return (
      <aside className="relative mt-6 flex w-full items-center justify-between border-t border-white/10 bg-white/5/40 px-4 py-6 backdrop-blur lg:mt-0 lg:w-16 lg:flex-col lg:justify-center lg:border-l lg:border-t-0">
        <button
          type="button"
          onClick={onToggle}
          className="ring-focus flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-white/20 hover:bg-white/20"
          aria-label={t('minimizePanel')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 6l-6 6 6 6" />
          </svg>
        </button>
        <span className="hidden rotate-90 text-sm font-semibold tracking-[0.3em] text-white/60 lg:block">
          Docs
        </span>
      </aside>
    )
  }

  return (
    <aside
      className="relative mt-6 flex w-full flex-col border-t border-white/10 bg-white/5/40 backdrop-blur lg:mt-0 lg:min-h-screen lg:border-l lg:border-t-0 lg:w-[var(--panel-width)]"
      style={style}
    >
      <div
        role="presentation"
        onPointerDown={onResizeStart}
        className="absolute inset-y-0 left-0 hidden w-1 cursor-col-resize rounded-full bg-transparent transition hover:bg-white/40 lg:block"
      />
      <header className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">{t('documentation')}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {process ? process.name : t('selectProcess')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="ring-focus inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/20 hover:bg-white/20 hover:text-white"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6l-4 4 4 4" />
            </svg>
            {t('minimizePanel')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ring-focus inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:border-white/20 hover:bg-white/20 hover:text-white"
            aria-label={t('closePanel')}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 14l8-8M6 6l8 8" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {!process ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/60">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-16 w-16 text-white/30">
              <rect x="9" y="6" width="22" height="28" rx="3" />
              <path strokeLinecap="round" d="M13 14h14M13 20h14M13 26h9" />
            </svg>
            <p className="text-sm leading-relaxed">{t('selectProcess')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/40">{t('description')}</h3>
              <p className="text-base leading-relaxed text-white/70">{process.description}</p>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              {detailRow(t('category'), process.category)}
              {detailRow(t('mechanism'), process.mechanism)}
              {detailRow(t('objects'), process.objects)}
              {detailRow(t('integrations'), process.integrations)}
              {detailRow(t('priority'), process.priority)}
              {detailRow(t('complexity'), process.complexity)}
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/40">{t('tags')}</h3>
              <div className="flex flex-wrap gap-2">
                {process.tags.length === 0 && (
                  <span className="text-sm text-white/50">{t('noTags')}</span>
                )}
                {process.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: tagColors[tag] ?? '#a855f7' }}
                      aria-hidden="true"
                    />
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {process.documentation && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/40">{t('documentation')}</h3>
                <a
                  href={process.documentation}
                  target="_blank"
                  rel="noreferrer"
                  className="ring-focus inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/20 hover:text-white"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 5h5v5M5 10l10-5-5 10-1.5-3.5L5 10z" />
                  </svg>
                  {t('viewDocumentation')}
                </a>
              </section>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}


