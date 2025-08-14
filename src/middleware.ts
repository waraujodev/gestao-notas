import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/callback',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/auth-code-error',
  ]

  // Rotas protegidas que precisam de autenticação
  const protectedRoutes = [
    '/dashboard',
    '/suppliers',
    '/invoices',
    '/payments',
    '/api/suppliers',
    '/api/invoices',
    '/api/payments',
  ]

  // Primeiro, atualizar a sessão
  const response = await updateSession(request)

  // Verificar se o usuário está autenticado
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Se está tentando acessar uma rota protegida sem estar logado
  if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se está logado e tentando acessar páginas de auth, redirecionar para dashboard
  if (user && pathname.startsWith('/auth/') && pathname !== '/auth/callback') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Se está logado e acessando a página inicial, redirecionar para dashboard
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - pdf.worker.min.mjs (PDF.js worker)
     * - Static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|pdf.worker.min.mjs|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
