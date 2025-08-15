'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log do erro para monitoramento
    console.error('ErrorBoundary capturou um erro:', error, errorInfo)
    
    // Callback personalizado para reportar erro
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// Componente padrão de fallback para erros
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Oops! Algo deu errado</CardTitle>
          <CardDescription>
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDevelopment && (
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Detalhes do erro (modo desenvolvimento):
              </p>
              <code className="text-xs text-destructive break-all">
                {error.name}: {error.message}
              </code>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook para usar ErrorBoundary de forma mais simples
export function useErrorHandler() {
  return (error: Error) => {
    // Em desenvolvimento, mostrar o erro no console
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro capturado:', error)
    }
    
    // Em produção, você pode enviar para um serviço de monitoramento
    // como Sentry, Bugsnag, etc.
    throw error
  }
}

// Componente de fallback para erros específicos de páginas
export function PageErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-6">
          A página que você está procurando não existe ou ocorreu um erro.
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={resetError}>
            Tentar novamente
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
export type { ErrorBoundaryProps, ErrorFallbackProps }