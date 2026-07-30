import { describe, it, expect } from 'vitest'
import { encrypt, decrypt } from '@/lib/auth/session'

describe('auth session', () => {
  it('encrypts and decrypts payload', () => {
    const payload = { userId: '123', email: 'admin@example.com', role: 'ADMIN' as const }
    const token = encrypt(payload)
    const decrypted = decrypt(token)
    expect(decrypted).toBeDefined()
    expect(decrypted!.userId).toBe(payload.userId)
    expect(decrypted!.email).toBe(payload.email)
    expect(decrypted!.role).toBe(payload.role)
  })

  it('returns null for invalid token', () => {
    expect(decrypt('invalid-token')).toBeNull()
  })

  it('returns null for empty token', () => {
    expect(decrypt('')).toBeNull()
  })
})
