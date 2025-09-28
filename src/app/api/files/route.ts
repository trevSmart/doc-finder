import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { FileItem } from '../../../types/file'
import { getFileTypeInfo } from '../../../utils/fileUtils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderPath = searchParams.get('path')

    if (!folderPath) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      )
    }

    // Verificar que el path existeixi
    try {
      await fs.access(folderPath)
    } catch {
      return NextResponse.json(
        { error: 'Folder does not exist or access denied' },
        { status: 404 }
      )
    }

    // Llegir el contingut del directori
    const entries = await fs.readdir(folderPath, { withFileTypes: true })

    const files: FileItem[] = []

    for (const entry of entries) {
      // Ignorar fitxers ocults (que comencen amb punt)
      if (entry.name.startsWith('.')) {
        continue
      }

      const fullPath = path.join(folderPath, entry.name)
      const isDirectory = entry.isDirectory()

      let stats
      try {
        stats = await fs.stat(fullPath)
      } catch {
        // Si no podem llegir les estadístiques, saltem aquest fitxer
        continue
      }

      const typeInfo = isDirectory ? null : getFileTypeInfo(entry.name)
      const isImage = typeInfo?.category === 'image'

      const fileItem: FileItem = {
        name: entry.name,
        path: fullPath,
        type: isDirectory ? 'directory' : 'file',
        size: isDirectory ? undefined : stats.size,
        extension: typeInfo?.extension,
        lastModified: stats.mtime,
        isDirectory,
        category: typeInfo?.category,
        mimeType: typeInfo?.mimeType,
        // Per a imatges, generem una URL de previsualització
        imageUrl: isImage ? `/api/file-preview?path=${encodeURIComponent(fullPath)}` : undefined
      }

      files.push(fileItem)
    }

    // Ordenar: directoris primer, després fitxers per nom
    files.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({
      files,
      path: folderPath,
      totalCount: files.length
    })

  } catch {
    return NextResponse.json(
      { error: 'Failed to read directory' },
      { status: 500 }
    )
  }
}
