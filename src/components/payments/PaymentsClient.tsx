'use client'

import { useState } from 'react'
import { Plus, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PaymentsTable } from './PaymentsTable'
import { PaymentsFilters } from './PaymentsFilters'
import { usePayments } from '@/hooks/usePayments'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import type { PaymentFilters, Payment } from '@/types/payment'

export function PaymentsClient() {
  const [filters, setFilters] = useState<PaymentFilters>({})
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')

  const toast = useToast()

  const { 
    payments, 
    loading, 
    pagination,
    deletePayment,
    refetch
  } = usePayments({
    page,
    per_page: perPage,
    filters
  })

  const handleFiltersChange = (newFilters: PaymentFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
  }

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleView = (payment: Payment) => {
    // TODO: Implement view functionality
    console.log('View payment:', payment)
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePayment(id)
    } catch (error) {
      // Error handling is done in the hook
      console.error('Delete error:', error)
    }
  }

  const handleDownloadReceipt = async (payment: Payment) => {
    if (!payment.receipt_url) {
      toast.error('Comprovante não encontrado')
      return
    }

    try {
      const supabase = createClient()
      const { data } = await supabase.storage
        .from('receipts')
        .createSignedUrl(payment.receipt_url, 60 * 60) // 1 hour

      if (data?.signedUrl) {
        // Create a temporary link and click it to download
        const link = document.createElement('a')
        link.href = data.signedUrl
        link.download = `comprovante-${payment.id}.${payment.receipt_type}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        toast.error('Erro ao gerar link de download')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Erro ao baixar comprovante')
    }
  }

  const handleNewPayment = () => {
    toast.error('Funcionalidade em desenvolvimento', {
      description: 'Para adicionar um pagamento, vá até a página de notas fiscais e selecione uma nota.'
    })
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingPayment(null)
  }

  const handlePaymentSuccess = () => {
    // Refresh list after successful payment operation
    refetch()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pagamentos</CardTitle>
            <CardDescription>
              Histórico de pagamentos realizados para notas fiscais
            </CardDescription>
          </div>
          <Button onClick={handleNewPayment}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Pagamento
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <PaymentsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
            loading={loading}
          />

          {/* Tabela */}
          <PaymentsTable
            payments={payments}
            loading={loading}
            showInvoiceInfo={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onDownloadReceipt={handleDownloadReceipt}
          />

          {/* Paginação */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * perPage) + 1} a {Math.min(page * perPage, pagination.count)} de {pagination.count} resultados
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1 text-sm">
                  <span>Página</span>
                  <span className="font-medium">{page}</span>
                  <span>de</span>
                  <span className="font-medium">{pagination.total_pages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                  disabled={page === pagination.total_pages || loading}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}