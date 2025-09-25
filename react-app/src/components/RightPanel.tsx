import { type CSSProperties, type PointerEvent } from 'react'
import type { Process } from '../types'
import { useTranslation } from '../useTranslation'
import { translateValue } from '../translations'
import { DocumentIcon } from './DocumentIcon'
import { MarkdownRenderer } from './MarkdownRenderer'

interface RightPanelProps {
  process: Process | null
  onClose: () => void
  minimized: boolean
  width: number
  onToggle: () => void
  onResizeStart: (event: PointerEvent<HTMLDivElement>) => void
  className?: string
  surfaceStyle?: CSSProperties & { '--surface-delay'?: string }
}

export function RightPanel({
  process,
  onClose,
  minimized,
  width,
  onToggle,
  onResizeStart,
  className,
  surfaceStyle,
}: RightPanelProps) {
  const { t, language } = useTranslation()

  const isMarkdownFile = (filename: string): boolean => {
    const extension = filename.split('.').pop()?.toLowerCase()
    return extension === 'md' || extension === 'markdown'
  }

  const resolveDocumentUrl = (raw: string): string => {
    // External links remain unchanged
    if (/^https?:\/\//i.test(raw)) {
      return raw
    }
    // Ensure we always use an absolute path from the server root
    return raw.startsWith('/') ? raw : `/${raw}`
  }

  const rootClassName = ['right-panel', minimized ? 'minimized' : '', className].filter(Boolean).join(' ')
  const panelStyle: CSSProperties & { '--surface-delay'?: string } = {
    ...(surfaceStyle ?? {}),
    width: minimized ? 0 : width,
  }

  return (
    <aside
      className={rootClassName}
      id="rightPanel"
      style={panelStyle}
    >
      {!minimized && (
        <div
          className="panel-resizer"
          id="rightPanelResizer"
          onPointerDown={onResizeStart}
          role="separator"
          aria-orientation="vertical"
          aria-label="Redimensiona el panell de previsualització"
        />
      )}
      <header className="panel-header">
        <div>
          <h3>{process ? process.name : t('documentation')}</h3>
          {!process && <p className="panel-subtitle">{t('selectProcess')}</p>}
        </div>
        <div className="panel-controls">
          <button
            type="button"
            className="panel-minimize"
            aria-label={minimized ? 'Mostrar panell' : t('minimizePanel')}
            onClick={onToggle}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          {process && (
            <button type="button" className="panel-close" aria-label={t('closePanel')} onClick={onClose}>
              &times;
            </button>
          )}
        </div>
      </header>
      <div className="panel-content" id="panelContent">
        {process ? (
          <div className="panel-details">
            <p><strong>{t('description')}:</strong> {process.description}</p>
            <p><strong>{t('category')}:</strong> {translateValue(language, process.category)}</p>
            <p><strong>{t('mechanism')}:</strong> {translateValue(language, process.mechanism)}</p>
            <p><strong>{t('objects')}:</strong> {process.objects.join(', ')}</p>
            {process.integrations.length > 0 && (
              <p><strong>{t('integrations')}:</strong> {process.integrations.join(', ')}</p>
            )}
            <p><strong>{t('priority')}:</strong> {translateValue(language, process.priority)}</p>
            <p><strong>{t('complexity')}:</strong> {translateValue(language, process.complexity)}</p>
            {process.documentation && (
              <div className="panel-documentation">
                <strong>{t('documentation')}:</strong>
                {isMarkdownFile(process.documentation) ? (
                  <div className="panel-markdown-content">
                    <MarkdownRenderer url={resolveDocumentUrl(process.documentation)} />
                  </div>
                ) : (
                  <div className="panel-documentation-link">
                    <DocumentIcon filename={process.documentation} />
                    <a href={resolveDocumentUrl(process.documentation)} target="_blank" rel="noreferrer">
                      {t('viewDocumentation')}
                    </a>
                  </div>
                )}
              </div>
            )}
            {process.diagram && (
              <div className="panel-diagram">
                <h4>{t('viewDiagram')}</h4>
                <div className="panel-diagram-container">
                  <img
                    src={`/doc-finder/documents/${process.diagram}`}
                    alt={`Diagrama de ${process.name}`}
                    className="panel-diagram-image"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>{t('selectProcess')}</p>
        )}
      </div>
    </aside>
  )
}
