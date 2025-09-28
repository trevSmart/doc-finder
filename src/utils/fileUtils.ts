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
 * Verifica si un fitxer és d'un tipus Excel
 */
export function isExcelFile(filename: string): boolean {
  const extension = getFileExtension(filename)
  return extension === 'xlsx' || extension === 'xls'
}

/**
 * Verifica si un fitxer és d'un tipus CSV
 */
export function isCsvFile(filename: string): boolean {
  const extension = getFileExtension(filename)
  return extension === 'csv'
}

/**
 * Verifica si un fitxer és d'un tipus de fulla de càlcul (Excel o CSV)
 */
export function isSpreadsheetFile(filename: string): boolean {
  return isExcelFile(filename) || isCsvFile(filename)
}

/**
 * Verifica si un fitxer és d'un tipus DOCX
 */
export function isDocxFile(filename: string): boolean {
  const extension = getFileExtension(filename)
  return extension === 'docx'
}

/**
 * Verifica si un fitxer és d'un tipus PPTX
 */
export function isPptxFile(filename: string): boolean {
  const extension = getFileExtension(filename)
  return extension === 'pptx'
}

/**
 * Verifica si un fitxer és d'un tipus de document Office (DOCX, PPTX)
 */
export function isOfficeFile(filename: string): boolean {
  return isDocxFile(filename) || isPptxFile(filename)
}

/**
 * Verifica si un fitxer és d'un tipus multimèdia
 */
export function isMediaFile(filename: string): boolean {
  const category = getFileCategory(filename)
  return category === 'image' || category === 'audio' || category === 'video'
}

/**
 * Obté la ruta de la icona específica per a cada extensió de fitxer
 */
export function getFileTypeIcon(extension: string, isDirectory: boolean = false): string {
  if (isDirectory) {
    return '/icons/file-types/folder.svg'
  }

  const ext = extension.toLowerCase()

  switch (ext) {
    // Documents
    case 'doc':
    case 'docx':
      return '/icons/file-types/docx.svg'
    case 'pdf':
      return '/icons/file-types/pdf.svg'
    case 'md':
    case 'markdown':
      return '/icons/file-types/markdown.png'
    case 'txt':
      return '/icons/file-types/txt.svg'
    case 'html':
    case 'htm':
      return '/icons/file-types/html.svg'

    // Spreadsheets
    case 'xls':
    case 'xlsx':
      return '/icons/file-types/xlsx.svg'
    case 'csv':
      return '/icons/file-types/csv.svg'

    // Presentations
    case 'ppt':
    case 'pptx':
      return '/icons/file-types/pptx.svg'

    // Images
    case 'bmp':
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'png':
    case 'gif':
    case 'svg':
      return '/icons/file-types/image.svg'

    // Audio
    case 'mp3':
    case 'wav':
      return '/icons/file-types/audio.svg'

    // Video
    case 'mpg':
    case 'mpeg':
    case 'mov':
    case 'avi':
    case 'mp4':
      return '/icons/file-types/video.svg'

    // Data
    case 'json':
      return '/icons/file-types/json.svg'
    case 'log':
      return '/icons/file-types/txt.svg'

    // Default
    default:
      return '/icons/file-types/default.svg'
  }
}

/**
 * Obté el color de la icona segons l'extensió del fitxer
 */
export function getFileTypeIconColor(extension: string, isDirectory: boolean = false): string {
  if (isDirectory) {
    return 'text-blue-600 dark:text-blue-400'
  }

  const ext = extension.toLowerCase()

  switch (ext) {
    // Documents
    case 'doc':
    case 'docx':
    case 'pdf':
    case 'md':
    case 'markdown':
    case 'txt':
      return 'text-blue-600 dark:text-blue-400'
    case 'html':
    case 'htm':
      return 'text-orange-600 dark:text-orange-400'

    // Spreadsheets
    case 'xls':
    case 'xlsx':
    case 'csv':
      return 'text-emerald-600 dark:text-emerald-400'

    // Presentations
    case 'ppt':
    case 'pptx':
      return 'text-orange-600 dark:text-orange-400'

    // Images
    case 'bmp':
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'png':
    case 'svg':
      return 'text-green-600 dark:text-green-400'

    // Audio
    case 'mp3':
    case 'wav':
      return 'text-purple-600 dark:text-purple-400'

    // Video
    case 'mpg':
    case 'mpeg':
    case 'mov':
    case 'avi':
      return 'text-red-600 dark:text-red-400'

    // Data
    case 'json':
    case 'log':
      return 'text-gray-600 dark:text-gray-400'

    // Default
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}
