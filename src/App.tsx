import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type {
  FiltersState,
  Process,
  ProcessesDatabase,
  TagUpdatePayload,
  UploadResponse,
} from './types'
import { DEFAULT_TAG_COLOR, ensureTagColors } from './tagColors'
import { Sidebar } from './components/Sidebar.tsx'
import { SearchBar } from './components/SearchBar.tsx'
import { FiltersPanel } from './components/FiltersPanel.tsx'
import { ProcessResults } from './components/ProcessResults.tsx'
import { RightPanel } from './components/RightPanel.tsx'
import { DiagramModal } from './components/DiagramModal.tsx'
import { OptionsMenu } from './components/OptionsMenu.tsx'
import { LanguageProvider } from './LanguageContext'
import { LanguageSelector } from './components/LanguageSelector.tsx'
import { useTranslation } from './useTranslation'

const SORT_LOCALE = 'ca'
const DEFAULT_DATABASE_PATH = 'processes-database.json'
const baseUrl = import.meta.env.BASE_URL ?? '/'
const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
const envDatabaseUrlCandidate: unknown = import.meta.env.VITE_DATABASE_URL
const envDatabaseUrl =
  typeof envDatabaseUrlCandidate === 'string' ? envDatabaseUrlCandidate.trim() : ''
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

    void loadDatabase()

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
      return undefined
    }

    const dragTargets = new Set<EventTarget>()

    const hasFiles = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes('Files')

    const handleDragEnter = (event: DragEvent) => {
      if (!hasFiles(event)) {
        return
      }
      event.preventDefault()
      const target = event.target
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
      const target = event.target
      if (target) {
        dragTargets.delete(target)
      }
      const relatedTarget = event.relatedTarget
      const stillInsideApp =
        relatedTarget instanceof Node &&
        typeof document !== 'undefined' &&
        document.body.contains(relatedTarget)
      if (!stillInsideApp && dragTargets.size === 0) {
        setDropActive(false)
      }
    }

    const handleDrop = (event: DragEvent) => {
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
      return undefined
    }

    if (!uploadStatus || uploadStatus === 'success') {
      return undefined
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="glass-panel flex flex-col items-center gap-4 px-10 py-8 text-center">
          <span className="h-12 w-12 animate-spin rounded-full border-2 border-violet-400/60 border-t-transparent" />
          <p className="text-sm text-white/70">Carregant base de coneixement…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="glass-panel max-w-md space-y-6 border border-rose-400/40 bg-rose-500/10 px-10 py-8 text-center text-rose-100">
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.3" className="mx-auto h-12 w-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v10M20 26h.01" />
            <path d="M20 6L4 34h32L20 6z" />
          </svg>
          <p className="text-sm text-rose-100/80">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="ring-focus inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-rose-500/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500/50"
          >
            Reintenta
          </button>
        </div>
      </div>
    )
  }

  const totalProcesses = processes.length
  const filteredCount = filteredProcesses.length
  const uploadState: UploadStatus | 'uploading' | null =
    isUploading && !uploadFeedback ? 'uploading' : uploadFeedback?.status ?? null
  const uploadMessage = isUploading ? t('uploading') : uploadFeedback?.message ?? ''
  const savedFiles = uploadFeedback?.summary.saved ?? []
  const failedFiles = uploadFeedback?.summary.errors ?? []

  const uploadVariants = {
    uploading: {
      className: 'border-violet-400/40 bg-violet-500/10 text-violet-100',
      icon: (
        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ),
    },
    success: {
      className: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l3 3 7-7" />
        </svg>
      ),
    },
    partial: {
      className: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6v5m0 3h.01" />
          <circle cx="10" cy="10" r="7" />
        </svg>
      ),
    },
    error: {
      className: 'border-rose-400/40 bg-rose-500/10 text-rose-100',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l6 6m0-6l-6 6" />
          <circle cx="10" cy="10" r="7" />
        </svg>
      ),
    },
  } as const

  const activeUploadVariant = uploadState ? uploadVariants[uploadState] : null

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 top-[-15%] h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-[180px]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-[200px]" />
          <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[160px]" />
        </div>

        <div className="relative flex min-h-screen flex-col lg:flex-row">
          <Sidebar
            categories={categories}
            mechanisms={mechanisms}
            objects={objects}
            integrations={integrations}
            tags={tags}
            filters={filters}
            onFilterChange={handleFilterChange}
            minimized={sidebarMinimized}
            onToggle={toggleSidebar}
          />

          <div className="flex flex-1 flex-col gap-6 px-6 pb-12 pt-8 lg:px-10">
            <header className="glass-panel flex flex-col gap-6 p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <img src={vodafoneLogoSrc} alt="Vodafone" className="h-8 w-auto" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">{t('businessProcesses')}</p>
                    <h1 className="mt-1 text-3xl font-semibold text-white">{t('knowledgeBase')}</h1>
                    <p className="mt-2 text-sm text-white/60">{t('businessProcessesSubtitle')}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
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
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="ring-focus inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/20 hover:text-white"
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6l-4 4 4 4" />
                    </svg>
                    {t('back')}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 4v12" />
                  </svg>
                  <span className="text-sm font-semibold text-white">{filteredCount}</span>
                  <span>
                    {t('resultsCount')} {totalProcesses}
                  </span>
                </span>
                <span className="truncate text-xs text-white/50">{resolvedDatabasePath}</span>
              </div>
            </header>

            <SearchBar
              value={filters.search}
              onChange={(value: string) => handleFilterChange('search', value)}
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
              total={totalProcesses}
              filtered={filteredCount}
              onViewChange={(view: typeof filters.view) => handleFilterChange('view', view)}
            />

            <section className="glass-panel flex-1 overflow-hidden p-6 lg:p-8">
              <ProcessResults
                processes={filteredProcesses}
                view={filters.view}
                onSelect={handleSelectProcess}
                onTagClick={handleTagClick}
                onShowDiagram={handleShowDiagram}
                tagColors={database?.tagColors ?? {}}
              />
            </section>
          </div>

          <RightPanel
            process={selectedProcess}
            onClose={() => setSelectedProcessId(null)}
            minimized={rightPanelMinimized}
            width={rightPanelWidth}
            onToggle={toggleRightPanel}
            onResizeStart={handleRightPanelResizeStart}
            tagColors={database?.tagColors ?? {}}
          />
        </div>
      </div>

      <DiagramModal process={diagramProcess} isOpen={isModalOpen} onClose={closeModal} />

      {dropActive && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-violet-500/10 p-6 text-center text-white/80 backdrop-blur">
          <div className="glass-panel flex max-w-md flex-col items-center gap-4 px-10 py-8">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7 9m5-5 5 5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 16.5v1.75A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V16.5" />
            </svg>
            <p className="text-lg font-semibold text-white">{t('dropzoneTitle')}</p>
            <p className="text-sm text-white/70">{t('dropzoneSubtitle')}</p>
          </div>
        </div>
      )}

      {activeUploadVariant && (
        <aside
          className={`fixed bottom-6 right-6 z-40 max-w-md rounded-3xl border px-6 py-5 shadow-2xl backdrop-blur ${activeUploadVariant.className}`}
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10">
                {activeUploadVariant.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{uploadMessage}</p>
                <p className="text-xs text-white/70">
                  {savedFiles.length} OK · {failedFiles.length} KO
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeUploadFeedback}
              className="ring-focus inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:border-white/20 hover:bg-white/20 hover:text-white"
              aria-label={t('close')}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 14l8-8M6 6l8 8" />
              </svg>
            </button>
          </div>

          {savedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">{t('savedFiles')}</p>
                <button
                  type="button"
                  onClick={() => void refreshDatabase()}
                  className="ring-focus inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80 transition hover:border-white/20 hover:bg-white/20 hover:text-white"
                >
                  🔄 {t('refreshDatabase')}
                </button>
              </div>
              <ul className="space-y-1 text-xs text-white/70">
                {savedFiles.map((file) => (
                  <li
                    key={`${file.originalName}-${file.storedName}`}
                    className="flex flex-col rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <span className="font-medium text-white">{file.originalName}</span>
                    <span className="text-[11px] text-white/60">{file.directory}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {failedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">{t('failedFiles')}</p>
              <ul className="space-y-1 text-xs text-white/70">
                {failedFiles.map((file) => (
                  <li key={`${file.name}-${file.reason}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="font-medium text-white">{file.name}</span>
                    <span className="text-[11px] text-white/60">{file.reason}</span>
                  </li>
                ))}
              </ul>
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
