import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth'

// Routes that require authentication
const protectedRoutes = ['/gorevler', '/profil', '/mesajlar', '/admin']
// Routes that should redirect to dashboard if already logged in
const authRoutes = ['/giris', '/kayit']
// Admin only routes
const adminRoutes = ['/admin']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isAuthRoute = authRoutes.includes(path)
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route))

  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie)

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/giris', req.nextUrl))
  }

  // Redirect to dashboard if accessing auth routes with valid session
  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL('/gorevler', req.nextUrl))
  }

  // Check admin access
  if (isAdminRoute && session?.role !== 'admin') {
    return NextResponse.redirect(new URL('/gorevler', req.nextUrl))
  }

  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\.png$).*)'],
}