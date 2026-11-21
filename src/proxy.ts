import { NextResponse, type NextRequest } from 'next/server'

const SESSION_COOKIE = 'dtk_session'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin')
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: 'Requête cross-origin refusée.' }, { status: 403 })
    }
  }

  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get(SESSION_COOKIE)?.value
    if (!token) {
      const loginUrl = new URL('/auth', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  const response = NextResponse.next()
  if (pathname === '/auth' || pathname.startsWith('/dashboard')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth', '/api/:path*'],
}
