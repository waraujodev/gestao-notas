'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PaymentForm } from './PaymentForm'
import { useToast } from '@/hooks/useToast'
import type { InvoiceSummary } from '@/types/invoice'
import type { Payment, PaymentFormData } from '@/types/payment'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: InvoiceSummary
  payment?: Payment | null // Para edição
  mode?: 'create' | 'edit'
  onSuccess?: () => void // Callback para atualizar a lista
}

export function PaymentDialog({
  open,
  onOpenChange,
  invoice,
  payment,
  mode = 'create',
  onSuccess
}: PaymentDialogProps) {
  const toast = useToast()
  const isEditing = mode === 'edit' && !!payment

  const handleSubmit = async (formData: FormData) => {
    try {
      const url = isEditing 
        ? `/api/payments/${payment.id}`
        : `/api/payments`
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao processar pagamento')
      }

      const result = await response.json()
      
      toast.success(
        isEditing 
          ? 'Pagamento atualizado com sucesso!' 
          : 'Pagamento registrado com sucesso!'
      )
      
      onOpenChange(false)
      onSuccess?.()
      
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(message)
      throw error
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  // Preparar dados iniciais para edição
  const getInitialData = (): Partial<PaymentFormData> | undefined => {
    if (!isEditing || !payment) return undefined

    // Formatar valor para exibição como moeda
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(payment.amount_cents / 100)

    return {
      payment_method_id: payment.payment_method_id,
      amount: formattedAmount,
      payment_date: payment.payment_date.split('T')[0], // Converter ISO para YYYY-MM-DD
      notes: payment.notes || undefined
      // receipt_file será undefined para edição (arquivo atual mantido)
    }
  }

  // Verificar se a nota ainda tem valor restante
  const canAddPayment = invoice.remaining_amount_cents > 0 || isEditing

  if (!canAddPayment && !isEditing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento não permitido</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              Esta nota fiscal já foi paga integralmente.
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Fechar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Pagamento' : 'Registrar Pagamento'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <PaymentForm
            invoice={invoice}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={getInitialData()}
            isEditing={isEditing}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}