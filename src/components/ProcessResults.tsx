import type { Process, ViewMode } from '../types'

export interface ProcessResultsProps {
  processes: Process[]
  view: ViewMode
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
  tagColors
}: ProcessResultsProps) {
  if (processes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-16">
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No processes found</h3>
        <p className="text-white/60 text-sm max-w-md">
          Try adjusting your search criteria or filters to find what you're looking for.
        </p>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-200 border-red-400/30'
      case 'high': return 'bg-orange-500/20 text-orange-200 border-orange-400/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30'
      case 'low': return 'bg-green-500/20 text-green-200 border-green-400/30'
      default: return 'bg-gray-500/20 text-gray-200 border-gray-400/30'
    }
  }

  if (view === 'list') {
  return (
      <div className="space-y-3">
        {processes.map((process) => (
          <div
            key={process.id}
            onClick={() => onSelect(process)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold text-lg group-hover:text-blue-200 transition-colors">
                    {process.name}
                  </h3>
                  {process.priority && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(process.priority)}`}>
                      {process.priority}
                    </span>
                  )}
                </div>
                <p className="text-white/70 text-sm mb-3 line-clamp-2">
                  {process.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {process.tags.slice(0, 3).map((tag) => (
                    <button
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation()
                        onTagClick(tag)
                      }}
                      className="px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: `${tagColors[tag] || '#3b82f6'}20`,
                        color: tagColors[tag] || '#3b82f6',
                        borderColor: `${tagColors[tag] || '#3b82f6'}40`
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                  {process.tags.length > 3 && (
                    <span className="px-2 py-1 rounded-md text-xs text-white/50">
                      +{process.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              {process.diagram && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onShowDiagram(process)
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-white/70 hover:text-white"
                  title="View diagram"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {processes.map((process) => (
        <div
          key={process.id}
          onClick={() => onSelect(process)}
          className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-6 cursor-pointer transition-all duration-200 group hover:scale-[1.02] hover:shadow-xl"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-200 transition-colors line-clamp-2">
                {process.name}
              </h3>
              {process.priority && (
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(process.priority)}`}>
                  {process.priority}
                </span>
              )}
            </div>
            {process.diagram && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onShowDiagram(process)
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-white/70 hover:text-white flex-shrink-0"
                title="View diagram"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            )}
          </div>

          <p className="text-white/70 text-sm mb-4 line-clamp-3">
            {process.description}
          </p>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {process.tags.slice(0, 4).map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation()
                    onTagClick(tag)
                  }}
                  className="px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: `${tagColors[tag] || '#3b82f6'}20`,
                    color: tagColors[tag] || '#3b82f6',
                    borderColor: `${tagColors[tag] || '#3b82f6'}40`
                  }}
                >
                  {tag}
                </button>
              ))}
              {process.tags.length > 4 && (
                <span className="px-2 py-1 rounded-md text-xs text-white/50">
                  +{process.tags.length - 4}
                </span>
              )}
            </div>

            <div className="text-xs text-white/50 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Category:</span>
                <span>{process.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Mechanism:</span>
                <span>{process.mechanism}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


