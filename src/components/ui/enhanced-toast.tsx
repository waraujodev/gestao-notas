'use client'

import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface EnhancedToastOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useEnhancedToast() {
  const toastHooks = useToast()

  const showToast = (
    type: ToastType,
    message: string,
    options: EnhancedToastOptions = {}
  ) => {
    const { title, description, duration, action } = options

    const getIcon = () => {
      switch (type) {
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-600" />
        case 'error':
          return <XCircle className="h-5 w-5 text-red-600" />
        case 'warning':
          return <AlertCircle className="h-5 w-5 text-amber-600" />
        case 'info':
          return <Info className="h-5 w-5 text-blue-600" />
        case 'loading':
          return <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
        default:
          return <Info className="h-5 w-5 text-gray-600" />
      }
    }

    const getVariant = () => {
      switch (type) {
        case 'success':
          return 'default'
        case 'error':
          return 'destructive'
        case 'warning':
          return 'default'
        case 'info':
          return 'default'
        case 'loading':
          return 'default'
        default:
          return 'default'
      }
    }

    // Usar o toast apropriado baseado no tipo
    switch (type) {
      case 'success':
        return toastHooks.success(title || message)
      case 'error':
        return toastHooks.error(title || message)
      case 'warning':
        return toastHooks.warning(title || message)
      case 'info':
        return toastHooks.info(title || message)
      case 'loading':
        return toastHooks.loading(title || message)
      default:
        return toastHooks.info(title || message)
    }
  }

  return {
    success: (message: string, options?: EnhancedToastOptions) =>
      showToast('success', message, options),
    
    error: (message: string, options?: EnhancedToastOptions) =>
      showToast('error', message, options),
    
    warning: (message: string, options?: EnhancedToastOptions) =>
      showToast('warning', message, options),
    
    info: (message: string, options?: EnhancedToastOptions) =>
      showToast('info', message, options),
    
    loading: (message: string, options?: EnhancedToastOptions) =>
      showToast('loading', message, { ...options, duration: 0 }),

    // Métodos de conveniência para operações comuns
    saveSuccess: (entity: string = 'item') =>
      showToast('success', `${entity} salvo com sucesso!`),
    
    saveError: (entity: string = 'item') =>
      showToast('error', `Erro ao salvar ${entity}. Tente novamente.`),
    
    deleteSuccess: (entity: string = 'item') =>
      showToast('success', `${entity} excluído com sucesso!`),
    
    deleteError: (entity: string = 'item') =>
      showToast('error', `Erro ao excluir ${entity}. Tente novamente.`),
    
    updateSuccess: (entity: string = 'item') =>
      showToast('success', `${entity} atualizado com sucesso!`),
    
    updateError: (entity: string = 'item') =>
      showToast('error', `Erro ao atualizar ${entity}. Tente novamente.`),
    
    networkError: () =>
      showToast('error', 'Erro de conexão. Verifique sua internet.', {
        action: {
          label: 'Tentar novamente',
          onClick: () => window.location.reload()
        }
      }),
    
    validationError: (message?: string) =>
      showToast('warning', message || 'Verifique os campos marcados.'),
    
    uploadSuccess: (fileName: string) =>
      showToast('success', `Arquivo "${fileName}" enviado com sucesso!`),
    
    uploadError: (fileName?: string) =>
      showToast('error', `Erro ao enviar ${fileName ? `"${fileName}"` : 'arquivo'}.`),
    
    paymentSuccess: (amount: string) =>
      showToast('success', `Pagamento de ${amount} adicionado com sucesso!`),
    
    invoiceCreated: (series: string, number: string) =>
      showToast('success', `Nota fiscal ${series}/${number} criada com sucesso!`),
  }
}

// Hook para operações com loading automático
export function useAsyncOperation() {
  const toast = useEnhancedToast()

  const execute = async <T,>(
    operation: () => Promise<T>,
    options: {
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
    } = {}
  ): Promise<T | null> => {
    const {
      loadingMessage = 'Processando...',
      successMessage,
      errorMessage,
      onSuccess,
      onError
    } = options

    // Mostrar toast de loading
    const loadingToastId = toast.loading(loadingMessage)

    try {
      const result = await operation()
      
      // Fechar toast de loading e mostrar sucesso
      if (successMessage) {
        toast.success(successMessage)
      }
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (error) {
      // Fechar toast de loading e mostrar erro
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(errorMessage || errorMsg)
      
      if (onError && error instanceof Error) {
        onError(error)
      }
      
      return null
    }
  }

  return { execute }
}