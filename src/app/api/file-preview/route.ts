import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      )
    }

    // Verificar que el fitxer existeixi
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json(
        { error: 'File does not exist or access denied' },
        { status: 404 }
      )
    }

    // Determinar el tipus MIME basat en l'extensió
    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'application/octet-stream'

    // Per a fitxers Markdown, retornar el contingut com a text
    if (ext === '.md' || ext === '.markdown') {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      return NextResponse.json({
        type: 'markdown',
        content: fileContent
      })
    }

    // Per a fitxers JSON, retornar el contingut com a text
    if (ext === '.json') {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      return NextResponse.json({
        type: 'json',
        content: fileContent
      })
    }

    // Per a fitxers TXT, retornar el contingut com a text
    if (ext === '.txt') {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      return NextResponse.json({
        type: 'txt',
        content: fileContent
      })
    }

    // Per a altres fitxers, llegir com a buffer
    const fileBuffer = await fs.readFile(filePath)

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.gif':
        contentType = 'image/gif'
        break
      case '.webp':
        contentType = 'image/webp'
        break
      case '.svg':
        contentType = 'image/svg+xml'
        break
      case '.bmp':
        contentType = 'image/bmp'
        break
      default:
        contentType = 'application/octet-stream'
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache per 1 hora
      },
    })

  } catch (error) {
    console.error('Error reading file:', error)
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    )
  }
}
