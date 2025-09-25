import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import './App.css'
import type {
  FiltersState,
  Process,
  ProcessesDatabase,
  TagUpdatePayload,
  UploadResponse,
} from './types'
import { DEFAULT_TAG_COLOR, ensureTagColors } from './tagColors'
import { Sidebar } from './components/Sidebar'
import { SearchBar } from './components/SearchBar'
import { FiltersPanel } from './components/FiltersPanel'
import { ProcessResults } from './components/ProcessResults'
import { RightPanel } from './components/RightPanel'
import { DiagramModal } from './components/DiagramModal'
import { OptionsMenu } from './components/OptionsMenu'
import { LanguageProvider } from './LanguageContext'
import { LanguageSelector } from './components/LanguageSelector'
import { useTranslation } from './useTranslation'

const SORT_LOCALE = 'ca'
const DEFAULT_DATABASE_PATH = 'processes-database.json'
const baseUrl = import.meta.env.BASE_URL ?? '/'
const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
const envDatabaseUrlRaw = import.meta.env.VITE_DATABASE_URL
const envDatabaseUrl = typeof envDatabaseUrlRaw === 'string' ? envDatabaseUrlRaw.trim() : ''
const DATABASE_URL = envDatabaseUrl.length > 0
  ? envDatabaseUrl
  : `${normalizedBaseUrl}${DEFAULT_DATABASE_PATH}`
const RIGHT_PANEL_MIN_WIDTH = 320
const RIGHT_PANEL_MAX_WIDTH = 720
const RIGHT_PANEL_DEFAULT_WIDTH = 400

const STORAGE_KEYS = {
  filters: 'docFinder.filters',
  sidebarMinimized: 'docFinder.sidebarMinimized',
  rightPanelMinimized: 'docFinder.rightPanelMinimized',
  rightPanelWidth: 'docFinder.rightPanelWidth',
}

const isBrowser = typeof window !== 'undefined'

const sortOptions = (values: string[]) => [...values].sort((a, b) => a.localeCompare(b, SORT_LOCALE))

const initialFilters: FiltersState = {
  search: '',
  category: '',
  mechanism: '',
  object: '',
  integration: '',
  tag: '',
  view: 'grid',
}

const parseFilters = (raw: unknown): FiltersState => {
  if (!raw || typeof raw !== 'object') {
    return initialFilters
  }

  const candidate = raw as Partial<FiltersState>
  const view = candidate.view === 'list' ? 'list' : 'grid'

  return {
    ...initialFilters,
    ...candidate,
    view,
    search: typeof candidate.search === 'string' ? candidate.search : '',
    category: typeof candidate.category === 'string' ? candidate.category : '',
    mechanism: typeof candidate.mechanism === 'string' ? candidate.mechanism : '',
    object: typeof candidate.object === 'string' ? candidate.object : '',
    integration: typeof candidate.integration === 'string' ? candidate.integration : '',
    tag: typeof candidate.tag === 'string' ? candidate.tag : '',
  }
}

const getStoredFilters = (): FiltersState => {
  if (!isBrowser) {
    return initialFilters
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.filters)
    if (!stored) {
      return initialFilters
    }
    return parseFilters(JSON.parse(stored))
  } catch (error) {
    console.warn('No s\'han pogut recuperar els filtres guardats', error)
    return initialFilters
  }
}

const getStoredBoolean = (key: string, fallback: boolean) => {
  if (!isBrowser) {
    return fallback
  }

  try {
    const stored = window.localStorage.getItem(key)
    if (stored === null) {
      return fallback
    }
    return stored === 'true'
  } catch (error) {
    console.warn(`Error recuperant la preferència ${key}`, error)
    return fallback
  }
}

const getStoredNumber = (key: string, fallback: number) => {
  if (!isBrowser) {
    return fallback
  }

  try {
    const stored = window.localStorage.getItem(key)
    if (!stored) {
      return fallback
    }
    const value = Number.parseInt(stored, 10)
    if (Number.isNaN(value)) {
      return fallback
    }
    return Math.min(Math.max(value, RIGHT_PANEL_MIN_WIDTH), RIGHT_PANEL_MAX_WIDTH)
  } catch (error) {
    console.warn(`Error recuperant la preferència ${key}`, error)
    return fallback
  }
}

type SurfaceAnimationStyle = CSSProperties & {
  '--surface-delay'?: string
}

const SURFACE_STYLES = {
  sidebar: { '--surface-delay': '40ms' } as SurfaceAnimationStyle,
  header: { '--surface-delay': '80ms' } as SurfaceAnimationStyle,
  search: { '--surface-delay': '140ms' } as SurfaceAnimationStyle,
  results: { '--surface-delay': '200ms' } as SurfaceAnimationStyle,
  rightPanel: { '--surface-delay': '260ms' } as SurfaceAnimationStyle,
}

type UploadStatus = 'success' | 'partial' | 'error'

interface UploadFeedbackState {
  status: UploadStatus
  summary: UploadResponse
  message: string
  timestamp: number
}

function AppContent() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<FiltersState>(() => getStoredFilters())
  const [sidebarMinimized, setSidebarMinimized] = useState(() =>
    getStoredBoolean(STORAGE_KEYS.sidebarMinimized, false),
  )
  const [rightPanelMinimized, setRightPanelMinimized] = useState(() =>
    getStoredBoolean(STORAGE_KEYS.rightPanelMinimized, false),
  )
  const [rightPanelWidth, setRightPanelWidth] = useState(() =>
    getStoredNumber(STORAGE_KEYS.rightPanelWidth, RIGHT_PANEL_DEFAULT_WIDTH),
  )
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null)
  const [diagramProcess, setDiagramProcess] = useState<Process | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [database, setDatabase] = useState<ProcessesDatabase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appReady, setAppReady] = useState(!isBrowser)
  const [dropActive, setDropActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null)
  const [uploadFeedback, setUploadFeedback] = useState<UploadFeedbackState | null>(null)
  const vodafoneLogoSrc = `${import.meta.env.BASE_URL}vodafone-logo.webp`
  const resolvedDatabasePath = useMemo(() => {
    // Si tenim una URL personalitzada, mostrar-la
    if (envDatabaseUrl.length > 0) {
      return envDatabaseUrl
    }

    if (!isBrowser) {
      return DATABASE_URL
    }
    try {
      return new URL(DATABASE_URL, window.location.href).toString()
    } catch (resolutionError) {
      console.warn('No s\'ha pogut resoldre la ruta de la base de dades', resolutionError)
      return DATABASE_URL
    }
  }, [])
  const isMountedRef = useRef(true)

  const refreshDatabase = useCallback(async () => {
    try {
      console.log('🔄 Refrescant base de dades...')
      console.log('🔧 URL completa:', new URL(DATABASE_URL, window.location.href).toString())
      const response = await fetch(DATABASE_URL, { cache: 'no-cache' })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No s'ha pogut refrescar la base de dades`)
      }
      const payload = (await response.json()) as ProcessesDatabase
      const tagColors = ensureTagColors(
        payload.tags,
        payload.processes.map((process) => process.tags),
        payload.tagColors,
      )

      setDatabase({ ...payload, tagColors })
      console.log('✅ Base de dades refrescada correctament')
    } catch (error) {
      console.error('❌ Error refrescant base de dades:', error)
    }
  }, [])

  const uploadDocuments = useCallback(
    async (files: File[]) => {
      if (!files.length) {
        return
      }

      setIsUploading(true)
      setUploadFeedback(null)

      const formData = new FormData()
      for (const file of files) {
        formData.append('files', file)
      }

      try {
        const response = await fetch(`${normalizedBaseUrl}api/upload`, {
          method: 'POST',
          body: formData,
        })

        let payload: UploadResponse
        try {
          payload = (await response.json()) as UploadResponse
        } catch (parseError) {
          throw new Error(
            parseError instanceof Error ? parseError.message : 'Resposta del servidor no vàlida',
          )
        }

        if (!response.ok) {
          const [firstError] = payload.errors
          throw new Error(firstError?.reason ?? 'Error desconegut durant la pujada')
        }

        const hasSaved = payload.saved.length > 0
        const hasErrors = payload.errors.length > 0
        let status: UploadStatus
        let message: string

        if (hasSaved && !hasErrors) {
          status = 'success'
          message = t('uploadSuccess')
        } else if (hasSaved && hasErrors) {
          status = 'partial'
          message = t('uploadPartial')
        } else {
          status = 'error'
          message = t('uploadError')
        }

        setUploadFeedback({
          status,
          summary: payload,
          message,
          timestamp: Date.now(),
        })

        // Refrescar la base de dades després d'una pujada exitosa
        if (hasSaved) {
          setTimeout(() => {
            void refreshDatabase()
          }, 1000) // Esperar 1 segon per donar temps al servidor
        }
      } catch (uploadError) {
        const reason = uploadError instanceof Error ? uploadError.message : 'Error desconegut'
        setUploadFeedback({
          status: 'error',
          summary: {
            saved: [],
            errors: files.map((file) => ({ name: file.name, reason })),
          },
          message: t('uploadError'),
          timestamp: Date.now(),
        })
      } finally {
        setIsUploading(false)
      }
    },
    [t, refreshDatabase],
  )

  const closeUploadFeedback = useCallback(() => {
    setUploadFeedback(null)
  }, [])

  useEffect(() => {
    if (!isBrowser) {
      setAppReady(true)
      return () => {}
    }
    const frame = window.requestAnimationFrame(() => setAppReady(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadDatabase = async () => {
      try {
        console.log('🔍 Carregant base de dades des de:', DATABASE_URL)
        console.log('🔧 URL completa:', new URL(DATABASE_URL, window.location.href).toString())
        const response = await fetch(DATABASE_URL, { cache: 'no-cache' })
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Base de dades no trobada a: ${DATABASE_URL}\n\nAssegura't que el fitxer processes-database.json existeix en aquesta ubicació.`)
          }
          throw new Error(`Error ${response.status}: No s'ha pogut carregar la base de dades`)
        }
        const payload = (await response.json()) as ProcessesDatabase
        const tagColors = ensureTagColors(
          payload.tags,
          payload.processes.map((process) => process.tags),
          payload.tagColors,
        )

        if (isMounted) {
          setDatabase({ ...payload, tagColors })
          setLoading(false)
          console.log('✅ Base de dades carregada correctament')
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Error desconegut carregant dades'
          console.error('❌ Error carregant base de dades:', errorMessage)
          setError(errorMessage)
          setLoading(false)
        }
      }
    }

    loadDatabase()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(
    () => () => {
      isMountedRef.current = false
    },
    [],
  )

  useEffect(() => {
    if (!isBrowser) {
      return () => {}
    }

    const dragTargets = new Set<EventTarget>()

    const hasFiles = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes('Files')

    const handleDragEnter = (event: DragEvent) => {
      if (!hasFiles(event)) {
        return
      }
      event.preventDefault()
      const target = event.target as EventTarget | null
      if (target) {
        dragTargets.add(target)
      }
      setDropActive(true)
    }

    const handleDragOver = (event: DragEvent) => {
      if (!hasFiles(event)) {
        return
      }
      event.preventDefault()
      event.dataTransfer!.dropEffect = 'copy'
    }

    const handleDragLeave = (event: DragEvent) => {
      if (!hasFiles(event)) {
        return
      }
      event.preventDefault()
      const target = event.target as EventTarget | null
      if (target) {
        dragTargets.delete(target)
      }
      const relatedTarget = event.relatedTarget as Node | null
      const stillInsideApp = Boolean(
        relatedTarget && typeof document !== 'undefined' && document.body.contains(relatedTarget),
      )
      if (!stillInsideApp && dragTargets.size === 0) {
        setDropActive(false)
      }
    }

    const handleDrop = async (event: DragEvent) => {
      if (!hasFiles(event)) {
        return
      }
      event.preventDefault()
      dragTargets.clear()
      setDropActive(false)

      const droppedFiles = Array.from(event.dataTransfer?.files ?? [])
      if (droppedFiles.length === 0) {
        return
      }

      if (event.dataTransfer) {
        event.dataTransfer.clearData()
      }

      if (droppedFiles.length > 0) {
        void uploadDocuments(droppedFiles)
      }
    }

    const useCapture = true

    window.addEventListener('dragenter', handleDragEnter, useCapture)
    window.addEventListener('dragover', handleDragOver, useCapture)
    window.addEventListener('dragleave', handleDragLeave, useCapture)
    window.addEventListener('drop', handleDrop, useCapture)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter, useCapture)
      window.removeEventListener('dragover', handleDragOver, useCapture)
      window.removeEventListener('dragleave', handleDragLeave, useCapture)
      window.removeEventListener('drop', handleDrop, useCapture)
    }
  }, [uploadDocuments])

  useEffect(() => {
    if (!isBrowser) {
      return () => {}
    }

    if (!uploadStatus || uploadStatus === 'success') {
      return () => {}
    }

    const timeout = window.setTimeout(() => {
      if (isMountedRef.current) {
        setUploadStatus(null)
      }
    }, 4000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [uploadStatus])

  useEffect(() => {
    if (!isBrowser) {
      return
    }
    window.localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(filters))
  }, [filters])

  useEffect(() => {
    if (!isBrowser) {
      return
    }
    window.localStorage.setItem(STORAGE_KEYS.sidebarMinimized, String(sidebarMinimized))
  }, [sidebarMinimized])

  useEffect(() => {
    if (!isBrowser) {
      return
    }
    window.localStorage.setItem(STORAGE_KEYS.rightPanelMinimized, String(rightPanelMinimized))
  }, [rightPanelMinimized])

  useEffect(() => {
    if (!isBrowser || rightPanelMinimized) {
      return
    }
    window.localStorage.setItem(STORAGE_KEYS.rightPanelWidth, String(Math.round(rightPanelWidth)))
  }, [rightPanelWidth, rightPanelMinimized])

  useEffect(
    () => () => {
      document.body.classList.remove('resizing')
    },
    [],
  )

  useEffect(() => {
    if (!isBrowser || !uploadFeedback) {
      return
    }

    const timeout = window.setTimeout(() => {
      setUploadFeedback((current) => {
        if (!current || current.timestamp !== uploadFeedback.timestamp) {
          return current
        }
        return null
      })
    }, 6000)

    return () => window.clearTimeout(timeout)
  }, [uploadFeedback])

  const processes = database?.processes ?? []
  const categories = database ? sortOptions(database.categories) : []
  const mechanisms = database ? sortOptions(database.mechanisms) : []
  const objects = database ? sortOptions(database.objects) : []
  const integrations = database ? sortOptions(database.integrations) : []
  const tags = database ? sortOptions(database.tags) : []

  useEffect(() => {
    if (!database) {
      return
    }

    setFilters((previous) => {
      let hasChanged = false
      const next = { ...previous }

      if (previous.category && !database.categories.includes(previous.category)) {
        next.category = ''
        hasChanged = true
      }

      if (previous.mechanism && !database.mechanisms.includes(previous.mechanism)) {
        next.mechanism = ''
        hasChanged = true
      }

      if (previous.object && !database.objects.includes(previous.object)) {
        next.object = ''
        hasChanged = true
      }

      if (previous.integration && !database.integrations.includes(previous.integration)) {
        next.integration = ''
        hasChanged = true
      }

      if (previous.tag && !database.tags.includes(previous.tag)) {
        next.tag = ''
        hasChanged = true
      }

      return hasChanged ? next : previous
    })
  }, [database])

  const filteredProcesses = useMemo(() => {
    if (!database) {
      return []
    }

    const searchTerm = filters.search.trim().toLowerCase()

    return database.processes.filter((process) => {
      const matchesSearch =
        !searchTerm ||
        process.name.toLowerCase().includes(searchTerm) ||
        process.description.toLowerCase().includes(searchTerm) ||
        process.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
        process.objects.some((item) => item.toLowerCase().includes(searchTerm)) ||
        process.integrations.some((item) => item.toLowerCase().includes(searchTerm)) ||
        process.mechanism.toLowerCase().includes(searchTerm)

      const matchesCategory = !filters.category || process.category === filters.category
      const matchesMechanism = !filters.mechanism || process.mechanism === filters.mechanism
      const matchesObject = !filters.object || process.objects.includes(filters.object)
      const matchesIntegration =
        !filters.integration || process.integrations.includes(filters.integration)
      const matchesTag = !filters.tag || process.tags.includes(filters.tag)

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMechanism &&
        matchesObject &&
        matchesIntegration &&
        matchesTag
      )
    })
  }, [database, filters])

  const selectedProcess = useMemo(
    () => filteredProcesses.find((process) => process.id === selectedProcessId) ?? null,
    [filteredProcesses, selectedProcessId],
  )

  useEffect(() => {
    if (!filteredProcesses.some((process) => process.id === selectedProcessId)) {
      setSelectedProcessId(null)
    }
  }, [filteredProcesses, selectedProcessId])

  useEffect(() => {
    if (selectedProcess && rightPanelMinimized) {
      setRightPanelMinimized(false)
    }
  }, [selectedProcess, rightPanelMinimized])

  const handleFilterChange = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  const handleSelectProcess = (process: Process) => {
    setSelectedProcessId(process.id)
  }

  const handleClearSearch = () => {
    handleFilterChange('search', '')
  }

  const handleTagClick = (tag: string) => {
    setFilters((previous) => ({
      ...previous,
      search: '',
      tag,
    }))
  }

  const handleUpdateProcessTags = (processId: string, payload: TagUpdatePayload) => {
    setDatabase((previous) => {
      if (!previous) {
        return previous
      }

      const nextTags = payload.tags
      const uniqueTags = Array.from(new Set(nextTags.map((tag) => tag.trim()).filter(Boolean)))
      const sortedProcessTags = sortOptions(uniqueTags)
      const mergedTagColors = { ...previous.tagColors, ...payload.tagColors }

      for (const tag of sortedProcessTags) {
        if (!mergedTagColors[tag]) {
          mergedTagColors[tag] = DEFAULT_TAG_COLOR
        }
      }

      const processes = previous.processes.map((process) =>
        process.id === processId ? { ...process, tags: sortedProcessTags } : process,
      )

      const allTags = sortOptions(
        Array.from(new Set(processes.flatMap((process) => process.tags))),
      )

      const tagColors: Record<string, string> = {}
      for (const tag of allTags) {
        tagColors[tag] = mergedTagColors[tag] ?? DEFAULT_TAG_COLOR
      }

      return {
        ...previous,
        processes,
        tags: allTags,
        tagColors,
      }
    })
  }

  const handleUpdateGlobalTags = (payload: TagUpdatePayload) => {
    setDatabase((previous) => {
      if (!previous) {
        return previous
      }

      const nextTags = payload.tags
      const uniqueTags = Array.from(new Set(nextTags.map((tag) => tag.trim()).filter(Boolean)))
      const sortedGlobalTags = sortOptions(uniqueTags)
      const mergedTagColors = { ...previous.tagColors, ...payload.tagColors }

      for (const tag of sortedGlobalTags) {
        if (!mergedTagColors[tag]) {
          mergedTagColors[tag] = DEFAULT_TAG_COLOR
        }
      }

      return {
        ...previous,
        tags: sortedGlobalTags,
        tagColors: mergedTagColors,
      }
    })
  }

  const handleShowDiagram = (process: Process) => {
    if (!process.diagram) {
      return
    }
    setDiagramProcess(process)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setDiagramProcess(null)
  }

  const resetFilters = () => {
    setFilters(initialFilters)
    setSelectedProcessId(null)
  }

  const toggleSidebar = () => {
    setSidebarMinimized((previous) => !previous)
  }

  const toggleRightPanel = () => {
    setRightPanelMinimized((previous) => !previous)
  }

  const handleRightPanelResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (rightPanelMinimized) {
      return
    }
    event.preventDefault()

    const startX = event.clientX
    const startWidth = rightPanelWidth

    const handleMove = (moveEvent: PointerEvent) => {
      const delta = startX - moveEvent.clientX
      const nextWidth = Math.min(
        Math.max(startWidth + delta, RIGHT_PANEL_MIN_WIDTH),
        RIGHT_PANEL_MAX_WIDTH,
      )
      setRightPanelWidth(nextWidth)
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      document.body.classList.remove('resizing')
    }

    document.body.classList.add('resizing')
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  if (loading) {
    return <div className="loading-state">Carregant base de coneixement…</div>
  }

  if (error) {
    return (
      <div className="loading-state error">
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Reintenta
        </button>
      </div>
    )
  }

  const containerClassName = [
    'app-container',
    sidebarMinimized ? 'sidebar-minimized' : '',
    rightPanelMinimized ? 'right-panel-minimized' : '',
    appReady ? 'app-ready' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const uploadStatusClass =
    isUploading && !uploadFeedback ? 'uploading' : uploadFeedback?.status ?? 'idle'
  const uploadMessage = isUploading ? t('uploading') : uploadFeedback?.message ?? ''
  const savedFiles = uploadFeedback?.summary.saved ?? []
  const failedFiles = uploadFeedback?.summary.errors ?? []

  return (
    <>
      <div className="background-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <div className={containerClassName}>
        <Sidebar
          categories={categories}
          mechanisms={mechanisms}
          objects={objects}
          integrations={integrations}
          tags={tags}
          filters={filters}
          onFilterChange={(key, value) => handleFilterChange(key, value)}
          minimized={sidebarMinimized}
          onToggle={toggleSidebar}
          className="surface-card"
          style={SURFACE_STYLES.sidebar}
        />

        <main className="main-content">
          <header className="header surface-card" style={SURFACE_STYLES.header}>
            <div className="header-content">
              <div className="header-title-group">
                <img src={vodafoneLogoSrc} alt="Vodafone" className="vodafone-logo-img" />
                <div>
                  <h1 className="header-title">{t('knowledgeBase')}</h1>
                  <p className="header-subtitle">
                    {t('businessProcessesSubtitle')}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <OptionsMenu
                  availableTags={tags}
                  tagColors={database?.tagColors ?? {}}
                  onUpdateTags={handleUpdateProcessTags}
                  onUpdateGlobalTags={handleUpdateGlobalTags}
                  selectedProcessId={selectedProcessId}
                  databasePath={resolvedDatabasePath}
                  onInitializeDatabaseSuccess={() => void refreshDatabase()}
                />
                <LanguageSelector />
                <button type="button" className="back-btn" onClick={resetFilters}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                  {t('back')}
                </button>
              </div>
            </div>
          </header>

          <section className="controls-area surface-card" style={SURFACE_STYLES.search}>
            <SearchBar
              value={filters.search}
              onChange={(value) => handleFilterChange('search', value)}
              onClear={handleClearSearch}
            />

            <FiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              objects={objects}
              integrations={integrations}
              categories={categories}
              mechanisms={mechanisms}
              tags={tags}
              total={processes.length}
              filtered={filteredProcesses.length}
              onViewChange={(view) => handleFilterChange('view', view)}
            />
          </section>

          <section className="results-section surface-card" style={SURFACE_STYLES.results}>
          <ProcessResults
            processes={filteredProcesses}
            view={filters.view}
            onSelect={handleSelectProcess}
            onTagClick={handleTagClick}
            onShowDiagram={handleShowDiagram}
            tagColors={database?.tagColors ?? {}}
          />
        </section>
        </main>

        <RightPanel
          process={selectedProcess}
          onClose={() => setSelectedProcessId(null)}
          minimized={rightPanelMinimized}
          width={rightPanelWidth}
          onToggle={toggleRightPanel}
          onResizeStart={handleRightPanelResizeStart}
          className="surface-card"
          surfaceStyle={SURFACE_STYLES.rightPanel}
        />

        <DiagramModal process={diagramProcess} isOpen={isModalOpen} onClose={closeModal} />
      </div>

      {sidebarMinimized && (
        <button
          type="button"
          className="panel-toggle-button sidebar-open-btn"
          onClick={() => setSidebarMinimized(false)}
          aria-label="Mostrar navegació"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6l6 6-6 6" />
          </svg>
        </button>
      )}

      {rightPanelMinimized && (
        <button
          type="button"
          className="panel-toggle-button right-panel-open-btn"
          onClick={() => setRightPanelMinimized(false)}
          aria-label="Mostrar panell de previsualització"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 6l-6 6 6 6" />
          </svg>
        </button>
      )}

      {dropActive && (
        <div className="global-dropzone" role="presentation">
          <div className="global-dropzone__content">
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 24 24"
              className="global-dropzone__icon"
            >
              <path
                d="M12 16V4m0 0L7 9m5-5 5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 16.5v1.75A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V16.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="global-dropzone__title">{t('dropzoneTitle')}</p>
            <p className="global-dropzone__subtitle">{t('dropzoneSubtitle')}</p>
          </div>
        </div>
      )}

      {uploadFeedback && (
        <aside className={`upload-feedback upload-feedback--${uploadStatusClass}`} aria-live="polite">
          <div className="upload-feedback__header">
            <p className="upload-feedback__title">{uploadMessage}</p>
            {uploadFeedback && (
              <button
                type="button"
                className="upload-feedback__close"
                onClick={closeUploadFeedback}
                aria-label={t('close')}
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>

          {uploadFeedback && (
            <div className="upload-feedback__body">
              {savedFiles.length > 0 && (
                <div>
                  <p className="upload-feedback__section-title">{t('savedFiles')}</p>
                  <button
                    type="button"
                    className="upload-feedback__refresh-btn"
                    onClick={() => void refreshDatabase()}
                    aria-label={t('refreshDatabase')}
                  >
                    🔄 {t('refreshDatabase')}
                  </button>
                  <ul>
                    {savedFiles.map((file) => (
                      <li key={`${file.originalName}-${file.storedName}`}>
                        <span className="upload-feedback__file-name">{file.originalName}</span>
                        <span className="upload-feedback__file-path">{file.directory}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {failedFiles.length > 0 && (
                <div>
                  <p className="upload-feedback__section-title">{t('failedFiles')}</p>
                  <ul>
                    {failedFiles.map((file) => (
                      <li key={`${file.name}-${file.reason}`}>
                        <span className="upload-feedback__file-name">{file.name}</span>
                        <span className="upload-feedback__file-error">{file.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </aside>
      )}
    </>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App
