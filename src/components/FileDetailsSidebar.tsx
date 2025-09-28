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

interface FileDetailsSidebarProps {
  isOpen: boolean
  onClose: () => void
  file: FileItem | null
  sidebarWidth: number
  startResize: (e: React.MouseEvent) => void
  isResizing: boolean
}

type TransitionState = 'closed' | 'entering' | 'open' | 'leaving'

export default function FileDetailsSidebar({ isOpen, onClose, file, sidebarWidth, startResize }: FileDetailsSidebarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileDescription, setFileDescription] = useState('A comprehensive proposal for the new marketing campaign including budget estimates and timeline.')
  const [transitionState, setTransitionState] = useState<TransitionState>('closed')

  // Sincronitzar l'estat local quan canvia el prop file
  useEffect(() => {
    if (file) {
      setFileName(file.name)
      setIsEditing(false) // Cancel·lar l'edició quan canvia el fitxer
    } else {
      // Reset quan no hi ha fitxer seleccionat
      setFileName('')
      setIsEditing(false)
    }
  }, [file])

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
    setIsEditing(false)
    // Here you would typically save the changes to your backend
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original values if needed
  }

  // Funció per obtenir la icona adequada segons l'extensió del fitxer
  const getFileIcon = (extension?: string, isDirectory?: boolean) => {
    const IconComponent = getFileTypeIcon(extension || '', isDirectory || false)
    const iconColor = getFileTypeIconColor(extension || '', isDirectory || false)
    
    return <IconComponent className={`h-6 w-6 ${iconColor}`} />
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            File Details
          </h2>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* File Preview */}
        {file && !file.isDirectory && (
          <div className="mb-6">
            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <FilePreview
                file={file}
                size="sidebar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* File Icon and Name */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${getBackgroundColor(file?.category, file?.isDirectory)}`}>
              {getFileIcon(file?.extension, file?.isDirectory)}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{fileName}</h3>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {file?.extension ? file.extension.toUpperCase() : file?.isDirectory ? 'Folder' : 'File'}
              </p>
            </div>
          </div>
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

        {/* File Information */}
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

        {/* Tags */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/20 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
              Proposal
            </span>
            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/20 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
              Marketing
            </span>
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/20 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200">
              Q1 2024
            </span>
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
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className="flex items-center space-x-2 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ShareIcon className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button
              type="button"
              className="flex items-center space-x-2 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
