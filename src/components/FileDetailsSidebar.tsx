'use client'

import { useState, useEffect } from 'react'
import {
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  ShareIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { FileItem, FileCategory } from '../types/file'
import { formatFileSize, getFileTypeIcon, getFileTypeIconColor } from '../utils/fileUtils'
import FilePreview from './FilePreview'
import TagSelector from './TagSelector'
import { useFileTags } from '../contexts/FileTagsContext'
import Image from 'next/image'
import { useClips } from '../contexts/ClipContext'

interface FileDetailsSidebarProps {
  isOpen: boolean
  onClose: () => void
  file: FileItem | null
  sidebarWidth: number
  startResize: (e: React.MouseEvent) => void
  isResizing: boolean
  onFileTagsChange?: (filePath: string, tagIds: string[]) => void
}

type TransitionState = 'closed' | 'entering' | 'open' | 'leaving'

export default function FileDetailsSidebar({ isOpen, onClose, file, sidebarWidth, startResize, onFileTagsChange }: FileDetailsSidebarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [clipTitleInput, setClipTitleInput] = useState('')
  const [fileDescription, setFileDescription] = useState('A comprehensive proposal for the new marketing campaign including budget estimates and timeline.')
  const [transitionState, setTransitionState] = useState<TransitionState>('closed')
  const { getFileTags } = useFileTags()
  const { getClipTitle, updateClipTitle, clearClip } = useClips()

  // Sincronitzar l'estat local quan canvia el prop file
  useEffect(() => {
    if (file) {
      setClipTitleInput(getClipTitle(file.path, file.name))
      setIsEditing(false) // Cancel·lar l'edició quan canvia el fitxer
    } else {
      // Reset quan no hi ha fitxer seleccionat
      setClipTitleInput('')
      setIsEditing(false)
    }
  }, [file, getClipTitle])

  // Gestionar les transicions
  useEffect(() => {
    let animationFrame: number | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    if (isOpen) {
      setTransitionState((prev) => (prev === 'open' ? prev : 'entering'))
      // Forçar un re-render per activar la transició
      animationFrame = requestAnimationFrame(() => {
        setTransitionState('open')
      })
    } else {
      setTransitionState((prev) => (prev === 'closed' ? prev : 'leaving'))
      // Esperar a que acabi la transició abans de tancar
      timeoutId = setTimeout(() => {
        setTransitionState('closed')
      }, 300) // 300ms per coincidir amb la durada de la transició CSS
    }

    return () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame)
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    }
  }, [isOpen])

  const handleSave = () => {
    if (!file) {
      return
    }

    const trimmed = clipTitleInput.trim()
    if (!trimmed || trimmed === file.name) {
      clearClip(file.path)
      setClipTitleInput(getClipTitle(file.path, file.name))
    } else {
      updateClipTitle(file.path, trimmed)
    }

    setIsEditing(false)
    // Here you would typically save the changes to your backend
  }

  const handleCancel = () => {
    if (file) {
      setClipTitleInput(getClipTitle(file.path, file.name))
    } else {
      setClipTitleInput('')
    }
    setIsEditing(false)
    // Reset to original values if needed
  }

  // Funció per obtenir la icona adequada segons l'extensió del fitxer
  const getFileIcon = (extension?: string, isDirectory?: boolean) => {
    const iconSrc = getFileTypeIcon(extension || '', isDirectory || false)
    const iconColor = getFileTypeIconColor(extension || '', isDirectory || false)

    return (
      <Image
        src={iconSrc}
        alt={isDirectory ? 'Folder' : `${extension} file`}
        width={24}
        height={24}
        className={iconColor}
      />
    )
  }

  // Funció per obtenir el color de fons segons la categoria
  const getBackgroundColor = (category?: FileCategory, isDirectory?: boolean) => {
    if (isDirectory) {
      return 'bg-blue-100 dark:bg-blue-900/20'
    }

    switch (category) {
      case 'image':
        return 'bg-green-100 dark:bg-green-900/20'
      case 'audio':
        return 'bg-purple-100 dark:bg-purple-900/20'
      case 'video':
        return 'bg-red-100 dark:bg-red-900/20'
      case 'spreadsheet':
        return 'bg-emerald-100 dark:bg-emerald-900/20'
      case 'presentation':
        return 'bg-orange-100 dark:bg-orange-900/20'
      case 'data':
        return 'bg-gray-100 dark:bg-gray-900/20'
      case 'document':
      default:
        return 'bg-blue-100 dark:bg-blue-900/20'
    }
  }

  // No renderitzar res si està completament tancat o no hi ha fitxer
  if (transitionState === 'closed' || !file) {
    return null
  }

  // Classes CSS per a les transicions
  const getTransitionClasses = () => {
    const baseClasses = "fixed inset-y-0 right-0 z-50 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out"

    switch (transitionState) {
      case 'entering':
        return `${baseClasses} transform translate-x-full`
      case 'open':
        return `${baseClasses} transform translate-x-0`
      case 'leaving':
        return `${baseClasses} transform translate-x-full`
      default:
        return baseClasses
    }
  }

  return (
    <div
      className={getTransitionClasses()}
      style={{ width: `${sidebarWidth}px` }}
      data-right-sidebar
    >
      {/* Resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-gray-300 hover:opacity-50 transition-colors"
        onMouseDown={startResize}
      />

      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getBackgroundColor(file?.category, file?.isDirectory)}`}>
              {getFileIcon(file?.extension, file?.isDirectory)}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={clipTitleInput}
                  onChange={(e) => setClipTitleInput(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white break-words overflow-wrap-anywhere">
                  {file ? getClipTitle(file.path, file.name) : ''}
                </h2>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {file?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-md p-2 text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-gray-400 dark:hover:text-white dark:focus-visible:outline-blue-500"
                disabled={!file}
              >
                <span className="sr-only">Edit clip information</span>
                <PencilIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-white dark:focus-visible:outline-indigo-500"
            >
              <span className="sr-only">Close panel</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <TagSelector
            selectedTagIds={file ? getFileTags(file.path) : []}
            onTagsChange={(tagIds) => {
              if (file && onFileTagsChange) {
                onFileTagsChange(file.path, tagIds);
              }
            }}
            disabled={!file || file.isDirectory}
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          {isEditing ? (
            <textarea
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">{fileDescription}</p>
          )}
        </div>

        {/* Preview */}
        {file && !file.isDirectory && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </label>
            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <FilePreview
                file={file}
                size="sidebar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Details */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Details
          </label>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm text-gray-900 dark:text-white">March 15, 2024</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Modified</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {file?.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <UserIcon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
                <p className="text-sm text-gray-900 dark:text-white">John Doe</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <TagIcon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Size</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {file?.size ? formatFileSize(file.size) : 'Unknown'}
                </p>
              </div>
            </div>

            {file?.mimeType && (
              <div className="flex items-center space-x-3">
                <TagIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                  <p className="text-sm text-gray-900 dark:text-white">{file.mimeType}</p>
                </div>
              </div>
            )}

            {file?.category && (
              <div className="flex items-center space-x-3">
                <TagIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{file.category}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        {isEditing ? (
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  if (file) {
                    // Open file with system default application
                    const link = document.createElement('a')
                    link.href = `/api/file-preview?path=${encodeURIComponent(file.path)}`
                    link.target = '_blank'
                    link.rel = 'noopener noreferrer'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }
                }}
                className="flex items-center space-x-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Open</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (file) {
                    // Download file
                    const link = document.createElement('a')
                    link.href = `/api/file-preview?path=${encodeURIComponent(file.path)}&download=true`
                    link.download = file.name
                    link.target = '_blank'
                    link.rel = 'noopener noreferrer'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }
                }}
                className="flex items-center space-x-2 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ShareIcon className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                if (file && window.confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
                  // TODO: Implement file deletion logic
                  // eslint-disable-next-line no-console
                  console.log('Delete file:', file.path)
                }
              }}
              className="flex items-center justify-center rounded-md bg-white dark:bg-gray-800 p-2 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              title="Delete file"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
