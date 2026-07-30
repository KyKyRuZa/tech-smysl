import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { AppError } from '@/lib/errors'

export function withErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json({ error: error.message }, { status: error.statusCode })
      }
      if (error instanceof Error && error.message.includes('File is required')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      logger.error('Unhandled API error', { error })
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
