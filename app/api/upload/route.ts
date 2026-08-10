import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import path from 'path'
import { mkdir } from 'fs/promises'
import sharp from 'sharp'
import { AppError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { requireAuth } from '@/lib/auth/require-auth'

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'gif'])

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      throw new AppError(400, 'No file uploaded')
    }

    if (file.size > MAX_SIZE) {
      throw new AppError(400, 'File too large. Maximum size is 5 MB.')
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    let format: string
    try {
      const metadata = await sharp(buffer).metadata()
      format = (metadata.format || '').toLowerCase()
    } catch {
      throw new AppError(400, 'Invalid image file.')
    }

    if (!ALLOWED_FORMATS.has(format)) {
      throw new AppError(400, 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
    }

    const filename = `${randomUUID()}.webp`
    const outputPath = path.join(uploadDir, filename)

    await mkdir(uploadDir, { recursive: true })
    await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath)

    const url = `/uploads/${filename}`

    logger.info('Image uploaded and processed', { filename })
    return NextResponse.json({ url, filename }, { status: 201 })
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn('Upload validation error', { statusCode: error.statusCode, message: error.message })
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    logger.error('Upload failed', { error })
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
