type Bucket = { count: number; resetAt: number }

const store = new Map<string, Bucket>()

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  entry.count += 1
  return entry.count <= max
}

export function loginRateLimitKey(ip: string, email: string): string {
  const normalized = email.trim().toLowerCase()
  return `login:${ip}:${normalized}`
}

export function getClientIp(req: Request): string {
  const xfwd = req.headers.get('x-forwarded-for')
  if (xfwd) return xfwd.split(',')[0]!.trim()
  const xri = req.headers.get('x-real-ip')
  if (xri) return xri
  return 'unknown'
}
