'use client'

import { useState, useEffect } from 'react'
import { FileItem, FileListResponse } from '../types/file'
import { getFileTypeInfo } from '../utils/fileUtils'

export function useFileList(folderPath: string) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('useFileList: folderPath =', folderPath)
    if (!folderPath) {
      setFiles([])
      return
    }

    const fetchFiles = async () => {
      console.log('useFileList: fetching files for path:', folderPath)
      setLoading(true)
      setError(null)

      try {
        // Simulació de l'API per llistar fitxers
        // En un entorn real, això seria una crida a una API
        const mockFileNames = [
          // Documents
          'project_proposal.docx',
          'user_manual.pdf',
          'README.md',
          'config.txt',
          'index.html',

          // Spreadsheets
          'budget_2024.xlsx',
          'sales_data.csv',

          // Presentations
          'quarterly_review.pptx',

          // Images
          'logo.png',
          'screenshot.jpg',
          'diagram.svg',
          'photo.webp',
          'icon.bmp',

          // Audio
          'meeting_recording.mp3',
          'voice_note.wav',

          // Video
          'demo_video.mov',
          'tutorial.avi',
          'presentation.mpg',

          // Data
          'config.json',
          'error.log',

          // Directories
          'documents',
          'images',
          'videos',
          'audio_files'
        ]

        const mockFiles: FileItem[] = mockFileNames.map((fileName, index) => {
          const isDirectory = !fileName.includes('.')
          const typeInfo = isDirectory ? null : getFileTypeInfo(fileName)

          return {
            name: fileName,
            path: `${folderPath}/${fileName}`,
            type: isDirectory ? 'directory' : 'file',
            size: isDirectory ? undefined : Math.floor(Math.random() * 10000000) + 1000, // 1KB to 10MB
            extension: typeInfo?.extension,
            lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
            isDirectory,
            category: typeInfo?.category,
            mimeType: typeInfo?.mimeType
          }
        })

        // Simular delay de xarxa
        await new Promise(resolve => setTimeout(resolve, 100))

        console.log('useFileList: setting files:', mockFiles.length)
        setFiles(mockFiles)
      } catch (err) {
        setError('Error al carregar els fitxers')
        console.error('Error fetching files:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [folderPath])

  return { files, loading, error }
}
