'use client'

import { useEffect, useState, useRef } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from './useToast'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  clearError: () => void
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })
  
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()
  const isMountedRef = useRef(true)

  useEffect(() => {
    // Cleanup function para indicar que componente foi desmontado
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }))
          return
        }

        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false,
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Erro ao verificar autenticação',
          loading: false,
        }))
      }
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        }))

        // Refresh da página para atualizar server components
        // Verificar se componente ainda está montado antes de chamar router.refresh()
        if (isMountedRef.current && (event === 'SIGNED_IN' || event === 'SIGNED_OUT')) {
          router.refresh()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router])

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }))
      toast.error('Erro ao fazer login', {
        description: error.message
      })
      return { error }
    }

    // Redirecionar para dashboard após login bem-sucedido
    toast.success('Login realizado com sucesso!')
    router.push('/dashboard')
    return { error: null }
  }

  const signUp = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }))
      toast.error('Erro ao criar conta', {
        description: error.message
      })
      return { error }
    }

    setState(prev => ({ ...prev, loading: false }))
    toast.success('Conta criada com sucesso!', {
      description: 'Verifique seu email para confirmar a conta'
    })
    return { error: null }
  }

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }))
      toast.error('Erro ao fazer logout', {
        description: error.message
      })
      return { error }
    }

    // Redirecionar para login após logout
    toast.success('Logout realizado com sucesso!')
    router.push('/auth/login')
    return { error: null }
  }

  const resetPassword = async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }))
      return { error }
    }

    setState(prev => ({ ...prev, loading: false }))
    return { error: null }
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
  }
}

// Hook para verificar se usuário está autenticado
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  return { user, loading }
}

// Hook para redirecionar usuários autenticados
export function useRedirectIfAuthenticated() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  return { user, loading }
}