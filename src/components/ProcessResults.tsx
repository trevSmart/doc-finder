import type { Process, ViewMode } from '../types'
import { useTranslation } from '../useTranslation'

export interface ProcessResultsProps {
  processes: Process[]
  view: ViewMode
  onSelect: (process: Process) => void
  onTagClick: (tag: string) => void
  onShowDiagram: (process: Process) => void
  tagColors: Record<string, string>
}

const priorityStyles: Record<string, string> = {
  critical: 'bg-rose-500/10 text-rose-200 border-rose-400/40',
  high: 'bg-amber-500/10 text-amber-100 border-amber-400/40',
  medium: 'bg-emerald-500/10 text-emerald-100 border-emerald-400/40',
  low: 'bg-sky-500/10 text-sky-100 border-sky-400/40',
}

export function ProcessResults({
  processes,
  view,
  onSelect,
  onTagClick,
  onShowDiagram,
  tagColors,
}: ProcessResultsProps) {
  const { t } = useTranslation()

  const priorityLabels: Record<string, string> = {
    critical: t('critical'),
    high: t('high'),
    medium: t('medium'),
    low: t('low'),
  }

  const complexityLabels: Record<string, string> = {
    high: t('highComplexity'),
    medium: t('mediumComplexity'),
    low: t('lowComplexity'),
  }

  const renderTags = (process: Process) => {
    if (process.tags.length === 0) {
      return <span className="text-xs text-white/40">{t('noTags')}</span>
    }

    return process.tags.map((tag) => {
      const color = tagColors[tag]
      return (
        <button
          key={tag}
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onTagClick(tag)
          }}
          className="ring-focus inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color ?? '#a855f7' }}
            aria-hidden="true"
          />
          <span>{tag}</span>
        </button>
      )
    })
  }

  const renderProcessCard = (process: Process) => {
    const priorityStyle = priorityStyles[process.priority] ?? 'bg-white/5 text-white/80 border-white/10'
    const priorityLabel = priorityLabels[process.priority] ?? process.priority
    const complexityLabel = complexityLabels[process.complexity] ?? process.complexity

    return (
      <button
        key={process.id}
        type="button"
        onClick={() => onSelect(process)}
        className="group flex h-full flex-col gap-5 rounded-3xl border border-white/5 bg-white/5 p-6 text-left transition duration-200 hover:border-white/20 hover:bg-white/10"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-white">
              {process.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {process.description}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${priorityStyle}`}
          >
            {priorityLabel}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">{renderTags(process)}</div>

        <div className="mt-auto grid gap-3 text-xs text-white/60 md:grid-cols-2">
          <div className="space-y-1">
            <p className="font-semibold text-white/70">{t('category')}</p>
            <p className="text-white/60">{process.category}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white/70">{t('mechanism')}</p>
            <p className="text-white/60">{process.mechanism}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white/70">{t('objects')}</p>
            <p className="text-white/60">{process.objects.join(', ') || '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white/70">{t('integrations')}</p>
            <p className="text-white/60">{process.integrations.join(', ') || '—'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 3.5L4 6.5v7l6 3 6-3v-7l-6-3z" />
            </svg>
            {t('complexity')}
            <span className="font-semibold text-white/80">{complexityLabel}</span>
          </span>
          {process.diagram ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onShowDiagram(process)
              }}
              className="ring-focus inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-3 py-1 text-xs font-medium text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h12v12H4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12M10 4v12" />
              </svg>
              {t('viewDiagram')}
            </button>
          ) : (
            <span className="text-white/40">{t('noDiagramAvailable')}</span>
          )}
        </div>
      </button>
    )
  }

  if (processes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-16 w-16 text-white/30">
          <circle cx="22" cy="22" r="12" />
          <path strokeLinecap="round" d="M32 32l8 8" />
        </svg>
        <div>
          <p className="text-lg font-semibold text-white">{t('noResults')}</p>
          <p className="mt-2 text-sm text-white/60">{t('noResultsDescription')}</p>
        </div>
      </div>
    )
  }

  if (view === 'list') {
    return (
      <div className="space-y-4">
        {processes.map((process) => (
          <div
            key={process.id}
            className="glass-panel flex flex-col gap-4 p-6 transition hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onSelect(process)}
                className="ring-focus text-left text-lg font-semibold text-white transition hover:text-white/90"
              >
                {process.name}
              </button>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  priorityStyles[process.priority] ?? 'bg-white/5 text-white/80 border-white/10'
                }`}
              >
                {priorityLabels[process.priority] ?? process.priority}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/70">{process.description}</p>
            <div className="flex flex-wrap gap-2">{renderTags(process)}</div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
              <span className="inline-flex items-center gap-2">
                <strong className="text-white/70">{t('mechanism')}</strong>
                {process.mechanism}
              </span>
              <span className="inline-flex items-center gap-2">
                <strong className="text-white/70">{t('category')}</strong>
                {process.category}
              </span>
              <span className="inline-flex items-center gap-2">
                <strong className="text-white/70">{t('complexity')}</strong>
                {complexityLabels[process.complexity] ?? process.complexity}
              </span>
              {process.diagram && (
                <button
                  type="button"
                  onClick={() => onShowDiagram(process)}
                  className="ring-focus inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-3 py-1 text-xs font-medium text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  {t('viewDiagram')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{processes.map((process) => renderProcessCard(process))}</div>
}


