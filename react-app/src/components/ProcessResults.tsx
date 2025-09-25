import { useEffect, useMemo, useRef, useState } from 'react'
import type { Process } from '../types'
import { ProcessCard } from './ProcessCard'
import { useTranslation } from '../useTranslation'

interface ProcessResultsProps {
  processes: Process[]
  view: 'grid' | 'list'
  onSelect: (process: Process) => void
  onTagClick: (tag: string) => void
  onShowDiagram: (process: Process) => void
  tagColors: Record<string, string>
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
  const [animationCycle, setAnimationCycle] = useState(0)
  const idsSignature = useMemo(() => processes.map((process) => process.id).join('|'), [processes])
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setAnimationCycle((previous) => previous + 1)
  }, [idsSignature, view])

  const delayStep = view === 'grid' ? 60 : 40

  if (processes.length === 0) {
    return (
      <div className="no-results">
        <h3>{t('noResults')}</h3>
        <p>{t('noResultsDescription')}</p>
      </div>
    )
  }

  return (
    <div className={view === 'grid' ? 'processes-grid' : 'processes-list'} id="processesContainer">
      {processes.map((process, index) => (
        <ProcessCard
          key={`${process.id}-${animationCycle}`}
          process={process}
          view={view}
          onSelect={onSelect}
          onTagClick={onTagClick}
          onShowDiagram={onShowDiagram}
          tagColors={tagColors}
          animationDelay={processes.length > 1 ? delayStep * index : 0}
        />
      ))}
    </div>
  )
}
