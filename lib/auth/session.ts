import 'server-only'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'

export type UserRole = 'ADMIN' | 'EDITOR'

export interface SessionPayload {
  userId: string
  email: string
  role: UserRole
}

const secretKey = process.env.JWT_SECRET!

export function encrypt(payload: SessionPayload): string {
  return jwt.sign(payload, secretKey, { expiresIn: '7d' })
}

export function decrypt(session: string | undefined = ''): SessionPayload | null {
  try {
    return jwt.verify(session, secretKey) as SessionPayload
  } catch {
    logger.warn('Failed to verify session', { session: session?.slice(0, 20) })
    return null
  }
}

export async function createSession(userId: string, email: string, role: UserRole) {
  const session = encrypt({ userId, email, role })
  const cookieStore = await cookies()

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sameSite: 'lax',
    path: '/',
  })

  logger.info('Session created', { userId, email, role })
}

export async function verifySession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  const payload = decrypt(session)

  if (!payload?.userId) {
    logger.warn('Unauthorized access attempt')
    redirect('/login')
  }

  logger.info('Session verified', { userId: payload.userId })
  return payload
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  logger.info('Session deleted')
}
