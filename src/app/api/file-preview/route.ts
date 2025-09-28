import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import * as ExcelJS from 'exceljs'
import mammoth from 'mammoth'
import { Pptx2Json } from 'pptx2json'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    const download = searchParams.get('download') === 'true'

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
        const workbook = new ExcelJS.Workbook()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await workbook.xlsx.load(fileBuffer as any)

        // Obtenir la primera fulla de càlcul
        const worksheet = workbook.worksheets[0]
        if (!worksheet) {
          return NextResponse.json(
            { error: 'No worksheets found in Excel file' },
            { status: 500 }
          )
        }

        // Convertir a JSON amb headers
        const jsonData: unknown[][] = []
        worksheet.eachRow((row) => {
          const rowData: unknown[] = []
          row.eachCell((cell, colNumber) => {
            rowData[colNumber - 1] = cell.value
          })
          jsonData.push(rowData)
        })

        // Limitar a les primeres 50 files per a la previsualització
        const limitedData = jsonData.slice(0, 50)

        return NextResponse.json({
          type: 'excel',
          content: limitedData,
          sheetName: worksheet.name,
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
    const fileName = path.basename(filePath)

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
      case '.pdf':
        contentType = 'application/pdf'
        break
      case '.doc':
        contentType = 'application/msword'
        break
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
      case '.xls':
        contentType = 'application/vnd.ms-excel'
        break
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        break
      case '.ppt':
        contentType = 'application/vnd.ms-powerpoint'
        break
      case '.pptx':
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        break
      case '.txt':
        contentType = 'text/plain'
        break
      case '.csv':
        contentType = 'text/csv'
        break
      case '.json':
        contentType = 'application/json'
        break
      case '.md':
      case '.markdown':
        contentType = 'text/markdown'
        break
      default:
        contentType = 'application/octet-stream'
    }

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', // Cache per 1 hora
    }

    // Si es demana descàrrega, afegir headers per forçar la descàrrega
    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${fileName}"`
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers,
    })

  } catch {
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    )
  }
}
