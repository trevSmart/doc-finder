'use client'

import { useState, useEffect } from 'react'
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
  const { openFileDetails } = useFileDetails()
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

  // Funció per filtrar documents segons la cerca
  const filterFiles = (files: FileItem[], query: string): FileItem[] => {
    if (!query.trim()) {
      return files
    }

    const searchTerm = query.toLowerCase().trim()

    return files.filter(file => {
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


  return (
    <div>
      {/* File List Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
          <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file, index) => (
              <li
                key={index}
                className={`col-span-1 flex flex-col group bg-white border border-gray-200 shadow-2xs rounded-xl overflow-hidden hover:shadow-lg focus:outline-hidden focus:shadow-lg transition dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70 ${
                  file.isDirectory ? 'cursor-default' : 'cursor-pointer'
                }`}
                onClick={() => handleFileClick(file)}
              >
                {/* Contingut de la card */}
                <div className="p-4 md:p-5">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">
                    {file.name}
                  </h3>
                  <p className="mt-1 text-gray-500 dark:text-neutral-400">
                    {file.isDirectory
                      ? 'Directory containing files and folders'
                      : file.category
                        ? `${file.category.charAt(0).toUpperCase() + file.category.slice(1)} file`
                        : 'Document file'
                    }
                  </p>
                  <p className="mt-5 text-xs text-gray-500 dark:text-neutral-500">
                    {file.isDirectory
                      ? 'Directory'
                      : `Last updated ${file.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'Unknown date'} • ${file.size ? formatFileSize(file.size) : 'Unknown size'}`
                    }
                  </p>
                </div>

                {/* Previsualització del fitxer */}
                <div className="relative pt-[50%] sm:pt-[60%] lg:pt-[80%] rounded-b-xl overflow-hidden">
                  <FilePreview file={file} size="card" className="size-full absolute top-0 start-0 group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out rounded-b-xl" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}
