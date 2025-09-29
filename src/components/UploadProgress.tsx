'use client'

import { useUpload } from '../contexts/UploadContext'
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function UploadProgress() {
  const { uploads, clearUploads } = useUpload()

  if (uploads.length === 0) {
    return null
  }

  const completedCount = uploads.filter(u => u.status === 'completed').length
  const errorCount = uploads.filter(u => u.status === 'error').length
  const uploadingCount = uploads.filter(u => u.status === 'uploading').length

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-lg dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center">
            {uploadingCount > 0 && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            )}
            {uploadingCount === 0 && errorCount === 0 && (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            )}
            {errorCount > 0 && (
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Uploads ({completedCount}/{uploads.length})
          </span>
        </div>
        <button
          onClick={clearUploads}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Upload items */}
      <div className="space-y-2">
        {uploads.map((upload, index) => (
          <div
            key={`${upload.fileName}-${index}`}
            className="rounded-lg bg-white px-4 py-3 shadow-lg dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {upload.fileName}
                </p>

                {/* Progress bar */}
                {upload.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Uploading</span>
                      <span>{Math.round(upload.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status messages */}
                {upload.status === 'completed' && (
                  <div className="mt-1 flex items-center text-sm text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Completed
                  </div>
                )}

                {upload.status === 'error' && (
                  <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {upload.error || 'Upload failed'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
