import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownPreviewProps {
  url: string
  maxLength?: number
  className?: string
}

export function MarkdownPreview({ url, maxLength = 200, className = '' }: MarkdownPreviewProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const text = await response.text()
        // Truncar el contingut per mantenir la preview curta
        const truncatedContent = text.length > maxLength
          ? text.substring(0, maxLength) + '...'
          : text

        setContent(truncatedContent)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading markdown')
        setContent('')
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      fetchMarkdown()
    }
  }, [url, maxLength])

  if (loading) {
    return (
      <div className={`markdown-preview-loading ${className}`}>
        <div className="loading-spinner-small"></div>
        <span>Carregant...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`markdown-preview-error ${className}`}>
        <span>Error carregant preview</span>
      </div>
    )
  }

  return (
    <div className={`markdown-preview ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Simplificar els components per la preview
          h1: ({ children }) => <h4 className="markdown-preview-h1">{children}</h4>,
          h2: ({ children }) => <h5 className="markdown-preview-h2">{children}</h5>,
          h3: ({ children }) => <h6 className="markdown-preview-h3">{children}</h6>,
          h4: ({ children }) => <h6 className="markdown-preview-h4">{children}</h6>,
          h5: ({ children }) => <h6 className="markdown-preview-h5">{children}</h6>,
          h6: ({ children }) => <h6 className="markdown-preview-h6">{children}</h6>,
          p: ({ children }) => <p className="markdown-preview-p">{children}</p>,
          code: ({ children }) => <code className="markdown-preview-code">{children}</code>,
          pre: ({ children }) => <pre className="markdown-preview-pre">{children}</pre>,
          ul: ({ children }) => <ul className="markdown-preview-ul">{children}</ul>,
          ol: ({ children }) => <ol className="markdown-preview-ol">{children}</ol>,
          li: ({ children }) => <li className="markdown-preview-li">{children}</li>,
          // Ometre taules i altres elements complexos per la preview
          table: () => null,
          blockquote: () => null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
