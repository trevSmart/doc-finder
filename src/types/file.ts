export type FileCategory =
  | 'document'    // Word, PDF, Markdown, Text, HTML, CSV
  | 'spreadsheet' // Excel, CSV
  | 'presentation' // PowerPoint
  | 'image'       // BMP, JPG, WebP, PNG, SVG
  | 'audio'       // MP3, WAV
  | 'video'       // MPG, MOV, AVI
  | 'data'        // JSON, LOG
  | 'directory'   // Folders

export interface FileItem {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  extension?: string
  lastModified?: Date
  isDirectory: boolean
  category?: FileCategory
  mimeType?: string
}

export interface FileListResponse {
  files: FileItem[]
  path: string
  totalCount: number
}
