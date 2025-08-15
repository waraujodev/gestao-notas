'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log do erro para monitoramento
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Erro no Dashboard</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Ocorreu um erro ao carregar as informações do dashboard. 
            Isso pode ser temporário.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-left">
            <p className="text-sm font-mono text-destructive">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                ID do erro: {error.digest}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
        
        <Button 
          onClick={() => router.push('/dashboard')} 
          variant="outline"
        >
          <Home className="mr-2 h-4 w-4" />
          Recarregar Dashboard
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Se o problema persistir, tente:</p>
        <ul className="mt-2 space-y-1">
          <li>• Atualizar a página (F5)</li>
          <li>• Verificar sua conexão com a internet</li>
          <li>• Aguardar alguns minutos e tentar novamente</li>
        </ul>
      </div>
    </div>
  )
}