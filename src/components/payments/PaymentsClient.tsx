'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
    setPage(1) // Reset to first page when filters change
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
    // TODO: Implementar modal de seleção de nota fiscal antes de criar pagamento
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pagamentos</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os pagamentos registrados
          </p>
        </div>
        <Button onClick={handleNewPayment}>
          Novo Pagamento
        </Button>
      </div>

      {/* Filters */}
      <PaymentsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
        loading={loading}
      />

      {/* Summary Cards */}
      {!loading && payments.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">
                Total de Pagamentos
              </h3>
            </div>
            <div className="text-2xl font-bold">{pagination.count}</div>
            <p className="text-xs text-muted-foreground">
              Pagamentos encontrados
            </p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">
                Valor Total
              </h3>
            </div>
            <div className="text-2xl font-bold text-green-600">
              R$ {(payments.reduce((sum, p) => sum + p.amount_cents, 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Soma dos pagamentos exibidos
            </p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">
                Valor Médio
              </h3>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              R$ {payments.length > 0 ? (payments.reduce((sum, p) => sum + p.amount_cents, 0) / payments.length / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor médio por pagamento
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <PaymentsTable
        payments={payments}
        loading={loading}
        showInvoiceInfo={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onDownloadReceipt={handleDownloadReceipt}
      />

      {/* Pagination */}
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

      {/* TODO: Dialog for Create/Edit Payment */}
      {/* Implementar quando houver seleção de nota fiscal */}
    </div>
  )
}