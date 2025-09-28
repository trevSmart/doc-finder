'use client'

import { useState, useEffect, type MouseEvent } from 'react'
import FilePreview from '../components/FilePreview'
import { useSettings } from '../contexts/SettingsContext'
import { useFileDetails } from '../contexts/FileDetailsContext'
import { useSearch } from '../contexts/SearchContext'
import { useFileList } from '../hooks/useFileList'
import { FileItem } from '../types/file'
import { formatFileSize } from '../utils/fileUtils'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Llegir la ruta dels settings
  const { settings } = useSettings()
  const { files, loading, error } = useFileList(settings.documentSources.localFolder)
  const { openFileDetails, selectedFile, isOpen, closeFileDetails } = useFileDetails()
  const { debouncedSearchQuery } = useSearch()

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

    const searchTerm = query.toLowerCase().trim()

    return filteredFiles.filter(file => {
      // Cerca en el nom del fitxer
      if (file.name.toLowerCase().includes(searchTerm)) {
        return true
      }

      // Cerca en l'extensió
      if (file.extension && file.extension.toLowerCase().includes(searchTerm)) {
        return true
      }

      // Cerca en la categoria
      if (file.category && file.category.toLowerCase().includes(searchTerm)) {
        return true
      }

      // Cerca en el tipus MIME
      if (file.mimeType && file.mimeType.toLowerCase().includes(searchTerm)) {
        return true
      }

      // Cerca en el tipus (file/directory)
      if (file.type && file.type.toLowerCase().includes(searchTerm)) {
        return true
      }

      // Cerca en la ruta
      if (file.path.toLowerCase().includes(searchTerm)) {
        return true
      }

      // Cerca en la mida (convertir a text)
      if (file.size && formatFileSize(file.size).toLowerCase().includes(searchTerm)) {
        return true
      }

      // Cerca en la data de modificació
      if (file.lastModified) {
        const dateStr = new Date(file.lastModified).toLocaleDateString().toLowerCase()
        if (dateStr.includes(searchTerm)) {
          return true
        }
      }

      return false
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
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
            {filteredFiles.map((file, index) => {
              const isSelected = isOpen && selectedFile && selectedFile.path === file.path

              return (
                <li
                  key={index}
                  data-file-card
                  className={`col-span-1 flex flex-col group bg-white border border-gray-200 shadow-2xs rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 hover:bg-gray-50 focus:outline-hidden focus:shadow-lg focus:border-gray-300 focus:bg-gray-50 transition-all duration-300 ease-in-out dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:focus:border-neutral-600 dark:focus:bg-neutral-800 ${
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
                {/* Header amb títol i tag de categoria */}
                <div className="p-4 md:p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                      {file.name}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 flex-shrink-0">
                      {file.isDirectory ? 'FOLDER' : (file.category ? file.category.toUpperCase() : 'FILE')}
                    </span>
                  </div>
                </div>

                {/* Secció de detalls en dues columnes */}
                <div className="px-4 md:px-5 pb-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Tipus:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {file.isDirectory ? 'Directori' : (file.extension ? file.extension.toUpperCase() : 'Fitxer')}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Mida:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {file.size ? formatFileSize(file.size) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Modificat:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {file.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'Desconegut'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Categoria:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {file.category ? file.category.charAt(0).toUpperCase() + file.category.slice(1) : 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags section */}
                <div className="px-4 md:px-5 pb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</span>
                    {file.isDirectory ? (
                      <>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Directory
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Navigation
                        </span>
                      </>
                    ) : (
                      <>
                        {file.category && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {file.category}
                          </span>
                        )}
                        {file.extension && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {file.extension.toUpperCase()}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Document
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Àrea de diagrama amb borde puntejat i previsualització */}
                <div className="px-4 md:px-5 pb-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[120px] max-h-[310px] group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors relative overflow-hidden">
                    {file.isDirectory ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
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
