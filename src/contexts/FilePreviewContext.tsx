'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { FileItem } from '../types/file'
import { PreviewResponse } from '../types/filePreview'
import { isImageFile } from '../utils/fileUtils'

const MAX_CONCURRENT_PREVIEWS = 3

type PreviewStatus = 'idle' | 'queued' | 'loading' | 'success' | 'error'

interface PreviewCacheEntry {
  status: PreviewStatus
  data: PreviewResponse | null
  error: string | null
  lastFetched: number | null
}

interface PreviewTask {
  file: FileItem
  priority: 'high' | 'normal'
}

interface FilePreviewContextValue {
  ensurePreview: (file: FileItem, options?: { priority?: 'high' | 'normal' }) => void
  getEntry: (path: string) => PreviewCacheEntry | undefined
}

const FilePreviewContext = createContext<FilePreviewContextValue | undefined>(undefined)

const createDefaultEntry = (): PreviewCacheEntry => ({
  status: 'idle',
  data: null,
  error: null,
  lastFetched: null,
})

export function FilePreviewProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Record<string, PreviewCacheEntry>>({})

  const queueRef = useRef<PreviewTask[]>([])
  const pendingRef = useRef<Set<string>>(new Set())
  const activeCountRef = useRef(0)
  const processQueueRef = useRef<() => void>(() => {})

  const startTask = useCallback((task: PreviewTask) => {
    const { file } = task
    const path = file.path

    setCache(prev => {
      const previous = prev[path] ?? createDefaultEntry()
      return {
        ...prev,
        [path]: {
          ...previous,
          status: 'loading',
          error: null,
        },
      }
    })

    const loadPreview = async () => {
      try {
        const response = await fetch(`/api/file-preview?path=${encodeURIComponent(path)}`)
        let data: PreviewResponse | null = null

        try {
          data = (await response.json()) as PreviewResponse
        } catch {
          data = null
        }

        if (!response.ok) {
          const errorMessage =
            (data && typeof data === 'object' && data !== null && 'error' in data && typeof (data as { error?: unknown }).error === 'string'
              ? (data as { error?: string }).error
              : undefined) ?? 'Failed to load preview content'
          throw new Error(errorMessage)
        }

        setCache(prev => ({
          ...prev,
          [path]: {
            status: 'success',
            data,
            error: null,
            lastFetched: Date.now(),
          },
        }))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error loading preview'
        setCache(prev => {
          const previous = prev[path] ?? createDefaultEntry()
          return {
            ...prev,
            [path]: {
              ...previous,
              status: 'error',
              error: errorMessage,
              lastFetched: Date.now(),
            },
          }
        })
      } finally {
        pendingRef.current.delete(path)
        activeCountRef.current = Math.max(0, activeCountRef.current - 1)
        processQueueRef.current()
      }
    }

    loadPreview()
  }, [])

  const processQueue = useCallback(() => {
    if (activeCountRef.current >= MAX_CONCURRENT_PREVIEWS) {
      return
    }

    const nextIndex = queueRef.current.findIndex(task => task.priority === 'high')
    const task = nextIndex >= 0 ? queueRef.current.splice(nextIndex, 1)[0] : queueRef.current.shift()

    if (!task) {
      return
    }

    activeCountRef.current += 1
    startTask(task)

    if (activeCountRef.current < MAX_CONCURRENT_PREVIEWS) {
      processQueueRef.current()
    }
  }, [startTask])

  useEffect(() => {
    processQueueRef.current = processQueue
  }, [processQueue])

  const ensurePreview = useCallback(
    (file: FileItem, options?: { priority?: 'high' | 'normal' }) => {
      if (file.isDirectory) {
        return
      }

      const path = file.path
      const existing = cache[path]

      if (existing?.status === 'success' || existing?.status === 'loading') {
        return
      }

      if (existing?.status === 'queued') {
        if (options?.priority === 'high') {
          queueRef.current = queueRef.current.filter(task => task.file.path !== path)
          queueRef.current.unshift({ file, priority: 'high' })
          processQueueRef.current()
        }
        return
      }

      if (isImageFile(file.name) && file.imageUrl) {
        setCache(prev => ({
          ...prev,
          [path]: {
            status: 'success',
            data: { type: 'image', url: file.imageUrl },
            error: null,
            lastFetched: Date.now(),
          },
        }))
        return
      }

      pendingRef.current.add(path)

      setCache(prev => ({
        ...prev,
        [path]: {
          ...(prev[path] ?? createDefaultEntry()),
          status: 'queued',
          error: null,
        },
      }))

      queueRef.current = queueRef.current.filter(task => task.file.path !== path)

      const task: PreviewTask = {
        file,
        priority: options?.priority ?? 'normal',
      }

      if (task.priority === 'high') {
        queueRef.current.unshift(task)
      } else {
        queueRef.current.push(task)
      }

      processQueueRef.current()
    },
    [cache]
  )

  const getEntry = useCallback(
    (path: string) => {
      return cache[path]
    },
    [cache]
  )

  const contextValue = useMemo<FilePreviewContextValue>(
    () => ({
      ensurePreview,
      getEntry,
    }),
    [ensurePreview, getEntry]
  )

  return <FilePreviewContext.Provider value={contextValue}>{children}</FilePreviewContext.Provider>
}

export function useFilePreviewContext() {
  const context = useContext(FilePreviewContext)
  if (context === undefined) {
    throw new Error('useFilePreviewContext must be used within a FilePreviewProvider')
  }
  return context
}

export function useFilePreview(
  file: FileItem,
  options?: { auto?: boolean; priority?: 'high' | 'normal' }
) {
  const { ensurePreview, getEntry } = useFilePreviewContext()
  const auto = options?.auto ?? true
  const priority = options?.priority ?? 'normal'

  useEffect(() => {
    if (!auto) {
      return
    }
    ensurePreview(file, { priority })
  }, [auto, ensurePreview, file, priority])

  const entry = getEntry(file.path) ?? createDefaultEntry()

  const requestPreview = useCallback(
    (config?: { priority?: 'high' | 'normal' }) => {
      ensurePreview(file, { priority: config?.priority ?? 'normal' })
    },
    [ensurePreview, file]
  )

  return { entry, requestPreview }
}
