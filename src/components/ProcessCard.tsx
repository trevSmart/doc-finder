import { useEffect, useRef } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { Process } from '../types'
import { useTranslation } from '../useTranslation'
import { translateValue } from '../translations'
import { DocumentIcon } from './DocumentIcon'
import { DEFAULT_TAG_COLOR } from '../tagColors'

interface ProcessCardProps {
  process: Process
  onSelect: (process: Process) => void
  onTagClick: (tag: string) => void
  onShowDiagram: (process: Process) => void
  view: 'grid' | 'list'
  animationDelay?: number
  tagColors: Record<string, string>
}

type ProcessCardStyle = CSSProperties & {
  '--card-delay'?: string
}

export function ProcessCard({
  process,
  onSelect,
  onTagClick,
  onShowDiagram,
  view,
  animationDelay,
  tagColors,
}: ProcessCardProps) {
  const { t, language } = useTranslation()
  const isMarkdownFile = (filename: string): boolean => {
    const extension = filename.split('.').pop()?.toLowerCase()
    return extension === 'md' || extension === 'markdown'
  }
  const resolveDocumentUrl = (raw: string): string => {
    if (/^https?:\/\//i.test(raw)) {
      return raw
    }
    return raw.startsWith('/') ? raw : `/${raw}`
  }
  const handleCardClick = () => onSelect(process)
  const cardStyle: ProcessCardStyle | undefined =
    typeof animationDelay === 'number' ? { '--card-delay': `${animationDelay}ms` } : undefined
  const cardRef = useRef<HTMLElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (rafRef.current && typeof window !== 'undefined') {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const updatePointerGlow = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
      return
    }
    const { clientX, clientY } = event
    if (typeof window === 'undefined') {
      return
    }
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = window.requestAnimationFrame(() => {
      const node = cardRef.current
      if (!node) {
        return
      }
      const rect = node.getBoundingClientRect()
      const relativeX = ((clientX - rect.left) / rect.width).toFixed(3)
      const relativeY = ((clientY - rect.top) / rect.height).toFixed(3)
      node.style.setProperty('--pointer-x', relativeX)
      node.style.setProperty('--pointer-y', relativeY)
      node.style.setProperty('--pointer-opacity', '0.4')
    })
  }

  const resetPointerGlow = () => {
    if (rafRef.current && typeof window !== 'undefined') {
      window.cancelAnimationFrame(rafRef.current)
    }
    const node = cardRef.current
    if (!node) {
      return
    }
    node.style.setProperty('--pointer-opacity', '0')
  }

  return (
    <article
      className={`process-card ${view === 'list' ? 'list' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      style={cardStyle}
      ref={cardRef}
      onPointerMove={updatePointerGlow}
      onPointerLeave={resetPointerGlow}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleCardClick()
        }
      }}
    >
      <div className="process-header">
        <div>
          <h3 className="process-name">{process.name}</h3>
          <p className="process-description">{process.description}</p>
        </div>
        <span className={`priority-badge priority-${process.priority}`}>
          {translateValue(language, process.priority)}
        </span>
      </div>

      <div className="process-details">
        <div className="detail-row">
          <span className="detail-label">{t('category')}</span>
          <span className="detail-value">{translateValue(language, process.category)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">{t('mechanism')}</span>
          <span className="detail-value">{translateValue(language, process.mechanism)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">{t('objects')}</span>
          <span className="detail-value">{process.objects.join(', ')}</span>
        </div>
        {process.integrations.length > 0 && (
          <div className="detail-row">
            <span className="detail-label">{t('integrations')}</span>
            <span className="detail-value">{process.integrations.join(', ')}</span>
          </div>
        )}
      </div>

      <div className="tags-container" onClick={(event) => event.stopPropagation()}>
        <span className="tags-title">{t('tags')}</span>
        <div className="tags">
          {process.tags.map((tag) => {
            const color = tagColors[tag] ?? DEFAULT_TAG_COLOR
            return (
              <button
                key={tag}
                type="button"
                className="tag"
                onClick={() => onTagClick(tag)}
                style={{
                  backgroundColor: color,
                  borderColor: color,
                  color: '#000000',
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {process.documentation && (
        <div className="documentation-section" onClick={(event) => event.stopPropagation()}>
          <div className="documentation-link">
            <DocumentIcon filename={process.documentation} />
            {isMarkdownFile(process.documentation) ? (
              <button
                type="button"
                className="link-like-button"
                onClick={(event) => {
                  event.stopPropagation()
                  onSelect(process)
                  // The RightPanel will render Markdown when a .md document is present
                }}
              >
                {t('viewDocumentation')}
              </button>
            ) : (
              <a
                href={resolveDocumentUrl(process.documentation)}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                {t('viewDocumentation')}
              </a>
            )}
          </div>
        </div>
      )}

      {process.diagram && (
        <div className="diagram-section" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className="diagram-preview"
            onClick={() => onShowDiagram(process)}
          >
            <img src={`/doc-finder/documents/${process.diagram}`} alt={process.name} />
            <span>{t('viewDiagram')}</span>
          </button>
        </div>
      )}
    </article>
  )
}
