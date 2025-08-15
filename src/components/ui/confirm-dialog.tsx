'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Trash2, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'warning' | 'info'
  loading?: boolean
}

const variantConfig = {
  destructive: {
    icon: Trash2,
    iconColor: 'text-destructive',
    confirmVariant: 'destructive' as const,
    confirmText: 'Excluir'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    confirmVariant: 'default' as const,
    confirmText: 'Confirmar'
  },
  info: {
    icon: Archive,
    iconColor: 'text-blue-600',
    confirmVariant: 'default' as const,
    confirmText: 'Continuar'
  }
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = 'Cancelar',
  variant = 'destructive',
  loading = false
}: ConfirmDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              variant === 'destructive' ? 'bg-destructive/10' :
              variant === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
            )}>
              <Icon className={cn("h-5 w-5", config.iconColor)} />
            </div>
            <div className="flex-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              config.confirmVariant === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processando...
              </div>
            ) : (
              confirmText || config.confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook para usar o dialog de confirmação de forma mais simples
import { useState } from 'react'

interface UseConfirmDialogProps {
  title: string
  description: string
  variant?: 'destructive' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
}

export function useConfirmDialog({
  title,
  description,
  variant = 'destructive',
  confirmText,
  cancelText
}: UseConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void | Promise<void>) | null>(null)

  const confirm = (callback: () => void | Promise<void>) => {
    setOnConfirmCallback(() => () => callback())
    setIsOpen(true)
  }

  const handleConfirm = async () => {
    if (onConfirmCallback) {
      setLoading(true)
      try {
        await onConfirmCallback()
      } catch (error) {
        console.error('Erro na confirmação:', error)
      } finally {
        setLoading(false)
        setIsOpen(false)
        setOnConfirmCallback(null)
      }
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setOnConfirmCallback(null)
    setLoading(false)
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={handleCancel}
      onConfirm={handleConfirm}
      title={title}
      description={description}
      variant={variant}
      confirmText={confirmText}
      cancelText={cancelText}
      loading={loading}
    />
  )

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
    isOpen,
    loading
  }
}