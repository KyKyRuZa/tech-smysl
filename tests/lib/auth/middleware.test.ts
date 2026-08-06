import { describe, it, expect } from 'vitest'
import { validateBody } from '@/lib/auth/middleware'
import { z } from 'zod'

const testSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

describe('validateBody', () => {
  it('returns success for valid body', () => {
    const body = { email: 'test@example.com', password: 'secret' }
    const result = validateBody(testSchema, body)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(body)
    }
  })

  it('returns failure for invalid body', () => {
    const body = { email: 'not-an-email', password: '' }
    const result = validateBody(testSchema, body)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(400)
      expect(result.response.headers.get('content-type')).toBe('application/json')
    }
  })

  it('returns failure for missing fields', () => {
    const body = { email: 'test@example.com' }
    const result = validateBody(testSchema, body)
    expect(result.success).toBe(false)
    if (!result.success) {
      const json = result.response as Response
      expect(json.status).toBe(400)
    }
  })
})
