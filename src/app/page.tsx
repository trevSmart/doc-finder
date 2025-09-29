'use client'

import { useState, useEffect, useMemo, useCallback, useRef, type MouseEvent, type DragEvent } from 'react'
import FilePreview from '../components/FilePreview'
import { useSettings } from '../contexts/SettingsContext'
import { useFileDetails } from '../contexts/FileDetailsContext'
import { useSearch } from '../contexts/SearchContext'
import { useFileTags } from '../contexts/FileTagsContext'
import { useTags } from '../contexts/TagContext'
import { useFileList } from '../hooks/useFileList'
import { FileItem } from '../types/file'
import type { CompoundClip } from '../types/clip'
import { formatFileSize, getFileTypeIcon, getFileTypeIconColor } from '../utils/fileUtils'
import { TAG_COLORS } from '../types/tag'
import { useClips } from '../contexts/ClipContext'
import Image from 'next/image'
import { PlusCircleIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

type DerivedCompoundClip = {
  clip: CompoundClip
  files: FileItem[]
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Llegir la ruta dels settings
  const { settings } = useSettings()
  const { files, loading, error } = useFileList(settings.documentSources.localFolder)
  const { openFileDetails, selectedFile, isOpen, closeFileDetails } = useFileDetails()
  const { debouncedSearchQuery } = useSearch()
  const { getFileTags } = useFileTags()
  const { getTagById } = useTags()
  const { getClipTitle, compoundClips, createCompoundClip } = useClips()
  const [selectedPaths, setSelectedPaths] = useState<string[]>([])
  const [clipTitleDraft, setClipTitleDraft] = useState('')
  const [clipTitleManuallyEdited, setClipTitleManuallyEdited] = useState(false)
  const [clipFeedback, setClipFeedback] = useState<
    { type: 'success' | 'info' | 'error'; message: string } | null
  >(null)
  const [draggingPath, setDraggingPath] = useState<string | null>(null)
  const [dragOverPath, setDragOverPath] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fileMap = useMemo(() => {
    const map = new Map<string, FileItem>()
    for (const file of files) {
      map.set(file.path, file)
    }
    return map
  }, [files])

  const builderSelectionSet = useMemo(() => new Set(selectedPaths), [selectedPaths])

  const selectedFiles = useMemo(() => {
    return selectedPaths
      .map(path => fileMap.get(path))
      .filter((file): file is FileItem => Boolean(file))
  }, [selectedPaths, fileMap])

  const normalizedSelectionKey = useMemo(() => {
    return selectedPaths.slice().sort().join('|')
  }, [selectedPaths])

  const previousSelectionKeyRef = useRef(normalizedSelectionKey)

  useEffect(() => {
    if (!clipFeedback) {
      return
    }

    const timeout = setTimeout(() => {
      setClipFeedback(null)
    }, clipFeedback.type === 'error' ? 4000 : 2500)

    return () => clearTimeout(timeout)
  }, [clipFeedback])

  useEffect(() => {
    if (selectedPaths.length === 0) {
      setClipTitleDraft('')
      setClipTitleManuallyEdited(false)
      previousSelectionKeyRef.current = normalizedSelectionKey
      return
    }

    if (normalizedSelectionKey !== previousSelectionKeyRef.current) {
      previousSelectionKeyRef.current = normalizedSelectionKey
      setClipTitleManuallyEdited(false)

      if (selectedPaths.length === 2) {
        setClipTitleDraft('')
      }
    }
  }, [normalizedSelectionKey, selectedPaths.length])

  useEffect(() => {
    if (selectedPaths.length !== 2 || clipTitleManuallyEdited) {
      return
    }

    const [firstFile, secondFile] = selectedFiles
    if (!firstFile || !secondFile) {
      return
    }

    const suggested = `${firstFile.name} + ${secondFile.name}`
    setClipTitleDraft(prev => (prev === suggested ? prev : suggested))
  }, [selectedPaths, clipTitleManuallyEdited, selectedFiles])

  const derivedCompoundClips = useMemo<DerivedCompoundClip[]>(() => {
    return compoundClips
      .map(clip => {
        const clipFiles = clip.filePaths
          .map(path => fileMap.get(path))
          .filter((file): file is FileItem => Boolean(file))

        return {
          clip,
          files: clipFiles,
        }
      })
      .filter(entry => entry.files.length >= 2)
  }, [compoundClips, fileMap])

  const handleFileClick = (file: FileItem) => {
    if (!file.isDirectory) {
      openFileDetails(file)
    }
  }

  const handleCompoundClipClick = useCallback(
    (entry: DerivedCompoundClip) => {
      if (entry.files.length === 0) {
        return
      }
      openFileDetails(entry.files[0])
    },
    [openFileDetails],
  )

  const removeFromSelection = useCallback((filePath: string) => {
    setSelectedPaths(prev => prev.filter(path => path !== filePath))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedPaths([])
  }, [])

  const toggleClipSelection = useCallback(
    (file: FileItem) => {
      if (file.isDirectory) {
        return
      }

      let reachedLimit = false

      setSelectedPaths(prev => {
        if (prev.includes(file.path)) {
          return prev.filter(path => path !== file.path)
        }

        if (prev.length >= 2) {
          reachedLimit = true
          return prev
        }

        return [...prev, file.path]
      })

      if (reachedLimit) {
        setClipFeedback({ type: 'error', message: 'You can only combine two documents at a time.' })
      }
    },
    [setClipFeedback],
  )

  const createClipFromPair = useCallback(
    (firstFile: FileItem, secondFile: FileItem, customTitle?: string) => {
      const clipPaths = [firstFile.path, secondFile.path]
      const normalizedPaths = [...clipPaths].sort().join('|')

      const existingEntry = derivedCompoundClips.find(entry => {
        const normalizedExisting = [...entry.clip.filePaths].sort().join('|')
        return normalizedExisting === normalizedPaths
      })

      const trimmedTitle = customTitle?.trim()
      const titleToUse = trimmedTitle || `${firstFile.name} + ${secondFile.name}`
      const result = createCompoundClip(clipPaths, titleToUse)

      if (!result) {
        setClipFeedback({ type: 'error', message: 'Could not create the clip. Try again.' })
        return false
      }

      if (existingEntry) {
        const updatedTitle = result.title === existingEntry.clip.title
        setClipFeedback({
          type: updatedTitle ? 'info' : 'success',
          message: updatedTitle ? 'This clip already exists.' : 'Clip title updated.',
        })
      } else {
        setClipFeedback({ type: 'success', message: 'Clip created.' })
      }

      return true
    },
    [createCompoundClip, derivedCompoundClips],
  )

  const handleCreateClip = useCallback(() => {
    if (selectedFiles.length !== 2) {
      setClipFeedback({ type: 'error', message: 'Select two documents to create a clip.' })
      return
    }

    const success = createClipFromPair(selectedFiles[0], selectedFiles[1], clipTitleDraft)
    if (!success) {
      return
    }

    setSelectedPaths([])
    setClipTitleDraft('')
    setClipTitleManuallyEdited(false)
  }, [selectedFiles, clipTitleDraft, createClipFromPair])

  const handleDropCreateClip = useCallback(
    (sourcePath: string, targetPath: string) => {
      if (!sourcePath || !targetPath || sourcePath === targetPath) {
        return
      }

      const sourceFile = fileMap.get(sourcePath)
      const targetFile = fileMap.get(targetPath)
      if (!sourceFile || !targetFile) {
        return
      }

      if (sourceFile.isDirectory || targetFile.isDirectory) {
        return
      }

      const success = createClipFromPair(sourceFile, targetFile)
      if (!success) {
        return
      }

      let clearedSelection = false
      setSelectedPaths(prev => {
        if (prev.length === 0) {
          return prev
        }
        const next = prev.filter(path => path !== sourcePath && path !== targetPath)
        if (next.length === 0 && prev.length > 0) {
          clearedSelection = true
        }
        return next
      })

      if (clearedSelection) {
        setClipTitleDraft('')
        setClipTitleManuallyEdited(false)
      }
    },
    [fileMap, createClipFromPair],
  )

  const handleCardDragStart = useCallback((event: DragEvent<HTMLLIElement>, file: FileItem) => {
    if (file.isDirectory) {
      return
    }

    event.stopPropagation()
    setDraggingPath(file.path)
    setDragOverPath(null)
    event.dataTransfer.setData('text/plain', file.path)
    event.dataTransfer.effectAllowed = 'copyMove'
  }, [])

  const handleCardDragEnd = useCallback(() => {
    setDraggingPath(null)
    setDragOverPath(null)
  }, [])

  const handleCardDragOver = useCallback(
    (event: DragEvent<HTMLLIElement>, file: FileItem) => {
      if (!draggingPath || draggingPath === file.path || file.isDirectory) {
        return
      }

      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      if (dragOverPath !== file.path) {
        setDragOverPath(file.path)
      }
    },
    [draggingPath, dragOverPath],
  )

  const handleCardDragEnter = useCallback(
    (event: DragEvent<HTMLLIElement>, file: FileItem) => {
      if (!draggingPath || draggingPath === file.path || file.isDirectory) {
        return
      }

      event.preventDefault()
      if (dragOverPath !== file.path) {
        setDragOverPath(file.path)
      }
    },
    [draggingPath, dragOverPath],
  )

  const handleCardDragLeave = useCallback(
    (event: DragEvent<HTMLLIElement>, file: FileItem) => {
      if (dragOverPath !== file.path) {
        return
      }

      const relatedTarget = event.relatedTarget as Node | null
      if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
        return
      }

      setDragOverPath(null)
    },
    [dragOverPath],
  )

  const handleCardDrop = useCallback(
    (event: DragEvent<HTMLLIElement>, file: FileItem) => {
      if (!draggingPath || draggingPath === file.path || file.isDirectory) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      setDragOverPath(null)
      handleDropCreateClip(draggingPath, file.path)
      setDraggingPath(null)
    },
    [draggingPath, handleDropCreateClip],
  )

  // Funció per filtrar clips segons la cerca i configuració
  const filterFiles = (files: FileItem[], query: string): FileItem[] => {
    let filteredFiles = files

    // Filtrar carpetes segons la configuració "Show folders"
    if (!settings.searchSettings.showFolders) {
      filteredFiles = filteredFiles.filter(file => !file.isDirectory)
    }

    // Si no hi ha cerca, retornar els fitxers filtrats
    if (!query.trim()) {
      return filteredFiles
    }

    // Dividir la consulta en paraules individuals
    const searchTerms = query.toLowerCase().trim().split(/\s+/)

    return filteredFiles.filter(file => {
      const clipTitle = getClipTitle(file.path, file.name)

      // Crear un array amb tots els textos cercables del fitxer
      const searchableTexts: string[] = [
        clipTitle.toLowerCase(),
        file.name.toLowerCase(),
        file.extension?.toLowerCase() || '',
        file.category?.toLowerCase() || '',
        file.mimeType?.toLowerCase() || '',
        file.type?.toLowerCase() || '',
        file.path.toLowerCase(),
        file.size ? formatFileSize(file.size).toLowerCase() : '',
        file.lastModified ? new Date(file.lastModified).toLocaleDateString().toLowerCase() : ''
      ]

      // Afegir tags
      const fileTagIds = getFileTags(file.path)
      const fileTags = fileTagIds.map(tagId => getTagById(tagId)).filter(Boolean)

      for (const tag of fileTags) {
        if (!tag) continue
        searchableTexts.push(tag.text.toLowerCase())
        searchableTexts.push(tag.color.toLowerCase())

        const colorInfo = TAG_COLORS[tag.color]
        if (colorInfo) {
          searchableTexts.push(colorInfo.name.toLowerCase())
        }
      }

      // Verificar que TOTES les paraules de cerca es troben en ALGUN dels textos cercables
      return searchTerms.every(searchTerm =>
        searchableTexts.some(text => text.includes(searchTerm))
      )
    })
  }

  const filterCompoundClips = (clips: DerivedCompoundClip[], query: string): DerivedCompoundClip[] => {
    if (!query.trim()) {
      return clips
    }

    const searchTerms = query.toLowerCase().trim().split(/\s+/)

    return clips.filter(({ clip, files }) => {
      const searchableTexts: string[] = [
        clip.title.toLowerCase(),
        clip.filePaths.map(path => path.toLowerCase()).join(' '),
      ]

      for (const file of files) {
        searchableTexts.push(file.name.toLowerCase())
        searchableTexts.push(file.extension?.toLowerCase() || '')
        searchableTexts.push(file.category?.toLowerCase() || '')
        searchableTexts.push(file.mimeType?.toLowerCase() || '')
        searchableTexts.push(file.type?.toLowerCase() || '')
        searchableTexts.push(file.path.toLowerCase())
        searchableTexts.push(file.size ? formatFileSize(file.size).toLowerCase() : '')
        searchableTexts.push(
          file.lastModified ? new Date(file.lastModified).toLocaleDateString().toLowerCase() : '',
        )

        const fileTagIds = getFileTags(file.path)
        const fileTags = fileTagIds.map(tagId => getTagById(tagId)).filter(Boolean)

        for (const tag of fileTags) {
          if (!tag) continue
          searchableTexts.push(tag.text.toLowerCase())
          searchableTexts.push(tag.color.toLowerCase())

          const colorInfo = TAG_COLORS[tag.color]
          if (colorInfo) {
            searchableTexts.push(colorInfo.name.toLowerCase())
          }
        }
      }

      return searchTerms.every(searchTerm => searchableTexts.some(text => text.includes(searchTerm)))
    })
  }

  const filteredFiles = filterFiles(files, debouncedSearchQuery)
  const filteredCompoundClips = filterCompoundClips(derivedCompoundClips, debouncedSearchQuery)
  const totalClipCount = files.length + derivedCompoundClips.length
  const filteredClipCount = filteredFiles.length + filteredCompoundClips.length

  const handleGridAreaClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!isOpen) {
      return
    }

    const target = event.target as HTMLElement
    if (!target.closest('[data-file-card]')) {
      closeFileDetails()
    }
  }

  if (!mounted) {
    return null
  }


  return (
    <div
      onClick={(e) => {
        // Si es clica directament al div principal (no a una targeta), deseleccionar
        if (e.target === e.currentTarget && isOpen) {
          closeFileDetails() // Tancar la sidebar
        }
      }}
    >
      {/* File List Section */}
      <div className="mb-8">
        <h2
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
          onClick={() => {
            if (isOpen) {
              closeFileDetails()
            }
          }}
        >
          Clips
          {settings.documentSources.localFolder && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              from {settings.documentSources.localFolder}
              {!loading && !error && totalClipCount > 0 && (
                <span className="ml-1">
                  ({debouncedSearchQuery ? `${filteredClipCount} of ${totalClipCount} found` : `${totalClipCount} found`})
                </span>
              )}
            </span>
          )}
        </h2>

        {(selectedPaths.length > 0 || clipFeedback) && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/90 px-4 py-4 text-sm shadow-sm dark:border-blue-800 dark:bg-blue-900/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-blue-900 dark:text-blue-100">Clip builder</span>
                {selectedFiles.map(file => (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => removeFromSelection(file.path)}
                    className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm transition hover:border-blue-500 hover:text-blue-900 dark:border-blue-600 dark:bg-blue-800/60 dark:text-blue-100"
                  >
                    <span className="max-w-[140px] truncate" title={file.name}>
                      {file.name}
                    </span>
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                ))}
                {selectedFiles.length === 0 && (
                  <span className="text-sm text-blue-900/70 dark:text-blue-100/80">
                    Select two documents to create a clip.
                  </span>
                )}
              </div>
              {selectedPaths.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Clear selection
                </button>
              )}
            </div>

            {selectedPaths.length > 0 && selectedPaths.length < 2 && (
              <p className="mt-3 text-sm text-blue-900/80 dark:text-blue-100/80">
                Select {2 - selectedPaths.length} more document{selectedPaths.length === 1 ? '' : 's'} to build a clip.
              </p>
            )}

            {selectedPaths.length === 2 && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex-1">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-blue-900/70 dark:text-blue-100/80">
                    Clip title
                  </span>
                  <input
                    type="text"
                    value={clipTitleDraft}
                    onChange={(event) => {
                      setClipTitleDraft(event.target.value)
                      setClipTitleManuallyEdited(true)
                    }}
                    placeholder="Name this clip"
                    className="w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-sm text-blue-900 shadow-sm focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-400 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-100"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCreateClip}
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Create clip
                  </button>
                </div>
              </div>
            )}

            {clipFeedback && (
              <div
                className={`mt-3 text-sm ${
                  clipFeedback.type === 'error'
                    ? 'text-red-600 dark:text-red-300'
                    : clipFeedback.type === 'success'
                      ? 'text-green-600 dark:text-green-300'
                      : 'text-blue-700 dark:text-blue-200'
                }`}
              >
                {clipFeedback.message}
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">Loading clips...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 dark:text-red-400">{error}</div>
          </div>
        )}

        {!loading && !error && totalClipCount === 0 && settings.documentSources.localFolder && (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">No clips found in the specified folder</div>
          </div>
        )}

        {!loading && !error && !settings.documentSources.localFolder && (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">
              Configure a local folder path in Settings to view your clips
            </div>
          </div>
        )}

        {!loading && !error && totalClipCount > 0 && debouncedSearchQuery && filteredClipCount === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">
              No clips found matching "{debouncedSearchQuery}"
            </div>
          </div>
        )}

        {!loading && !error && filteredClipCount > 0 && (
          <div onClick={handleGridAreaClick}>
            <ul
              role="list"
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
            {[...filteredCompoundClips.map(entry => ({ type: 'compound' as const, entry })), ...filteredFiles.map(file => ({ type: 'file' as const, file }))].map(item => {
              if (item.type === 'compound') {
                const { clip, files: clipFiles } = item.entry
                const primaryFile = clipFiles[0]
                const isSelected = isOpen && selectedFile && clipFiles.some(file => file.path === selectedFile.path)

                return (
                  <li
                    key={clip.id}
                    data-file-card
                    className={`col-span-1 flex flex-col group bg-white border border-gray-200 shadow-2xs rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 hover:bg-gray-50 focus:outline-hidden focus:shadow-lg focus:border-gray-300 focus:bg-gray-50 transition-all duration-300 ease-in-out dark:bg-gradient-to-b dark:from-white dark:to-gray-300 dark:border-gray-400 dark:shadow-gray-400/30 dark:hover:border-gray-500 dark:hover:from-gray-50 dark:hover:to-gray-400 dark:focus:border-gray-500 dark:focus:from-gray-50 dark:focus:to-gray-400 ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 dark:ring-blue-400' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCompoundClipClick(item.entry)
                    }}
                  >
                    <div className="p-4 md:p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-800 leading-tight">
                            {clip.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">
                            {clipFiles.length} documents
                          </p>
                        </div>
                        <div className="flex items-center justify-center flex-shrink-0">
                          <Image
                            src={getFileTypeIcon(primaryFile?.extension || '', primaryFile?.isDirectory ?? false)}
                            alt="Clip"
                            width={40}
                            height={40}
                            className={`${getFileTypeIconColor(primaryFile?.extension || '', primaryFile?.isDirectory ?? false)}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="px-4 md:px-5 pb-4">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-700">Documents:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-600">
                            {clipFiles.slice(0, 2).map(file => file.extension?.toUpperCase() || 'File').join(' + ')}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-700">Created:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-600">
                            {new Date(clip.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-700">Included files:</span>
                          <div className="mt-1 space-y-1">
                            {clipFiles.slice(0, 2).map(file => (
                              <div key={file.path} className="text-xs text-gray-600 dark:text-gray-600 truncate">
                                {file.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 md:px-5 pb-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-lg p-4 min-h-[120px] max-h-[310px] group-hover:border-gray-400 dark:group-hover:border-gray-600 transition-colors relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <div className="flex h-full gap-3">
                          {clipFiles.slice(0, 2).map(file => (
                            <div key={file.path} className="relative flex-1 overflow-hidden rounded-md bg-white/40 dark:bg-white/30">
                              <FilePreview
                                file={file}
                                size="card"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              }

              const file = item.file
              const isSelected = isOpen && selectedFile && selectedFile.path === file.path

              const clipTitle = getClipTitle(file.path, file.name)
              const hasCustomTitle = clipTitle.trim() !== file.name
              const isBuilderSelected = builderSelectionSet.has(file.path)

              return (
                <li
                  key={file.path}
                  data-file-card
                  className={`col-span-1 flex flex-col group bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300/60 hover:bg-gray-50/40 focus:outline-hidden focus:shadow-md focus:border-gray-300/60 focus:bg-gray-50/40 transition-all duration-200 ease-out dark:bg-gradient-to-b dark:from-white dark:to-gray-300 dark:border-gray-400 dark:shadow-gray-400/20 dark:hover:border-gray-500/60 dark:hover:from-gray-50 dark:hover:to-gray-400/40 dark:focus:border-gray-500/60 dark:focus:from-gray-50 dark:focus:to-gray-400/40 ${
                    isSelected
                      ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 dark:ring-blue-400'
                      : ''
                  } ${
                    file.isDirectory ? 'cursor-default' : 'cursor-pointer'
                  } ${
                    !file.isDirectory ? '*:cursor-pointer' : ''
                  } ${
                    dragOverPath === file.path && draggingPath && draggingPath !== file.path
                      ? 'ring-1 ring-green-400/60 ring-offset-1 ring-offset-white shadow-lg scale-102 bg-green-50/30 dark:bg-green-900/10 dark:ring-green-400/40 dark:ring-offset-gray-900 border-green-300/40 dark:border-green-400/30 z-10 relative transition-all duration-200'
                      : ''
                  } ${
                    draggingPath === file.path ? 'opacity-30 scale-95' : ''
                  }`}
                  draggable={!file.isDirectory}
                  aria-grabbed={!file.isDirectory ? draggingPath === file.path : undefined}
                  onDragStart={(event) => handleCardDragStart(event, file)}
                  onDragEnd={handleCardDragEnd}
                  onDragOver={(event) => handleCardDragOver(event, file)}
                  onDragEnter={(event) => handleCardDragEnter(event, file)}
                  onDragLeave={(event) => handleCardDragLeave(event, file)}
                  onDrop={(event) => handleCardDrop(event, file)}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFileClick(file)
                  }}
                >
                  {/* Header amb títol i icona de tipus */}
                  <div className="p-4 md:p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight" style={{ fontSize: 'var(--text-base-plus)' }}>
                          {clipTitle}
                        </h3>
                        {hasCustomTitle && (
                          <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">
                            File: {file.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-start gap-2">
                        {!file.isDirectory && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleClipSelection(file)
                            }}
                            aria-pressed={isBuilderSelected}
                            aria-label={
                              isBuilderSelected ? 'Remove from clip selection' : 'Add to clip selection'
                            }
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-gray-600 transition focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white dark:text-gray-700 dark:focus:ring-offset-gray-900 ${
                              isBuilderSelected
                                ? 'border-blue-500 bg-blue-100 text-blue-700 dark:border-blue-400 dark:bg-blue-900/40 dark:text-blue-100'
                                : 'border-gray-300 bg-white hover:border-blue-400 hover:text-blue-600 dark:border-gray-400 dark:bg-gray-200 dark:hover:border-blue-400'
                            }`}
                          >
                            {isBuilderSelected ? (
                              <CheckCircleIcon className="h-5 w-5" />
                            ) : (
                              <PlusCircleIcon className="h-5 w-5" />
                            )}
                          </button>
                        )}
                        <div className="flex items-center justify-center flex-shrink-0">
                          <Image
                            src={getFileTypeIcon(file.extension || '', file.isDirectory)}
                            alt={file.isDirectory ? 'Folder' : `${file.extension} file`}
                            width={40}
                            height={40}
                            className={`${getFileTypeIconColor(file.extension || '', file.isDirectory)}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                {/* Secció de detalls en dues columnes */}
                <div className="px-4 md:px-5 pb-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-700">Mida:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-600">
                        {file.size ? formatFileSize(file.size) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-700">Modificat:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-600">
                        {file.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'Desconegut'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-700">Categoria:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-600">
                        {file.category ? file.category.charAt(0).toUpperCase() + file.category.slice(1) : 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags section */}
                <div className="px-4 md:px-5 pb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-700">Tags:</span>
                    {(() => {
                      const fileTagIds = getFileTags(file.path)
                      const fileTags = fileTagIds.map(tagId => getTagById(tagId)).filter(Boolean)

                      if (fileTags.length === 0) {
                        // Mostrar tags per defecte si no hi ha tags vinculades
                        if (file.isDirectory) {
                          return (
                            <>
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-300 dark:text-gray-800">
                                Directory
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-300 dark:text-gray-800">
                                Navigation
                              </span>
                            </>
                          )
                        } else {
                          return (
                            <>
                              {file.category && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-300 dark:text-gray-800">
                                  {file.category}
                                </span>
                              )}
                              {file.extension && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-300 dark:text-gray-800">
                                  {file.extension.toUpperCase()}
                                </span>
                              )}
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-300 dark:text-gray-800">
                                Clip
                              </span>
                            </>
                          )
                        }
                      }

                      // Mostrar les tags vinculades
                      return fileTags.map(tag => {
                        if (!tag) return null
                        const colorConfig = TAG_COLORS[tag.color]
                        return (
                          <span
                            key={tag.id}
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colorConfig.bgClass} ${colorConfig.textClass} dark:${colorConfig.bgClass} dark:${colorConfig.textClass}`}
                          >
                            {tag.text}
                          </span>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Àrea de diagrama amb borde puntejat i previsualització */}
                <div className="px-4 md:px-5 pb-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-lg p-4 min-h-[120px] max-h-[310px] group-hover:border-gray-400 dark:group-hover:border-gray-600 transition-colors relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {file.isDirectory ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500 dark:text-gray-500 text-sm">
                          Contingut de la carpeta
                        </span>
                      </div>
                    ) : (
                      <div className="relative h-full">
                        <FilePreview
                          file={file}
                          size="card"
                          className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-500 ease-in-out"
                        />
                      </div>
                    )}
                  </div>
                </div>
                </li>
              )
            })}
            </ul>
          </div>
        )}
      </div>

    </div>
  )
}
