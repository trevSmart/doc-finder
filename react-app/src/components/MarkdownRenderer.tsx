import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

interface MarkdownRendererProps {
  url: string
  className?: string
}

export function MarkdownRenderer({ url, className = '' }: MarkdownRendererProps) {
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
        setContent(text)
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
  }, [url])

  if (loading) {
    return (
      <div className={`markdown-loading ${className}`}>
        <div className="loading-spinner"></div>
        <p>Carregant document...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`markdown-error ${className}`}>
        <p>Error carregant el document: {error}</p>
        <a href={url} target="_blank" rel="noreferrer" className="markdown-fallback-link">
          Obrir document original
        </a>
      </div>
    )
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom styling for code blocks
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <pre className="markdown-code-block">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="markdown-inline-code" {...props}>
                {children}
              </code>
            )
          },
          // Custom styling for tables
          table: ({ children }) => (
            <div className="markdown-table-container">
              <table className="markdown-table">{children}</table>
            </div>
          ),
          // Custom styling for links
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="markdown-link">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
