import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth/session'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  await deleteSession()
  logger.info('User logged out')
  return NextResponse.redirect(new URL('/login', req.url), 303)
}
