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
    // Folder icon is stored in the legacy svg set
    return '/icons/file-types/old/folder.svg'
  }

  const ext = extension.toLowerCase()

  switch (ext) {
    // Documents
    case 'doc':
    case 'docx':
      return '/icons/file-types/doc.webp'
    case 'pdf':
      return '/icons/file-types/pdf.webp'
    case 'md':
    case 'markdown':
      return '/icons/file-types/txt.webp'
    case 'txt':
      return '/icons/file-types/txt.webp'
    case 'html':
    case 'htm':
      return '/icons/file-types/html.webp'

    // Spreadsheets
    case 'xls':
    case 'xlsx':
      return '/icons/file-types/xls.webp'
    case 'csv':
      return '/icons/file-types/csv.webp'

    // Presentations
    case 'ppt':
    case 'pptx':
      return '/icons/file-types/ppt.webp'

    // Images
    case 'bmp':
      return '/icons/file-types/jpg.webp'
    case 'jpg':
    case 'jpeg':
      return '/icons/file-types/jpg.webp'
    case 'webp':
      return '/icons/file-types/jpg.webp'
    case 'png':
      return '/icons/file-types/png.webp'
    case 'gif':
      return '/icons/file-types/gif.webp'
    case 'svg':
      return '/icons/file-types/svg.webp'

    // Audio
    case 'mp3':
      return '/icons/file-types/mp3.webp'
    case 'wav':
      return '/icons/file-types/wav.webp'

    // Video
    case 'mpg':
    case 'mpeg':
    case 'mov':
    case 'mp4':
      return '/icons/file-types/avi.webp'
    case 'avi':
      return '/icons/file-types/avi.webp'

    // Data
    case 'json':
      return '/icons/file-types/txt.webp'
    case 'log':
      return '/icons/file-types/txt.webp'

    // Other specific icons available in the set
    case 'css':
      return '/icons/file-types/css.webp'
    case 'dll':
      return '/icons/file-types/dll.webp'
    case 'dmg':
      return '/icons/file-types/dmg.webp'
    case 'eps':
      return '/icons/file-types/eps.webp'
    case 'exe':
      return '/icons/file-types/exe.webp'
    case 'flac':
      return '/icons/file-types/flac.webp'
    case 'rar':
      return '/icons/file-types/rar.webp'
    case 'rtf':
      return '/icons/file-types/rtf.webp'
    case 'sql':
      return '/icons/file-types/sql.webp'
    case 'url':
      return '/icons/file-types/url.webp'
    case 'xml':
      return '/icons/file-types/xml.webp'
    case 'zip':
      return '/icons/file-types/zip.webp'

    // Default
    default:
      return '/icons/file-types/doc.webp'
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
