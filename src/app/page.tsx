'use client'

import { useState, useEffect, type MouseEvent } from 'react'
import FilePreview from '../components/FilePreview'
import { useSettings } from '../contexts/SettingsContext'
import { useFileDetails } from '../contexts/FileDetailsContext'
import { useSearch } from '../contexts/SearchContext'
import { useFileTags } from '../contexts/FileTagsContext'
import { useTags } from '../contexts/TagContext'
import { useFileList } from '../hooks/useFileList'
import { FileItem } from '../types/file'
import { formatFileSize, getFileTypeIcon, getFileTypeIconColor } from '../utils/fileUtils'
import { TAG_COLORS } from '../types/tag'
import Image from 'next/image'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Llegir la ruta dels settings
  const { settings } = useSettings()
  const { files, loading, error } = useFileList(settings.documentSources.localFolder)
  const { openFileDetails, selectedFile, isOpen, closeFileDetails } = useFileDetails()
  const { debouncedSearchQuery } = useSearch()
  const { getFileTags } = useFileTags()
  const { getTagById } = useTags()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleFileClick = (file: FileItem) => {
    if (!file.isDirectory) {
      openFileDetails(file)
    }
  }

  // Funció per filtrar documents segons la cerca i configuració
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
      // Crear un array amb tots els textos cercables del fitxer
      const searchableTexts: string[] = [
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

  const filteredFiles = filterFiles(files, debouncedSearchQuery)

  const handleGridAreaClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!isOpen) {
      return
    }

    const target = event.target as HTMLElement
    if (!target.closest('[data-file-card]')) {
      closeFileDetails()
    }
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
          Documents
          {settings.documentSources.localFolder && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              from {settings.documentSources.localFolder}
              {!loading && !error && files.length > 0 && (
                <span className="ml-1">
                  ({debouncedSearchQuery ? `${filteredFiles.length} of ${files.length} found` : `${files.length} found`})
                </span>
              )}
            </span>
          )}
        </h2>

        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">Loading files...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 dark:text-red-400">{error}</div>
          </div>
        )}

        {!loading && !error && files.length === 0 && settings.documentSources.localFolder && (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">No files found in the specified folder</div>
          </div>
        )}

        {!loading && !error && !settings.documentSources.localFolder && (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">
              Configure a local folder path in Settings to view your documents
            </div>
          </div>
        )}

        {!loading && !error && files.length > 0 && debouncedSearchQuery && filteredFiles.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400">
              No documents found matching "{debouncedSearchQuery}"
            </div>
          </div>
        )}

        {!loading && !error && files.length > 0 && filteredFiles.length > 0 && (
          <div onClick={handleGridAreaClick}>
            <ul
              role="list"
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
            {filteredFiles.map((file, index) => {
              const isSelected = isOpen && selectedFile && selectedFile.path === file.path

              return (
                <li
                  key={index}
                  data-file-card
                  className={`col-span-1 flex flex-col group bg-white border border-gray-200 shadow-2xs rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 hover:bg-gray-50 focus:outline-hidden focus:shadow-lg focus:border-gray-300 focus:bg-gray-50 transition-all duration-300 ease-in-out dark:bg-gradient-to-b dark:from-white dark:to-gray-300 dark:border-gray-400 dark:shadow-gray-400/30 dark:hover:border-gray-500 dark:hover:from-gray-50 dark:hover:to-gray-400 dark:focus:border-gray-500 dark:focus:from-gray-50 dark:focus:to-gray-400 ${
                    isSelected
                      ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 dark:ring-blue-400'
                      : ''
                  } ${
                    file.isDirectory ? 'cursor-default' : 'cursor-pointer'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFileClick(file)
                  }}
                >
                {/* Header amb títol i icona de tipus */}
                <div className="p-4 md:p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-800 leading-tight">
                      {file.name}
                    </h3>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-300 flex-shrink-0">
                      <Image
                        src={getFileTypeIcon(file.extension || '', file.isDirectory)}
                        alt={file.isDirectory ? 'Folder' : `${file.extension} file`}
                        width={20}
                        height={20}
                        className={`${getFileTypeIconColor(file.extension || '', file.isDirectory)}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Secció de detalls en dues columnes */}
                <div className="px-4 md:px-5 pb-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-700">Tipus:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-600 inline-flex items-center gap-1">
                        <Image
                          src={getFileTypeIcon(file.extension || '', file.isDirectory)}
                          alt={file.isDirectory ? 'Folder' : `${file.extension} file`}
                          width={16}
                          height={16}
                          className={`${getFileTypeIconColor(file.extension || '', file.isDirectory)}`}
                        />
                        {file.isDirectory ? 'Directori' : (file.extension ? file.extension.toUpperCase() : 'Fitxer')}
                      </span>
                    </div>
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
                                Document
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
