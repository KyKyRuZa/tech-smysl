import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth/session'
import { logger } from '@/lib/logger'

export async function requireAuth(req: NextRequest) {
  const session = req.cookies.get('session')?.value
  const payload = await decrypt(session)

  if (!payload?.userId) {
    logger.warn('Unauthorized API request', { url: req.url })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return payload
}

export async function requireAdmin(req: NextRequest) {
  const payload = await requireAuth(req)

  if (payload instanceof NextResponse) {
    return payload
  }

  if (payload.role !== 'ADMIN') {
    logger.warn('Forbidden API request', { userId: payload.userId, url: req.url })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return payload
}
