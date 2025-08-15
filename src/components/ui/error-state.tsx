'use client'

import { AlertCircle, Wifi, RefreshCw, AlertTriangle, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorStateProps {
  title?: string
  description?: string
  type?: 'network' | 'validation' | 'server' | 'not-found' | 'generic'
  onRetry?: () => void
  retryLabel?: string
  className?: string
  children?: React.ReactNode
}

const errorConfig = {
  network: {
    icon: Wifi,
    title: 'Erro de Conexão',
    description: 'Verifique sua conexão com a internet e tente novamente.',
    iconColor: 'text-amber-600'
  },
  validation: {
    icon: AlertCircle,
    title: 'Dados Inválidos',
    description: 'Verifique os campos marcados e corrija as informações.',
    iconColor: 'text-red-600'
  },
  server: {
    icon: AlertTriangle,
    title: 'Erro do Servidor',
    description: 'Ocorreu um problema em nossos servidores. Tente novamente em alguns instantes.',
    iconColor: 'text-red-600'
  },
  'not-found': {
    icon: AlertCircle,
    title: 'Não Encontrado',
    description: 'O item que você está procurando não foi encontrado.',
    iconColor: 'text-gray-600'
  },
  generic: {
    icon: Bug,
    title: 'Erro Inesperado',
    description: 'Algo deu errado. Nossa equipe foi notificada.',
    iconColor: 'text-red-600'
  }
}

export function ErrorState({
  title,
  description,
  type = 'generic',
  onRetry,
  retryLabel = 'Tentar Novamente',
  className = '',
  children
}: ErrorStateProps) {
  const config = errorConfig[type]
  const Icon = config.icon

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className={`p-3 rounded-full bg-muted mb-4`}>
        <Icon className={`w-8 h-8 ${config.iconColor}`} />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {title || config.title}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {description || config.description}
      </p>

      {children && (
        <div className="mb-6 w-full max-w-md">
          {children}
        </div>
      )}

      {onRetry && (
        <Button onClick={onRetry} className="min-w-32">
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

// Componente específico para erros em cards
export function ErrorCard({
  title,
  description,
  type = 'generic',
  onRetry,
  retryLabel = 'Tentar Novamente'
}: ErrorStateProps) {
  const config = errorConfig[type]
  const Icon = config.icon

  return (
    <Card>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <CardTitle className="text-base">
          {title || config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <CardDescription className="mb-4">
          {description || config.description}
        </CardDescription>
        {onRetry && (
          <Button onClick={onRetry} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Componente inline para erros menores
export function InlineError({
  message,
  type = 'validation'
}: {
  message: string
  type?: 'validation' | 'network' | 'server'
}) {
  const getVariant = () => {
    switch (type) {
      case 'validation':
        return 'destructive'
      case 'network':
        return 'default'
      case 'server':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <Alert variant={getVariant() as any} className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  )
}

// Hook para gerenciar estados de erro
export function useErrorState() {
  const [error, setError] = React.useState<{
    message: string
    type: ErrorStateProps['type']
  } | null>(null)

  const showError = (message: string, type: ErrorStateProps['type'] = 'generic') => {
    setError({ message, type })
  }

  const clearError = () => {
    setError(null)
  }

  return {
    error,
    showError,
    clearError,
    hasError: error !== null
  }
}

import React from 'react'