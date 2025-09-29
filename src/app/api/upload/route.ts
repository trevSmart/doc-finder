import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type and size
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Get file bytes
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get destination path from settings or use default
    // For now, we'll use a default uploads folder
    const uploadsDir = join(process.cwd(), 'public/uploads')

    // Ensure uploads directory exists
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true })
    }

    // Create safe filename (sanitize and avoid conflicts)
    const timestamp = new Date().getTime()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedName}`
    const filePath = join(uploadsDir, fileName)

    try {
      await writeFile(filePath, buffer)
    } catch (writeError) {
      console.error('File write error:', writeError)
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
    }

    // Return success response with file info
    return NextResponse.json({
      message: 'File uploaded successfully',
      file: {
        name: fileName,
        originalName: file.name,
        size: file.size,
        path: `/uploads/${fileName}`
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
