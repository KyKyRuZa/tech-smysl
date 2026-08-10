import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { applicationSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { validateBody } from '@/lib/auth/middleware'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = validateBody(applicationSchema, body)
    if (!validation.success) {
      return validation.response
    }

    const created = await prisma.application.create({
      data: validation.data,
    })

    logger.info('Application received', { applicationId: created.id })

    return NextResponse.json({ data: { id: created.id, status: 'ok' } }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create application', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
