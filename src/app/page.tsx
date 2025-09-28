'use client'

import {
  DocumentIcon,
  FolderIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  CodeBracketIcon
} from '@heroicons/react/20/solid'
import { useState, useEffect } from 'react'
import FilePreview from '../components/FilePreview'
import { useSettings } from '../contexts/SettingsContext'
import { useFileDetails } from '../contexts/FileDetailsContext'
import { useFileList } from '../hooks/useFileList'
import { FileItem, FileCategory } from '../types/file'
import { formatFileSize } from '../utils/fileUtils'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Llegir la ruta dels settings
  const { settings } = useSettings()
  const { files, loading, error } = useFileList(settings.documentSources.localFolder)
  const { openFileDetails } = useFileDetails()

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

  // Funció per obtenir la icona adequada segons la categoria del fitxer
  const getFileIcon = (category?: FileCategory, isDirectory?: boolean) => {
    if (isDirectory) {
      return <FolderIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
    }

    switch (category) {
      case 'image':
        return <PhotoIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
      case 'audio':
        return <MusicalNoteIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
      case 'video':
        return <VideoCameraIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
      case 'spreadsheet':
        return <TableCellsIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
      case 'presentation':
        return <PresentationChartBarIcon className="h-5 w-5 text-orange-500 dark:text-orange-400" />
      case 'data':
        return <CodeBracketIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      case 'document':
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
    }
  }

  // Funció per obtenir el color de fons segons la categoria
  const getBackgroundColor = (category?: FileCategory, isDirectory?: boolean) => {
    if (isDirectory) {
      return 'bg-blue-50 dark:bg-blue-500/10'
    }

    switch (category) {
      case 'image':
        return 'bg-green-50 dark:bg-green-500/10'
      case 'audio':
        return 'bg-purple-50 dark:bg-purple-500/10'
      case 'video':
        return 'bg-red-50 dark:bg-red-500/10'
      case 'spreadsheet':
        return 'bg-emerald-50 dark:bg-emerald-500/10'
      case 'presentation':
        return 'bg-orange-50 dark:bg-orange-500/10'
      case 'data':
        return 'bg-gray-50 dark:bg-gray-500/10'
      case 'document':
      default:
        return 'bg-gray-50 dark:bg-gray-500/10'
    }
  }

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
                <span className="ml-1">({files.length} found)</span>
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

        {!loading && !error && files.length > 0 && (
          <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((file, index) => (
              <li
                key={index}
                className={`col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10 ${
                  file.isDirectory ? 'cursor-default' : 'cursor-pointer'
                }`}
                onClick={() => handleFileClick(file)}
              >
                {/* Previsualització del fitxer */}
                <div className="p-4">
                  <FilePreview file={file} size="lg" className="mx-auto" />
                </div>

                {/* Informació del fitxer */}
                <div className="px-6 pb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </h3>
                    <span className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium inset-ring ${
                      file.isDirectory
                        ? 'bg-blue-50 text-blue-700 inset-ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-500 dark:inset-ring-blue-500/10'
                        : file.category === 'image'
                        ? 'bg-green-50 text-green-700 inset-ring-green-600/20 dark:bg-green-500/10 dark:text-green-500 dark:inset-ring-green-500/10'
                        : file.category === 'audio'
                        ? 'bg-purple-50 text-purple-700 inset-ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-500 dark:inset-ring-purple-500/10'
                        : file.category === 'video'
                        ? 'bg-red-50 text-red-700 inset-ring-red-600/20 dark:bg-red-500/10 dark:text-red-500 dark:inset-ring-red-500/10'
                        : file.category === 'spreadsheet'
                        ? 'bg-emerald-50 text-emerald-700 inset-ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-500 dark:inset-ring-emerald-500/10'
                        : file.category === 'presentation'
                        ? 'bg-orange-50 text-orange-700 inset-ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-500 dark:inset-ring-orange-500/10'
                        : file.category === 'data'
                        ? 'bg-gray-50 text-gray-700 inset-ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-500 dark:inset-ring-gray-500/10'
                        : 'bg-blue-50 text-blue-700 inset-ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-500 dark:inset-ring-blue-500/10'
                    }`}>
                      {file.isDirectory ? 'Folder' : file.category ? file.category.charAt(0).toUpperCase() + file.category.slice(1) : 'File'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {file.isDirectory
                      ? 'Directory'
                      : `${file.size ? formatFileSize(file.size) : 'Unknown size'} • ${file.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'Unknown date'}`
                    }
                  </p>
                </div>

                {/* Accions del fitxer */}
                {!file.isDirectory && (
                  <div>
                    <div className="-mt-px flex divide-x divide-gray-200 dark:divide-white/10">
                      <div className="flex w-0 flex-1">
                        <button
                          type="button"
                          className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <EyeIcon aria-hidden="true" className="size-5 text-gray-400 dark:text-gray-500" />
                          View
                        </button>
                      </div>
                      <div className="-ml-px flex w-0 flex-1">
                        <button
                          type="button"
                          className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <ArrowDownTrayIcon aria-hidden="true" className="size-5 text-gray-400 dark:text-gray-500" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}
