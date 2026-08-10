import { describe, it, expect } from 'vitest'
import { AppError, NotFoundError } from '@/lib/errors'

describe('instanceof check', () => {
  it('checks instanceof', () => {
    const e = new NotFoundError('test')
    expect(e instanceof AppError).toBe(true)
    expect(e instanceof Error).toBe(true)
    expect(e.statusCode).toBe(404)
  })
})
