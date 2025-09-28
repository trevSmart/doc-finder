'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ClipMetadata, ClipRegistry, ClipStorage, CompoundClip } from '../types/clip'

interface ClipContextValue {
  clips: ClipRegistry
  compoundClips: CompoundClip[]
  getClip: (filePath: string) => ClipMetadata | undefined
  getClipTitle: (filePath: string, fallbackName?: string) => string
  updateClipTitle: (filePath: string, title: string) => void
  clearClip: (filePath: string) => void
  createCompoundClip: (filePaths: string[], title?: string) => CompoundClip | null
  updateCompoundClipTitle: (clipId: string, title: string) => void
  removeCompoundClip: (clipId: string) => void
}

const ClipContext = createContext<ClipContextValue | undefined>(undefined)

const STORAGE_KEY = 'docfinder-clips'

export function ClipProvider({ children }: { children: ReactNode }) {
  const [storage, setStorage] = useState<ClipStorage>({ overrides: {}, compoundClips: [] })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          if ('overrides' in parsed || 'compoundClips' in parsed) {
            const overrides =
              parsed.overrides && typeof parsed.overrides === 'object' && !Array.isArray(parsed.overrides)
                ? (parsed.overrides as ClipRegistry)
                : {}
            const compoundClips = Array.isArray(parsed.compoundClips)
              ? (parsed.compoundClips as CompoundClip[])
              : []

            setStorage({ overrides, compoundClips })
          } else {
            // Backwards compatibility with the initial storage format
            setStorage({ overrides: parsed as ClipRegistry, compoundClips: [] })
          }
        }
      }
    } catch {
      // Ignore storage errors silently
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
    } catch {
      // Ignore storage errors silently
    }
  }, [storage, isLoaded])

  const updateClipTitle = useCallback((filePath: string, title: string) => {
    if (!filePath) {
      return
    }

    const trimmed = title.trim()
    setStorage(prev => {
      if (!trimmed) {
        if (!(filePath in prev.overrides)) {
          return prev
        }

        const nextOverrides = { ...prev.overrides }
        delete nextOverrides[filePath]
        return { ...prev, overrides: nextOverrides }
      }

      const now = new Date().toISOString()
      const existing = prev.overrides[filePath]

      return {
        ...prev,
        overrides: {
          ...prev.overrides,
          [filePath]: {
            filePath,
            title: trimmed,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          },
        },
      }
    })
  }, [])

  const clearClip = useCallback((filePath: string) => {
    if (!filePath) {
      return
    }

    setStorage(prev => {
      if (!(filePath in prev.overrides)) {
        return prev
      }

      const nextOverrides = { ...prev.overrides }
      delete nextOverrides[filePath]
      return { ...prev, overrides: nextOverrides }
    })
  }, [])

  const getClip = useCallback((filePath: string) => {
    if (!filePath) {
      return undefined
    }

    return storage.overrides[filePath]
  }, [storage.overrides])

  const getClipTitle = useCallback(
    (filePath: string, fallbackName?: string) => {
      if (!filePath) {
        return fallbackName ?? ''
      }

      const clip = storage.overrides[filePath]
      if (clip && clip.title.trim()) {
        return clip.title
      }

      return fallbackName ?? ''
    },
    [storage.overrides],
  )

  const createCompoundClip = useCallback((filePaths: string[], title?: string) => {
    const uniquePaths = Array.from(new Set(filePaths.filter(Boolean)))
    if (uniquePaths.length < 2) {
      return null
    }

    let createdClip: CompoundClip | null = null
    const trimmedTitle = title?.trim()

    setStorage(prev => {
      const normalizedNew = [...uniquePaths].sort()

      const existing = prev.compoundClips.find(clip => {
        const normalizedExisting = [...clip.filePaths].sort()
        if (normalizedExisting.length !== normalizedNew.length) {
          return false
        }
        return normalizedExisting.every((path, index) => path === normalizedNew[index])
      })

      if (existing) {
        if (trimmedTitle && trimmedTitle !== existing.title) {
          const now = new Date().toISOString()
          const updatedClip: CompoundClip = {
            ...existing,
            title: trimmedTitle,
            updatedAt: now,
          }
          createdClip = updatedClip
          return {
            ...prev,
            compoundClips: prev.compoundClips.map(clip => (clip.id === existing.id ? updatedClip : clip)),
          }
        }

        createdClip = existing
        return prev
      }

      const now = new Date().toISOString()
      const generateId = () => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          return crypto.randomUUID()
        }
        return `clip-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      }

      const newClip: CompoundClip = {
        id: generateId(),
        title: trimmedTitle || 'New clip',
        filePaths: uniquePaths,
        createdAt: now,
        updatedAt: now,
      }

      createdClip = newClip
      return {
        ...prev,
        compoundClips: [...prev.compoundClips, newClip],
      }
    })

    return createdClip
  }, [])

  const updateCompoundClipTitle = useCallback((clipId: string, title: string) => {
    const trimmed = title.trim()
    if (!clipId || !trimmed) {
      return
    }

    setStorage(prev => {
      const index = prev.compoundClips.findIndex(clip => clip.id === clipId)
      if (index === -1) {
        return prev
      }

      const now = new Date().toISOString()
      const updatedClip: CompoundClip = {
        ...prev.compoundClips[index],
        title: trimmed,
        updatedAt: now,
      }

      const nextClips = [...prev.compoundClips]
      nextClips.splice(index, 1, updatedClip)

      return {
        ...prev,
        compoundClips: nextClips,
      }
    })
  }, [])

  const removeCompoundClip = useCallback((clipId: string) => {
    if (!clipId) {
      return
    }

    setStorage(prev => {
      const nextClips = prev.compoundClips.filter(clip => clip.id !== clipId)
      if (nextClips.length === prev.compoundClips.length) {
        return prev
      }

      return {
        ...prev,
        compoundClips: nextClips,
      }
    })
  }, [])

  const value = useMemo<ClipContextValue>(
    () => ({
      clips: storage.overrides,
      compoundClips: storage.compoundClips,
      getClip,
      getClipTitle,
      updateClipTitle,
      clearClip,
      createCompoundClip,
      updateCompoundClipTitle,
      removeCompoundClip,
    }),
    [storage, getClip, getClipTitle, updateClipTitle, clearClip, createCompoundClip, updateCompoundClipTitle, removeCompoundClip],
  )

  return <ClipContext.Provider value={value}>{children}</ClipContext.Provider>
}

export function useClips() {
  const context = useContext(ClipContext)
  if (context === undefined) {
    throw new Error('useClips must be used within a ClipProvider')
  }
  return context
}
