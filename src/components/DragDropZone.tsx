'use client'

import { useCallback, useEffect, useState } from 'react'
import type { UploadEvent, UploadOptions } from '../types/upload'

interface DragDropZoneProps {
  children: React.ReactNode
  onUpload: (event: UploadEvent) => void
  options?: UploadOptions
  className?: string
}

interface DragState {
  isDragging: boolean
  dragCounter: number
}

export default function DragDropZone({
  children,
  onUpload,
  options = {},
  className = ''
}: DragDropZoneProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragCounter: 0
  })

  const validateFile = useCallback((file: File): boolean => {
    const { allowedTypes = [], maxFileSize } = options

    // Check file type if restrictions are specified
    if (allowedTypes.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const mimeType = file.type.toLowerCase()

      const isValidType = allowedTypes.some(type =>
        type.startsWith('.')
          ? type.toLowerCase() === fileExtension
          : mimeType.includes(type.toLowerCase())
      )

      if (!isValidType) {
        return false
      }
    }

    // Check file size if limit is specified
    if (maxFileSize && file.size > maxFileSize) {
      return false
    }

    return true
  }, [options])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if this is a file drag (from external source) vs internal drag (from app elements)
    // We need to check for actual file items, not just types
    const items = e.dataTransfer?.items || []
    const hasFileItems = Array.from(items).some(item => item.kind === 'file')

    // Only activate if we're dragging external files, not internal app elements
    if (!hasFileItems) {
      return
    }

    setDragState(prev => ({
      isDragging: true,
      dragCounter: prev.dragCounter + 1
    }))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setDragState(prev => ({
      isDragging: prev.dragCounter > 1,
      dragCounter: prev.dragCounter - 1
    }))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setDragState({ isDragging: false, dragCounter: 0 })

    // Additional check: ensure we have actual files
    const hasActualFiles = e.dataTransfer?.items && e.dataTransfer.items.length > 0 &&
      Array.from(e.dataTransfer.items).some(item => item.kind === 'file')

    if (!hasActualFiles) {
      return
    }

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) {
      return
    }

    // Validate all files
    const validFiles: File[] = []
    const invalidFiles: string[] = []

    files.forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file)
      } else {
        invalidFiles.push(file.name)
      }
    })

    // Show validation errors
    if (invalidFiles.length > 0) {
      alert(`Some files couldn't be uploaded:\n${invalidFiles.join('\n')}\n\nPlease check file types and sizes.`)
    }

    // Upload valid files
    if (validFiles.length > 0) {
      onUpload({
        files: validFiles,
        position: {
          x: e.clientX,
          y: e.clientY
        }
      })
    }
  }, [onUpload, validateFile])

  // Prevent default drag behaviors on window
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    window.addEventListener('dragenter', preventDefaults)
    window.addEventListener('dragover', preventDefaults)
    window.addEventListener('dragleave', preventDefaults)
    window.addEventListener('drop', preventDefaults)

    return () => {
      window.removeEventListener('dragenter', preventDefaults)
      window.removeEventListener('dragover', preventDefaults)
      window.removeEventListener('dragleave', preventDefaults)
      window.removeEventListener('drop', preventDefaults)
    }
  }, [])

  return (
    <div
      className={`relative ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {/* Drop overlay */}
      {dragState.isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm">
          <div className="rounded-lg border-2 border-dashed border-blue-500 bg-white p-8 shadow-lg dark:bg-gray-800">
            <div className="flex flex-col items-center space-y-4">
              <svg
                className="h-12 w-12 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Drop files here to add them to your library
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Release to upload files
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
