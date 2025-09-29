export interface UploadEvent {
  files: File[]
  position: { x: number; y: number }
}

export interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

export interface UploadOptions {
  allowedTypes?: string[]
  maxFileSize?: number
  destination?: string
}
