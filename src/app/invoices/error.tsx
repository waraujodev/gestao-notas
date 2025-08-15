'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, FileText } from 'lucide-react'
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
    console.error('Invoices page error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <AlertTriangle className="h-8 w-8 text-destructive absolute -top-1 -right-1" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Erro ao Carregar Notas Fiscais</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Não foi possível carregar suas notas fiscais. 
            Verifique sua conexão e tente novamente.
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
          onClick={() => router.push('/invoices')} 
          variant="outline"
        >
          <FileText className="mr-2 h-4 w-4" />
          Recarregar Página
        </Button>
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Enquanto isso, você pode:
        </p>
        
        <div className="flex justify-center gap-3">
          <Button 
            onClick={() => router.push('/dashboard')} 
            variant="outline" 
            size="sm"
          >
            Ir para Dashboard
          </Button>
          
          <Button 
            onClick={() => router.push('/suppliers')} 
            variant="outline" 
            size="sm"
          >
            Ver Fornecedores
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Possíveis causas:</p>
          <ul className="space-y-1">
            <li>• Problemas temporários de conexão</li>
            <li>• Manutenção do sistema</li>
            <li>• Muitas notas fiscais sendo carregadas</li>
          </ul>
        </div>
      </div>
    </div>
  )
}