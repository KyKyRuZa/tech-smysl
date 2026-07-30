import multer from 'multer'
import path from 'path'
import { randomUUID } from 'crypto'
import { AppError } from '@/lib/errors'

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const filename = `${randomUUID()}${ext}`
    cb(null, filename)
  },
})

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError(400, 'Invalid file type. Only images are allowed.'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

export function getPublicUrl(filename: string): string {
  return `/uploads/${filename}`
}

export function getAbsolutePath(filename: string): string {
  return path.join(uploadDir, filename)
}
