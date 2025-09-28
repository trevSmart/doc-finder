'use client'

import { useEffect } from 'react'
import { useFileListCache } from '../contexts/FileListContext'
import { FileItem } from '../types/file'

// Share in-flight network calls per folder to avoid duplicate fetches
const inFlightRequests = new Map<string, AbortController>()

export function useFileList(folderPath: string) {
  const { cache, updateCacheEntry } = useFileListCache()
  const cacheEntry = folderPath ? cache[folderPath] : undefined
  const hasValidData = Boolean(cacheEntry?.lastFetched) && !cacheEntry?.error

  useEffect(() => {
    if (!folderPath) {
      return
    }

    if (
      hasValidData ||
      cacheEntry?.loading ||
      (cacheEntry?.error && cacheEntry.lastFetched) ||
      inFlightRequests.has(folderPath)
    ) {
      return
    }

    const controller = new AbortController()
    inFlightRequests.set(folderPath, controller)

    const fetchFiles = async () => {
      updateCacheEntry(folderPath, { loading: true, error: null })

      try {
        const response = await fetch(`/api/files?path=${encodeURIComponent(folderPath)}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          let errorMessage = 'Failed to fetch files'
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            // Ignore JSON parse errors for error responses
          }
          throw new Error(errorMessage)
        }

        const data = (await response.json()) as { files: FileItem[] }

        updateCacheEntry(folderPath, {
          files: data.files,
          loading: false,
          error: null,
          lastFetched: Date.now(),
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al carregar els fitxers'
        updateCacheEntry(folderPath, {
          loading: false,
          error: errorMessage,
          lastFetched: Date.now(),
        })
      } finally {
        if (inFlightRequests.get(folderPath) === controller) {
          inFlightRequests.delete(folderPath)
        }
      }
    }

    fetchFiles()
  }, [folderPath, cacheEntry?.error, cacheEntry?.lastFetched, cacheEntry?.loading, hasValidData, updateCacheEntry])

  return {
    files: cacheEntry?.files ?? [],
    loading: cacheEntry?.loading ?? false,
    error: cacheEntry?.error ?? null,
  }
}
