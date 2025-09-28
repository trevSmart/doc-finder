'use client'

import { useState, useEffect } from 'react'
import { FileItem, FileCategory } from '../types/file'
import { isImageFile, isDocumentFile } from '../utils/fileUtils'
import {
  DocumentIcon,
  PhotoIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  CodeBracketIcon,
  FolderIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface FilePreviewProps {
  file: FileItem
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function FilePreview({ file, className = '', size = 'md' }: FilePreviewProps) {
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mides per a diferents tipus de previsualització
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  }

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  }

  useEffect(() => {
    if (file.isDirectory) return

    const generatePreview = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Simulació de generació de previsualització
        // En un entorn real, això seria una crida a una API que genera thumbnails

        if (isImageFile(file.name)) {
          // Per a imatges, simulem una URL de previsualització
          setPreviewContent(`/api/thumbnail/${file.name}`)
        } else if (file.extension === 'pdf') {
          // Per a PDFs, simulem una previsualització de la primera pàgina
          setPreviewContent(`/api/pdf-preview/${file.name}`)
        } else if (['txt', 'md', 'html'].includes(file.extension || '')) {
          // Per a documents de text, llegim les primeres línies
          setPreviewContent(`/api/text-preview/${file.name}`)
        }

        // Simular delay de càrrega
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (err) {
        setError('Error loading preview')
        console.error('Preview error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    generatePreview()
  }, [file])

  // Funció per obtenir la icona adequada segons la categoria del fitxer
  const getFileIcon = (category?: FileCategory, isDirectory?: boolean) => {
    if (isDirectory) {
      return <FolderIcon className={`${iconSizes[size]} text-blue-500 dark:text-blue-400`} />
    }

    switch (category) {
      case 'image':
        return <PhotoIcon className={`${iconSizes[size]} text-green-500 dark:text-green-400`} />
      case 'audio':
        return <MusicalNoteIcon className={`${iconSizes[size]} text-purple-500 dark:text-purple-400`} />
      case 'video':
        return <VideoCameraIcon className={`${iconSizes[size]} text-red-500 dark:text-red-400`} />
      case 'spreadsheet':
        return <TableCellsIcon className={`${iconSizes[size]} text-emerald-500 dark:text-emerald-400`} />
      case 'presentation':
        return <PresentationChartBarIcon className={`${iconSizes[size]} text-orange-500 dark:text-orange-400`} />
      case 'data':
        return <CodeBracketIcon className={`${iconSizes[size]} text-gray-500 dark:text-gray-400`} />
      case 'document':
      default:
        return <DocumentIcon className={`${iconSizes[size]} text-gray-500 dark:text-gray-400`} />
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

  // Renderitzar previsualització d'imatge
  const renderImagePreview = () => {
    if (!previewContent) return null

    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden">
        <img
          src={previewContent}
          alt={`Preview of ${file.name}`}
          className="w-full h-full object-cover"
          onError={() => setError('Failed to load image preview')}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        )}
      </div>
    )
  }

  // Renderitzar previsualització de PDF
  const renderPDFPreview = () => {
    if (!previewContent) return null

    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <img
          src={previewContent}
          alt={`PDF preview of ${file.name}`}
          className="w-full h-full object-contain"
          onError={() => setError('Failed to load PDF preview')}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Loading PDF...</div>
          </div>
        )}
        {/* Overlay per indicar que és un PDF */}
        <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
          PDF
        </div>
      </div>
    )
  }

  // Renderitzar previsualització de text
  const renderTextPreview = () => {
    if (!previewContent) return null

    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2">
        <div className="text-xs text-gray-600 dark:text-gray-300 font-mono leading-tight">
          {previewContent}
        </div>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Loading text...</div>
          </div>
        )}
      </div>
    )
  }

  // Determinar si es pot mostrar previsualització
  const canShowPreview = () => {
    if (file.isDirectory) return false
    if (error) return false

    return isImageFile(file.name) ||
           file.extension === 'pdf' ||
           ['txt', 'md', 'html'].includes(file.extension || '')
  }

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      {canShowPreview() && previewContent && !isLoading && !error ? (
        <div className="w-full h-full">
          {isImageFile(file.name) && renderImagePreview()}
          {file.extension === 'pdf' && renderPDFPreview()}
          {['txt', 'md', 'html'].includes(file.extension || '') && renderTextPreview()}
        </div>
      ) : (
        <div className={`${sizeClasses[size]} ${getBackgroundColor(file.category, file.isDirectory)} rounded-lg flex items-center justify-center`}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 dark:border-gray-400"></div>
          ) : error ? (
            <ExclamationTriangleIcon className={`${iconSizes[size]} text-yellow-500 dark:text-yellow-400`} />
          ) : (
            getFileIcon(file.category, file.isDirectory)
          )}
        </div>
      )}
    </div>
  )
}
