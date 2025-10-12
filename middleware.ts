import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin/* and /dashboard/* routes except /admin/login
  if (
    (pathname.startsWith('/admin') && pathname !== '/admin/login') ||
    pathname.startsWith('/dashboard')
  ) {
    const token = request.cookies.get('admin_session')?.value

    if (!token) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // Verify JWT token
      await jwtVerify(token, JWT_SECRET)
      // Token is valid, allow request to proceed
      return NextResponse.next()
    } catch (error) {
      // Token is invalid or expired, redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect /api/admin/* routes except /api/admin/login
  if (
    pathname.startsWith('/api/admin') &&
    pathname !== '/api/admin/login'
  ) {
    const token = request.cookies.get('admin_session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Verify JWT token
      await jwtVerify(token, JWT_SECRET)
      // Token is valid, allow request to proceed
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/api/admin/:path*'],
}
