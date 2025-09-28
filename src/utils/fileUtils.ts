import { FileCategory } from '../types/file'

// Mapeig d'extensions a categories i MIME types
const FILE_TYPE_MAP: Record<string, { category: FileCategory; mimeType: string }> = {
  // Documents
  'doc': { category: 'document', mimeType: 'application/msword' },
  'docx': { category: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  'pdf': { category: 'document', mimeType: 'application/pdf' },
  'md': { category: 'document', mimeType: 'text/markdown' },
  'markdown': { category: 'document', mimeType: 'text/markdown' },
  'txt': { category: 'document', mimeType: 'text/plain' },
  'html': { category: 'document', mimeType: 'text/html' },
  'htm': { category: 'document', mimeType: 'text/html' },

  // Spreadsheets
  'xls': { category: 'spreadsheet', mimeType: 'application/vnd.ms-excel' },
  'xlsx': { category: 'spreadsheet', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  'csv': { category: 'spreadsheet', mimeType: 'text/csv' },

  // Presentations
  'ppt': { category: 'presentation', mimeType: 'application/vnd.ms-powerpoint' },
  'pptx': { category: 'presentation', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },

  // Images
  'bmp': { category: 'image', mimeType: 'image/bmp' },
  'jpg': { category: 'image', mimeType: 'image/jpeg' },
  'jpeg': { category: 'image', mimeType: 'image/jpeg' },
  'webp': { category: 'image', mimeType: 'image/webp' },
  'png': { category: 'image', mimeType: 'image/png' },
  'svg': { category: 'image', mimeType: 'image/svg+xml' },

  // Audio
  'mp3': { category: 'audio', mimeType: 'audio/mpeg' },
  'wav': { category: 'audio', mimeType: 'audio/wav' },

  // Video
  'mpg': { category: 'video', mimeType: 'video/mpeg' },
  'mpeg': { category: 'video', mimeType: 'video/mpeg' },
  'mov': { category: 'video', mimeType: 'video/quicktime' },
  'avi': { category: 'video', mimeType: 'video/x-msvideo' },

  // Data
  'json': { category: 'data', mimeType: 'application/json' },
  'log': { category: 'data', mimeType: 'text/plain' }
}

/**
 * Obté l'extensió d'un fitxer a partir del seu nom
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return ''
  }
  return filename.substring(lastDotIndex + 1).toLowerCase()
}

/**
 * Determina la categoria d'un fitxer basant-se en la seva extensió
 */
export function getFileCategory(filename: string): FileCategory | undefined {
  const extension = getFileExtension(filename)
  return FILE_TYPE_MAP[extension]?.category
}

/**
 * Obté el MIME type d'un fitxer basant-se en la seva extensió
 */
export function getMimeType(filename: string): string | undefined {
  const extension = getFileExtension(filename)
  return FILE_TYPE_MAP[extension]?.mimeType
}

/**
 * Obté informació completa del tipus de fitxer
 */
export function getFileTypeInfo(filename: string): { category?: FileCategory; mimeType?: string; extension: string } {
  const extension = getFileExtension(filename)
  const typeInfo = FILE_TYPE_MAP[extension]

  return {
    extension,
    category: typeInfo?.category,
    mimeType: typeInfo?.mimeType
  }
}

/**
 * Formata la mida d'un fitxer en unitats llegibles
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Verifica si un fitxer és d'un tipus d'imatge
 */
export function isImageFile(filename: string): boolean {
  return getFileCategory(filename) === 'image'
}

/**
 * Verifica si un fitxer és d'un tipus de document
 */
export function isDocumentFile(filename: string): boolean {
  const category = getFileCategory(filename)
  return category === 'document' || category === 'spreadsheet' || category === 'presentation'
}

/**
 * Verifica si un fitxer és d'un tipus multimèdia
 */
export function isMediaFile(filename: string): boolean {
  const category = getFileCategory(filename)
  return category === 'image' || category === 'audio' || category === 'video'
}
