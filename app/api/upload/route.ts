import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import path from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { processImage } from '@/lib/upload/sharp'
import { getPublicUrl } from '@/lib/upload/multer'
import { AppError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { requireAuth } from '@/lib/auth/require-auth'

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      throw new AppError(400, 'No file uploaded')
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new AppError(400, 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
    }

    if (file.size > MAX_SIZE) {
      throw new AppError(400, 'File too large. Maximum size is 5 MB.')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = path.extname(file.name) || '.webp'
    const filename = `${randomUUID()}${ext}`

    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)

    const processedFilename = await processImage(filename)
    const url = getPublicUrl(processedFilename)

    logger.info('Image uploaded and processed', { filename: processedFilename })
    return NextResponse.json({ url, filename: processedFilename }, { status: 201 })
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn('Upload validation error', { statusCode: error.statusCode, message: error.message })
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    logger.error('Upload failed', { error })
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}