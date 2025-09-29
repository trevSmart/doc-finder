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
    // Strictly sanitize filename: allow only alphanumeric, hyphens, underscores, and a single dot for extension
    const originalName = file.name
    const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/)
    const ext = extMatch ? extMatch[0] : ''
    const baseName = extMatch ? originalName.slice(0, -ext.length) : originalName
    const sanitizedBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_')
    const sanitizedExt = ext.replace(/[^.a-zA-Z0-9]/g, '')

    // Whitelist of allowed file extensions (lowercase, with dot)
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx']
    if (!sanitizedExt || !allowedExtensions.includes(sanitizedExt.toLowerCase())) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }
    const fileName = `${timestamp}_${sanitizedBase}${sanitizedExt}`

    // Ensure the sanitized filename does not contain path separators
    if (fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 })
    }
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
