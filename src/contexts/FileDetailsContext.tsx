'use client'

import { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react'
import { FileItem } from '../types/file'
import { useFileTags } from './FileTagsContext'

interface FileDetailsContextType {
  isOpen: boolean
  selectedFile: FileItem | null
  openFileDetails: (file: FileItem) => void
  closeFileDetails: () => void
}

const FileDetailsContext = createContext<FileDetailsContextType | undefined>(undefined)

export function FileDetailsProvider({ children }: { children: ReactNode }) {
  const CLOSE_DELAY_MS = 320
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const { getFileTags } = useFileTags()
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [])

  const openFileDetails = (file: FileItem) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    // Add tags to the file object
    const fileWithTags = {
      ...file,
      tags: getFileTags(file.path)
    }
    setSelectedFile(fileWithTags)
    setIsOpen(true)
  }

  const closeFileDetails = () => {
    setIsOpen(false)
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    closeTimeoutRef.current = setTimeout(() => {
      setSelectedFile(null)
      closeTimeoutRef.current = null
    }, CLOSE_DELAY_MS)
  }

  return (
    <FileDetailsContext.Provider
      value={{
        isOpen,
        selectedFile,
        openFileDetails,
        closeFileDetails,
      }}
    >
      {children}
    </FileDetailsContext.Provider>
  )
}

export function useFileDetails() {
  const context = useContext(FileDetailsContext)
  if (context === undefined) {
    throw new Error('useFileDetails must be used within a FileDetailsProvider')
  }
  return context
}
