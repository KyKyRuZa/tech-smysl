import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export function parseJsonBody(req: NextRequest): Promise<unknown> {
  return req.json()
}

export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(body)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    response: NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten().fieldErrors },
      { status: 400 }
    ),
  }
}
