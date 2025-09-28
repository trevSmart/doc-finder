'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { FileItem } from '../types/file'

interface CachedFileListEntry {
  files: FileItem[]
  loading: boolean
  error: string | null
  lastFetched: number | null
}

type FileListCache = Record<string, CachedFileListEntry>

interface FileListContextValue {
  cache: FileListCache
  updateCacheEntry: (path: string, entry: Partial<CachedFileListEntry>) => void
  clearCacheEntry: (path?: string) => void
}

const FileListContext = createContext<FileListContextValue | undefined>(undefined)

const createDefaultEntry = (): CachedFileListEntry => ({
  files: [],
  loading: false,
  error: null,
  lastFetched: null,
})

export function FileListProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<FileListCache>({})

  const updateCacheEntry = useCallback((path: string, entry: Partial<CachedFileListEntry>) => {
    if (!path) {
      return
    }

    setCache(prev => {
      const previous = prev[path] ?? createDefaultEntry()
      return {
        ...prev,
        [path]: {
          ...previous,
          ...entry,
          files: entry.files ?? previous.files,
          loading: entry.loading ?? previous.loading,
          error: entry.error ?? previous.error,
          lastFetched: entry.lastFetched ?? previous.lastFetched,
        },
      }
    })
  }, [])

  const clearCacheEntry = useCallback((path?: string) => {
    if (!path) {
      setCache({})
      return
    }

    setCache(prev => {
      const nextCache = { ...prev }
      delete nextCache[path]
      return nextCache
    })
  }, [])

  const value = useMemo<FileListContextValue>(() => ({
    cache,
    updateCacheEntry,
    clearCacheEntry,
  }), [cache, updateCacheEntry, clearCacheEntry])

  return (
    <FileListContext.Provider value={value}>
      {children}
    </FileListContext.Provider>
  )
}

export function useFileListCache() {
  const context = useContext(FileListContext)
  if (context === undefined) {
    throw new Error('useFileListCache must be used within a FileListProvider')
  }
  return context
}
