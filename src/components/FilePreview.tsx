'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { FileItem, FileCategory } from '../types/file'
import { isImageFile } from '../utils/fileUtils'
import {
  DocumentIcon,
  PhotoIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  CodeBracketIcon,
  FolderIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { useFilePreview } from '../contexts/FilePreviewContext'
import type { PptxSlide } from '../types/filePreview'

interface FilePreviewProps {
  file: FileItem
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'card' | 'sidebar'
}

const sizeClasses: Record<NonNullable<FilePreviewProps['size']>, string> = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
  card: 'h-full w-full',
  sidebar: 'h-full w-full',
}

const iconSizes: Record<NonNullable<FilePreviewProps['size']>, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  card: 'h-16 w-16',
  sidebar: 'h-20 w-20',
}

const skeletonSizes: Record<NonNullable<FilePreviewProps['size']>, string> = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  card: 'h-full w-full',
  sidebar: 'h-full w-full',
}

export default function FilePreview({ file, className = '', size = 'md' }: FilePreviewProps) {
  const { entry } = useFilePreview(file)
  const { status, data, error: cachedError } = entry

  const imageUrl = useMemo(() => {
    if (data?.type === 'image') {
      return data.url
    }
    if (isImageFile(file.name) && file.imageUrl) {
      return file.imageUrl
    }
    return null
  }, [data, file])

  const markdownContent = data?.type === 'markdown' ? data.content : null
  const jsonContent = data?.type === 'json' ? data.content : null
  const txtContent = data?.type === 'txt' ? data.content : null
  const excelContent = data?.type === 'excel' ? data.content : null
  const csvContent = data?.type === 'csv' ? data.content : null
  const docxContent = data?.type === 'docx' ? data.content : null
  const pptxContent = data?.type === 'pptx' ? data.content : null
  const pptxError = data?.type === 'pptx-error' ? data.error : null

  const effectiveError = cachedError ?? pptxError
  const isPending = status === 'idle' || status === 'queued' || status === 'loading'

  const hasPreviewContent = Boolean(
    imageUrl ||
      markdownContent ||
      jsonContent ||
      txtContent ||
      (Array.isArray(excelContent) && excelContent.length > 0) ||
      csvContent ||
      docxContent ||
      (Array.isArray(pptxContent) && pptxContent.length > 0)
  )

  const renderSkeleton = () => (
    <div
      className={`${skeletonSizes[size]} rounded-md bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse`}
      aria-hidden
    />
  )

  const getFileIcon = (category?: FileCategory, isDirectory?: boolean) => {
    if (isDirectory) {
      return <FolderIcon className={`${iconSizes[size]} text-blue-500 dark:text-blue-400`} />
    }

    switch (category) {
      case 'image':
        return <PhotoIcon className={`${iconSizes[size]} text-green-500 dark:text-green-400`} />
      case 'audio':
        return <MusicalNoteIcon className={`${iconSizes[size]} text-purple-500 dark:text-purple-400`} />
      case 'video':
        return <VideoCameraIcon className={`${iconSizes[size]} text-red-500 dark:text-red-400`} />
      case 'spreadsheet':
        return <TableCellsIcon className={`${iconSizes[size]} text-emerald-500 dark:text-emerald-400`} />
      case 'presentation':
        return <PresentationChartBarIcon className={`${iconSizes[size]} text-orange-500 dark:text-orange-400`} />
      case 'data':
        return <CodeBracketIcon className={`${iconSizes[size]} text-gray-500 dark:text-gray-400`} />
      case 'document':
      default:
        return <DocumentIcon className={`${iconSizes[size]} text-gray-500 dark:text-gray-400`} />
    }
  }

  const getBackgroundColor = (category?: FileCategory, isDirectory?: boolean) => {
    if (isDirectory) {
      return 'bg-blue-50 dark:bg-blue-500/10'
    }

    switch (category) {
      case 'image':
        return 'bg-green-50 dark:bg-green-500/10'
      case 'audio':
        return 'bg-purple-50 dark:bg-purple-500/10'
      case 'video':
        return 'bg-red-50 dark:bg-red-500/10'
      case 'spreadsheet':
        return 'bg-emerald-50 dark:bg-emerald-500/10'
      case 'presentation':
        return 'bg-orange-50 dark:bg-orange-500/10'
      case 'data':
        return 'bg-gray-50 dark:bg-gray-500/10'
      case 'document':
      default:
        return 'bg-gray-50 dark:bg-gray-500/10'
    }
  }

  const formatJsonWithSyntaxHighlighting = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      const formatted = JSON.stringify(parsed, null, 2)

      return formatted
        .replace(/(".*?")\s*:/g, '<span class="json-key">$1</span>:')
        .replace(/:\s*(".*?")/g, ': <span class="json-string">$1</span>')
        .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
        .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
        .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    } catch {
      return jsonString
    }
  }

  const renderImagePreview = () => {
    if (!imageUrl) {
      return null
    }

    return (
      <img
        src={imageUrl}
        alt={`Preview of ${file.name}`}
        className="w-full h-full object-cover"
        onError={() => {
          // noop: handled by cache error state on next ensure
        }}
      />
    )
  }

  const renderMarkdownPreview = () => {
    if (!markdownContent) {
      return null
    }

    return (
      <div className="w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 overflow-y-auto">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-sm font-bold mb-1">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xs font-semibold mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xs font-medium mb-1">{children}</h3>,
              p: ({ children }) => <p className="text-xs mb-1 leading-tight">{children}</p>,
              ul: ({ children }) => <ul className="text-xs mb-1 pl-2">{children}</ul>,
              ol: ({ children }) => <ol className="text-xs mb-1 pl-2">{children}</ol>,
              li: ({ children }) => <li className="text-xs mb-0.5">{children}</li>,
              code: ({ children }) => <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">{children}</code>,
              pre: ({ children }) => <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded overflow-x-auto">{children}</pre>,
              blockquote: ({ children }) => <blockquote className="text-xs border-l-2 border-gray-300 dark:border-gray-600 pl-2 italic">{children}</blockquote>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>
    )
  }

  const renderJsonPreview = () => {
    if (!jsonContent) {
      return null
    }

    return (
      <div className="w-full h-full bg-gray-900 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 overflow-y-auto">
        <pre className="text-xs text-gray-100 dark:text-gray-200 font-mono leading-tight whitespace-pre-wrap">
          <code
            dangerouslySetInnerHTML={{
              __html: formatJsonWithSyntaxHighlighting(jsonContent),
            }}
          />
        </pre>
      </div>
    )
  }

  const renderTxtPreview = () => {
    if (!txtContent) {
      return null
    }

    return (
      <div className="w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 overflow-y-auto">
        <pre className="text-xs text-gray-600 dark:text-gray-300 font-mono leading-tight whitespace-pre-wrap">{txtContent}</pre>
      </div>
    )
  }

  const renderExcelPreview = () => {
    if (!excelContent || !Array.isArray(excelContent)) {
      return null
    }

    return (
      <div className="w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full text-xs">
            <tbody>
              {excelContent.slice(0, 20).map((row: unknown[], rowIndex: number) => (
                <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-100 dark:bg-gray-700 font-semibold' : ''}>
                  {Array.isArray(row)
                    ? row.slice(0, 10).map((cell: unknown, cellIndex: number) => (
                        <td key={cellIndex} className="border border-gray-200 dark:border-gray-600 px-1 py-0.5 text-left">
                          {cell !== null && cell !== undefined ? String(cell) : ''}
                        </td>
                      ))
                    : (
                        <td className="border border-gray-200 dark:border-gray-600 px-1 py-0.5 text-left">
                          {row !== null && row !== undefined ? String(row) : ''}
                        </td>
                      )}
                </tr>
              ))}
            </tbody>
          </table>
          {excelContent.length > 20 && (
            <div className="text-center py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
              ... i {excelContent.length - 20} files més
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderCsvPreview = () => {
    if (!csvContent) {
      return null
    }

    const lines = csvContent.split('\n').slice(0, 20)
    const rows = lines.map(line => line.split(','))

    return (
      <div className="w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full text-xs">
            <tbody>
              {rows.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-100 dark:bg-gray-700 font-semibold' : ''}>
                  {row.slice(0, 10).map((cell: string, cellIndex: number) => (
                    <td key={cellIndex} className="border border-gray-200 dark:border-gray-600 px-1 py-0.5 text-left">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {lines.length > 20 && (
            <div className="text-center py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
              ... i {lines.length - 20} files més
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderDocxPreview = () => {
    if (!docxContent) {
      return null
    }

    return (
      <div className="w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-full overflow-auto p-2">
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs" dangerouslySetInnerHTML={{ __html: docxContent }} />
        </div>
      </div>
    )
  }

  const renderPptxPreview = () => {
    if (!pptxContent || !Array.isArray(pptxContent)) {
      return null
    }

    return (
      <div className="w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-full overflow-auto p-2">
          <div className="space-y-2">
            {pptxContent.slice(0, 5).map((slide: PptxSlide, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{slide.title}</div>
                {slide.content && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {slide.content.length > 100 ? `${slide.content.substring(0, 100)}...` : slide.content}
                  </div>
                )}
              </div>
            ))}
            {pptxContent.length > 5 && (
              <div className="text-center py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded">
                ... i {pptxContent.length - 5} diapositives més
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const canShowPreview = !file.isDirectory && hasPreviewContent && !effectiveError

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      {canShowPreview ? (
        <>
          {imageUrl && renderImagePreview()}
          {!imageUrl && markdownContent && renderMarkdownPreview()}
          {!imageUrl && !markdownContent && jsonContent && renderJsonPreview()}
          {!imageUrl && !markdownContent && !jsonContent && txtContent && renderTxtPreview()}
          {!imageUrl && !markdownContent && !jsonContent && !txtContent && excelContent && renderExcelPreview()}
          {!imageUrl && !markdownContent && !jsonContent && !txtContent && !excelContent && csvContent && renderCsvPreview()}
          {!imageUrl && !markdownContent && !jsonContent && !txtContent && !excelContent && !csvContent && docxContent && renderDocxPreview()}
          {!imageUrl && !markdownContent && !jsonContent && !txtContent && !excelContent && !csvContent && !docxContent && pptxContent && renderPptxPreview()}
        </>
      ) : (
        <div
          className={`${sizeClasses[size]} ${getBackgroundColor(file.category, file.isDirectory)} ${size === 'card' ? 'rounded-b-xl' : 'rounded-lg'} flex items-center justify-center`}
        >
          {isPending ? (
            renderSkeleton()
          ) : effectiveError ? (
            <div className="flex flex-col items-center text-center space-y-1 px-2">
              <ExclamationTriangleIcon className={`${iconSizes[size]} text-yellow-500 dark:text-yellow-400`} />
              {size !== 'sm' && size !== 'md' && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400">{effectiveError}</p>
              )}
            </div>
          ) : (
            getFileIcon(file.category, file.isDirectory)
          )}
        </div>
      )}
    </div>
  )
}
