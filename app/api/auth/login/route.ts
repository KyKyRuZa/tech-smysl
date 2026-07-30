import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validation/schemas'
import { createSession } from '@/lib/auth/session'
import { UnauthorizedError } from '@/lib/errors'
import bcrypt from 'bcrypt'
import { logger } from '@/lib/logger'
import { validateBody } from '@/lib/auth/middleware'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = validateBody(loginSchema, body)
    if (!validation.success) {
      logger.warn('Login validation failed', { errors: validation.response.json() })
      return validation.response
    }

    const { email, password } = validation.data
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true, role: true },
    })

    if (!user) {
      logger.warn('Login attempt with non-existent email', { email })
      throw new UnauthorizedError('Invalid credentials')
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      logger.warn('Invalid password attempt', { userId: user.id, email })
      throw new UnauthorizedError('Invalid credentials')
    }

    await createSession(user.id, user.email, user.role)

    logger.info('User logged in', { userId: user.id, email, role: user.role })

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    logger.error('Login unexpected error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
