import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth/session'
import { logger } from '@/lib/logger'

const protectedRoutes = ['/admin']
const publicRoutes = ['/login', '/']
const apiAuthRoutes = ['/api/auth/login', '/api/auth/logout', '/api/health']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const isApiAuthRoute = apiAuthRoutes.some(route => pathname.startsWith(route))
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  const session = req.cookies.get('session')?.value
  const payload = decrypt(session)

  if (isProtectedRoute && !payload?.userId) {
    logger.warn('Proxy redirect: unauthorized access to protected route', { pathname })
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublicRoute && payload?.userId) {
    logger.info('Proxy redirect: authenticated user on public route', { pathname, userId: payload.userId })
    return NextResponse.redirect(new URL('/admin', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
