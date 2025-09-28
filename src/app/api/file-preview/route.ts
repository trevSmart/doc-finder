import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'
import mammoth from 'mammoth'
import { Pptx2Json } from 'pptx2json'

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

    // Per a fitxers Excel (xlsx, xls), llegir i convertir a JSON
    if (ext === '.xlsx' || ext === '.xls') {
      try {
        const fileBuffer = await fs.readFile(filePath)
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' })

        // Obtenir la primera fulla de càlcul
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convertir a JSON amb headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        // Limitar a les primeres 50 files per a la previsualització
        const limitedData = jsonData.slice(0, 50)

        return NextResponse.json({
          type: 'excel',
          content: limitedData,
          sheetName: firstSheetName,
          totalRows: jsonData.length
        })
      } catch {
        return NextResponse.json(
          { error: 'Failed to read Excel file' },
          { status: 500 }
        )
      }
    }

    // Per a fitxers CSV, retornar el contingut com a text
    if (ext === '.csv') {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      return NextResponse.json({
        type: 'csv',
        content: fileContent
      })
    }

    // Per a fitxers DOCX, convertir a HTML
    if (ext === '.docx') {
      try {
        const fileBuffer = await fs.readFile(filePath)
        const result = await mammoth.convertToHtml({ buffer: fileBuffer })

        return NextResponse.json({
          type: 'docx',
          content: result.value,
          messages: result.messages
        })
      } catch {
        return NextResponse.json(
          { error: 'Failed to read DOCX file' },
          { status: 500 }
        )
      }
    }

    // Per a fitxers PPTX, extreure text de les diapositives
    if (ext === '.pptx') {
      try {
        const fileBuffer = await fs.readFile(filePath)
        const pptx2json = new Pptx2Json()
        const result = await pptx2json.toJson(fileBuffer)

        type RawSlide = {
          title?: string
          content?: string
          notes?: string
        }

        const slides = (result.slides as RawSlide[] | undefined)?.map((slide, index) => ({
          slideNumber: index + 1,
          title: slide.title || `Slide ${index + 1}`,
          content: slide.content || '',
          notes: slide.notes || ''
        })) ?? []

        return NextResponse.json({
          type: 'pptx',
          content: slides,
          totalSlides: slides.length
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to read PPTX file', error)
        return NextResponse.json({
          type: 'pptx-error',
          error: 'No s’ha pogut generar la previsualització de la presentació.',
        })
      }
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

  } catch {
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    )
  }
}
