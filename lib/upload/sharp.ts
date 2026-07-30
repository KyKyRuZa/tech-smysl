import sharp from 'sharp'
import { getAbsolutePath } from './multer'
import { logger } from '@/lib/logger'

const OUTPUT_EXT = '.webp'

export async function processImage(filename: string): Promise<string> {
  const inputPath = getAbsolutePath(filename)
  const outputFilename = filename.replace(/\.[^/.]+$/, OUTPUT_EXT)
  const outputPath = getAbsolutePath(outputFilename)

  try {
    const metadata = await sharp(inputPath).metadata()
    const { width, height } = metadata

    let resizeWidth = width
    let resizeHeight = height
    const MAX_WIDTH = 1920
    const MAX_HEIGHT = 1080

    if (width && height) {
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
        resizeWidth = Math.round(width * ratio)
        resizeHeight = Math.round(height * ratio)
      }
    }

    await sharp(inputPath)
      .resize(resizeWidth, resizeHeight, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath)

    try {
      await sharp(inputPath).metadata()
      const fs = await import('fs/promises')
      await fs.unlink(inputPath)
    } catch {
      logger.warn('Failed to remove original file', { inputPath })
    }

    logger.info('Image processed', { filename, outputFilename, width: resizeWidth, height: resizeHeight })
    return outputFilename
  } catch (error) {
    logger.error('Failed to process image', { filename, error })
    throw new Error(`Failed to process image: ${filename}`)
  }
}
