import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
import { NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger'

export function createGetHandler<T>(
  findFn: (id: string) => Promise<T | null>,
  notFoundMessage: string
) {
  return async (
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params
    const item = await findFn(id)

    if (!item) {
      throw new NotFoundError(notFoundMessage)
    }

    return NextResponse.json({ data: item })
  }
}

export function createPutHandler<TData, TEntity extends { id: string }>(
  options: {
    find: (id: string) => Promise<TEntity | null>
    update: (id: string, data: TData) => Promise<TEntity>
    validate: (body: unknown) => { success: boolean; data?: TData; error?: unknown }
    notFoundMessage: string
    logKey: string
  }
) {
  return async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const body = await req.json()
    const validated = options.validate(body)

    if (!validated.success || !validated.data) {
      const details = validated.error instanceof Error
        ? validated.error.message
        : 'Validation failed'
      return NextResponse.json(
        { error: 'Validation failed', details },
        { status: 400 }
      )
    }

    const existing = await options.find(id)
    if (!existing) {
      throw new NotFoundError(options.notFoundMessage)
    }

    const updated = await options.update(id, validated.data)
    logger.info(`${options.logKey} updated`, { id: updated.id })
    return NextResponse.json({ data: updated })
  }
}

export function createDeleteHandler(
  options: {
    find: (id: string) => Promise<unknown>
    delete: (id: string) => Promise<unknown>
    notFoundMessage: string
    logKey: string
  }
) {
  return async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const auth = await requireAuth(req)
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const existing = await options.find(id)
    if (!existing) {
      throw new NotFoundError(options.notFoundMessage)
    }

    await options.delete(id)
    logger.info(`${options.logKey} deleted`, { id })
    return NextResponse.json({ message: 'Deleted' })
  }
}
