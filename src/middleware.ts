import { NextResponse, type NextRequest } from 'next/server'

// Session cookie name (kept in sync with src/lib/auth.ts SESSION_COOKIE).
// Inlined here so the edge middleware does not pull in node:crypto via auth.ts.
const SESSION_COOKIE = 'dtk_session'

/**
 * Middleware:
 * - /dashboard/* requires a session cookie (fast pre-check).
 *   Full session validation happens in server components via requireAuth().
 * - /auth is accessible but has noindex headers (set in next.config.ts too).
 * - Adds security headers on all routes (defense in depth; next.config also sets them).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get(SESSION_COOKIE)?.value
    if (!token) {
      const loginUrl = new URL('/auth', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  const response = NextResponse.next()

  // Extra noindex for auth & dashboard (defense in depth)
  if (pathname === '/auth' || pathname.startsWith('/dashboard')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth'],
}
