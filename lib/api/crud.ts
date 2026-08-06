import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/require-auth'
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
      return NextResponse.json({ error: notFoundMessage }, { status: 404 })
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
    slugCheck?: (slug: string, id: string) => Promise<NextResponse | null>
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
      const error = validated.error
      const details =
        error && typeof error === 'object' && 'flatten' in error && typeof (error as { flatten?: unknown }).flatten === 'function'
          ? (error as { flatten: () => unknown }).flatten()
          : error instanceof Error
            ? error.message
            : 'Validation failed'
      return NextResponse.json(
        { error: 'Validation failed', details },
        { status: 400 }
      )
    }

    const existing = await options.find(id)
    if (!existing) {
      return NextResponse.json({ error: options.notFoundMessage }, { status: 404 })
    }

    const data = validated.data as unknown as { slug?: string }
    if (options.slugCheck && typeof data.slug === 'string') {
      const conflict = await options.slugCheck(data.slug, id)
      if (conflict) return conflict
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
      return NextResponse.json({ error: options.notFoundMessage }, { status: 404 })
    }

    await options.delete(id)
    logger.info(`${options.logKey} deleted`, { id })
    return NextResponse.json({ message: 'Deleted' })
  }
}
