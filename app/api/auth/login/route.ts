import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validation/schemas'
import { encrypt } from '@/lib/auth/session'
import { UnauthorizedError, AppError } from '@/lib/errors'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = loginSchema.safeParse(body)

    if (!validated.success) {
      logger.warn('Login validation failed', { errors: validated.error.flatten().fieldErrors })
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, password } = validated.data
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

    const session = encrypt({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const cookieStore = await cookies()
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: 'lax',
      path: '/',
    })

    logger.info('User logged in', { userId: user.id, email, role: user.role })

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    logger.error('Login unexpected error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
