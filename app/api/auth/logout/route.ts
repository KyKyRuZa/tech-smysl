import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth/session'
import { logger } from '@/lib/logger'

export async function POST() {
  await deleteSession()
  logger.info('User logged out')
  return NextResponse.json({ message: 'Logged out successfully' })
}
