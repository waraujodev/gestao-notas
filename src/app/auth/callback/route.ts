import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // Em desenvolvimento, redirecionar para localhost
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // Em produção, usar o host correto
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        // Fallback para o origin
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Se chegou aqui, algo deu errado
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}