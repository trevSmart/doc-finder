import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { Process } from '../types'

export interface RightPanelProps {
  process: Process | null
  onClose: () => void
  minimized: boolean
  width: number
  onToggle: () => void
  onResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void
  className?: string
  surfaceStyle?: CSSProperties
}

export function RightPanel({
  process,
  onClose,
  width,
  minimized,
  onResizeStart,
  onToggle
}: RightPanelProps) {
  if (minimized) {
    return (
      <aside className="w-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl flex flex-col items-center py-4">
        <button
          type="button"
          onClick={onToggle}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
          aria-label="Expand panel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </aside>
    )
  }

  if (!process) {
    return (
      <aside
        className="w-96 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl flex flex-col overflow-hidden"
        style={{ width }}
      >
        <div className="flex-1 flex items-center justify-center text-white/60">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">Select a process</p>
            <p className="text-sm opacity-75">Choose a process from the list to view details</p>
          </div>
        </div>
        <div
          className="absolute left-0 top-0 w-3 h-full cursor-col-resize hover:bg-white/20 transition-colors"
          onPointerDown={onResizeStart}
        />
      </aside>
    )
  }

  return (
    <aside
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl flex flex-col overflow-hidden relative"
      style={{ width }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg truncate">{process.name}</h2>
            <p className="text-white/80 text-sm">Process Details</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggle}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
              aria-label="Minimize panel"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
              aria-label="Close panel"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-white font-medium mb-2">Description</h3>
          <p className="text-white/80 text-sm leading-relaxed">{process.description}</p>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h3 className="text-white font-medium">Details</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Category</div>
              <div className="text-white font-medium">{process.category}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Mechanism</div>
              <div className="text-white font-medium">{process.mechanism}</div>
            </div>
            {process.priority && (
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Priority</div>
                <div className="text-white font-medium">{process.priority}</div>
              </div>
            )}
          </div>
        </div>

        {/* Objects */}
        {process.objects.length > 0 && (
          <div>
            <h3 className="text-white font-medium mb-3">Objects</h3>
            <div className="flex flex-wrap gap-2">
              {process.objects.map((object) => (
                <span
                  key={object}
                  className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm border border-blue-400/30"
                >
                  {object}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Integrations */}
        {process.integrations.length > 0 && (
          <div>
            <h3 className="text-white font-medium mb-3">Integrations</h3>
            <div className="flex flex-wrap gap-2">
              {process.integrations.map((integration) => (
                <span
                  key={integration}
                  className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm border border-green-400/30"
                >
                  {integration}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {process.tags.length > 0 && (
          <div>
            <h3 className="text-white font-medium mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {process.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm border border-blue-400/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Documentation */}
        {process.documentation && (
          <div>
            <h3 className="text-white font-medium mb-3">Documentation</h3>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-white/80 text-sm leading-relaxed">
                {process.documentation}
              </div>
            </div>
          </div>
        )}

        {/* Diagram */}
        {process.diagram && (
          <div>
            <h3 className="text-white font-medium mb-3">Diagram</h3>
            <div className="bg-white/5 rounded-lg p-4">
              <img
                src={process.diagram}
                alt={`Diagram for ${process.name}`}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Resizer */}
      <div
        className="absolute left-0 top-0 w-3 h-full cursor-col-resize hover:bg-white/20 transition-colors"
        onPointerDown={onResizeStart}
      />
    </aside>
  )
}


