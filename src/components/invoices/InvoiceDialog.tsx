'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InvoiceForm } from './InvoiceForm'
import { useInvoices } from '@/hooks/useInvoices'
import { useToast } from '@/hooks/useToast'
import type { InvoiceFormData, InvoiceSummary } from '@/types/invoice'

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: InvoiceSummary | null // Para edição
  mode?: 'create' | 'edit'
}

export function InvoiceDialog({
  open,
  onOpenChange,
  invoice,
  mode = 'create'
}: InvoiceDialogProps) {
  const { createInvoice, updateInvoice, loading } = useInvoices({ auto_fetch: false })
  const toast = useToast()

  const isEditing = mode === 'edit' && !!invoice

  const handleSubmit = async (formData: FormData) => {
    try {
      if (isEditing) {
        // Edição - adicionar ID do invoice
        formData.append('id', invoice.id)
        await updateInvoice({
          id: invoice.id,
          supplier_id: formData.get('supplier_id') as string,
          series: formData.get('series') as string,
          number: formData.get('number') as string,
          due_date: formData.get('due_date') as string,
          total_amount_cents: parseInt(formData.get('total_amount_cents') as string),
          pdf_file: formData.get('pdf_file') as File | undefined
        })
      } else {
        // Criação
        await createInvoice({
          supplier_id: formData.get('supplier_id') as string,
          series: formData.get('series') as string,
          number: formData.get('number') as string,
          due_date: formData.get('due_date') as string,
          total_amount_cents: parseInt(formData.get('total_amount_cents') as string),
          pdf_file: formData.get('pdf_file') as File
        })
      }
      
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the hook
      console.error('Submit error:', error)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  // Preparar dados iniciais para edição
  const getInitialData = (): Partial<InvoiceFormData> | undefined => {
    if (!isEditing || !invoice) return undefined

    // Formatar valor para exibição como moeda
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(invoice.total_amount_cents / 100)

    return {
      supplier_id: invoice.supplier_id,
      series: invoice.series,
      number: invoice.number,
      due_date: invoice.due_date.split('T')[0], // Converter ISO para YYYY-MM-DD
      total_amount: formattedAmount, // Formato de moeda para o input
      notes: undefined // Notes não está sendo retornado da API ainda
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <InvoiceForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={getInitialData()}
            isEditing={isEditing}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}