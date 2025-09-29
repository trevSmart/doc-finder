'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { UploadEvent, UploadProgress, UploadOptions } from '../types/upload'

interface UploadContextValue {
  uploads: UploadProgress[]
  isUploading: boolean
  uploadFiles: (files: File[]) => Promise<void>
  retryUpload: (fileName: string) => Promise<void>
  clearUploads: () => void
}

const UploadContext = createContext<UploadContextValue | undefined>(undefined)

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadFiles = useCallback(async (files: File[]) => {
    setIsUploading(true)

    // Initialize upload progress for each file
    const initialUploads: UploadProgress[] = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading' as const
    }))

    setUploads(prev => [...prev, ...initialUploads])

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Update progress to uploading
        setUploads(prev =>
          prev.map(upload =>
            upload.fileName === file.name
              ? { ...upload, progress: 10, status: 'uploading' as const }
              : upload
          )
        )

        await uploadSingleFile(file, (progress) => {
          setUploads(prev =>
            prev.map(upload =>
              upload.fileName === file.name
                ? { ...upload, progress: 10 + (progress * 0.8) }
                : upload
            )
          )
        })

        // Mark as completed
        setUploads(prev =>
          prev.map(upload =>
            upload.fileName === file.name
              ? { ...upload, progress: 100, status: 'completed' as const }
              : upload
          )
        )
      }
    } catch (error) {
      console.error('Upload error:', error)

      // Mark failed uploads as error
      setUploads(prev =>
        prev.map(upload =>
          upload.status === 'uploading'
            ? {
                ...upload,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : upload
        )
      )
    } finally {
      setIsUploading(false)
    }
  }, [])

  const uploadSingleFile = async (file: File, onProgress: (progress: number) => void): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        reject(new Error('Network error during upload'))
      }

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    })
  }

  const retryUpload = useCallback(async (fileName: string) => {
    // Find the failed upload
    const failedUpload = uploads.find(upload => upload.fileName === fileName && upload.status === 'error')
    if (!failedUpload) {
      return
    }

    // This would need the original File object, which we don't store
    // For now, we'll just remove the error state
    setUploads(prev => prev.filter(upload => upload.fileName !== fileName))
  }, [uploads])

  const clearUploads = useCallback(() => {
    setUploads([])
  }, [])

  const value = useMemo(
    () => ({
      uploads,
      isUploading,
      uploadFiles,
      retryUpload,
      clearUploads,
    }),
    [uploads, isUploading, uploadFiles, retryUpload, clearUploads]
  )

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
}

export function useUpload() {
  const context = useContext(UploadContext)
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider')
  }
  return context
}
