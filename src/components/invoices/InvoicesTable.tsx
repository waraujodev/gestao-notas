'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreHorizontal, FileText, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/useDebounce'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { ResponsiveTable } from '@/components/ui/responsive-table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useInvoices } from '@/hooks/useInvoices'
import { InvoiceFilters, InvoiceSummary, PaymentStatus } from '@/types/invoice'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, isOverdue } from '@/lib/utils/date'
import { InvoicesFilters } from './InvoicesFilters'
import { InvoiceDialog } from './InvoiceDialog'
import { InvoicePayments } from './InvoicePayments'
import { PaymentDialog } from '@/components/payments/PaymentDialog'

function getStatusVariant(status: PaymentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Pago':
      return 'default' // Verde
    case 'Pago Parcial':
      return 'secondary' // Azul
    case 'Pendente':
      return 'outline' // Cinza
    case 'Atrasado':
      return 'destructive' // Vermelho
    default:
      return 'outline'
  }
}

export const InvoicesTable = React.memo(function InvoicesTable() {
  const [filters, setFilters] = useState<InvoiceFilters>({})
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<InvoiceSummary | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  // Dialog de confirmação para exclusão
  const { confirm: confirmDelete, ConfirmDialog } = useConfirmDialog({
    title: 'Excluir Nota Fiscal',
    description: 'Tem certeza que deseja excluir esta nota fiscal? Esta ação não pode ser desfeita e removerá também todos os pagamentos relacionados.',
    variant: 'destructive'
  })
  
  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceSummary | null>(null)
  
  // Payments view state
  const [viewingPayments, setViewingPayments] = useState(false)
  const [selectedInvoiceForPayments, setSelectedInvoiceForPayments] = useState<InvoiceSummary | null>(null)

  // Debounce do termo de busca para evitar muitas requisições
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Memoizar filtros para evitar recriações desnecessárias
  const memoizedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearchTerm || undefined,
  }), [filters, debouncedSearchTerm])

  const { 
    invoices, 
    loading, 
    pagination,
    deleteInvoice,
    refetch
  } = useInvoices({
    page,
    per_page: perPage,
    filters: memoizedFilters
  })

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const handleFiltersChange = useCallback((newFilters: InvoiceFilters) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({})
    setSearchTerm('')
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleEdit = useCallback((invoice: InvoiceSummary) => {
    setEditingInvoice(invoice)
    setDialogMode('edit')
    setDialogOpen(true)
  }, [])

  const handleView = useCallback((invoice: InvoiceSummary) => {
    // TODO: Implement view functionality in next phase
    console.log('View invoice:', invoice)
  }, [])

  const handleAddPayment = useCallback((invoice: InvoiceSummary) => {
    setSelectedInvoiceForPayment(invoice)
    setPaymentDialogOpen(true)
  }, [])

  const handleViewPayments = useCallback((invoice: InvoiceSummary) => {
    setSelectedInvoiceForPayments(invoice)
    setViewingPayments(true)
  }, [])

  const handleDelete = useCallback(async (invoiceId: string) => {
    confirmDelete(async () => {
      await deleteInvoice(invoiceId)
    })
  }, [confirmDelete, deleteInvoice])

  const handleNewInvoice = useCallback(() => {
    setEditingInvoice(null)
    setDialogMode('create')
    setDialogOpen(true)
  }, [])

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false)
    setEditingInvoice(null)
    refetch()
  }, [refetch])

  const handlePaymentDialogClose = useCallback(() => {
    setPaymentDialogOpen(false)
    setSelectedInvoiceForPayment(null)
  }, [])

  const handlePaymentSuccess = useCallback(() => {
    refetch()
  }, [refetch])

  const handleClosePaymentsView = useCallback(() => {
    setViewingPayments(false)
    setSelectedInvoiceForPayments(null)
    refetch()
  }, [refetch])

  // Se estiver visualizando pagamentos, mostrar apenas essa tela
  if (viewingPayments && selectedInvoiceForPayments) {
    return (
      <InvoicePayments 
        invoice={selectedInvoiceForPayments} 
        onClose={handleClosePaymentsView}
      />
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notas Fiscais</CardTitle>
              <CardDescription>
                Gerencie suas notas fiscais e acompanhe pagamentos
              </CardDescription>
            </div>
            <Button onClick={handleNewInvoice}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Nota Fiscal
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por série, número ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <InvoicesFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClear={handleClearFilters}
                loading={loading}
              />
            </div>

            {/* Tabela Responsiva */}
            <ResponsiveTable
              columns={[
                {
                  key: 'invoice_info',
                  label: 'Nota Fiscal',
                  isPrimary: true,
                  render: (_, invoice) => (
                    <div className="space-y-1">
                      <div className="font-medium">
                        {invoice.series}/{invoice.number}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Criada em {formatDate(invoice.created_at)}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'supplier_info',
                  label: 'Fornecedor',
                  showOnMobile: true,
                  render: (_, invoice) => (
                    <div className="space-y-1">
                      <div className="font-medium">
                        {invoice.supplier?.name || 'Fornecedor não encontrado'}
                      </div>
                      {invoice.supplier?.document && (
                        <div className="text-sm text-muted-foreground">
                          {invoice.supplier.document}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'due_date',
                  label: 'Vencimento',
                  showOnMobile: true,
                  render: (_, invoice) => {
                    const overdue = isOverdue(invoice.due_date)
                    return (
                      <div className={`space-y-1 ${overdue ? 'text-red-600' : ''}`}>
                        <div className={overdue ? 'font-medium' : ''}>
                          {formatDate(invoice.due_date)}
                        </div>
                        {overdue && (
                          <div className="text-xs text-red-500">
                            Em atraso
                          </div>
                        )}
                      </div>
                    )
                  },
                },
                {
                  key: 'total_amount_cents',
                  label: 'Valor Total',
                  showOnMobile: false,
                  className: 'text-right',
                  render: (value) => (
                    <span className="font-medium">{formatCurrency(value)}</span>
                  ),
                },
                {
                  key: 'paid_amount_cents',
                  label: 'Valor Pago',
                  showOnMobile: false,
                  className: 'text-right',
                  render: (value) => formatCurrency(value || 0),
                },
                {
                  key: 'remaining_amount',
                  label: 'Valor Restante',
                  showOnMobile: false,
                  className: 'text-right',
                  render: (_, invoice) => 
                    formatCurrency((invoice.total_amount_cents || 0) - (invoice.paid_amount_cents || 0)),
                },
                {
                  key: 'payment_status',
                  label: 'Status',
                  showOnMobile: true,
                  render: (value) => (
                    <Badge variant={getStatusVariant(value || 'Pendente')}>
                      {value || 'Pendente'}
                    </Badge>
                  ),
                },
              ]}
              data={invoices}
              loading={loading}
              emptyMessage={
                filters.search
                  ? 'Nenhuma nota fiscal encontrada com os filtros aplicados.'
                  : 'Nenhuma nota fiscal cadastrada ainda.'
              }
              actions={[
                {
                  label: 'Visualizar',
                  icon: Eye,
                  onClick: (invoice) => handleView(invoice),
                },
                {
                  label: 'Editar',
                  icon: Edit,
                  onClick: (invoice) => handleEdit(invoice),
                },
                {
                  label: 'Adicionar Pagamento',
                  icon: Plus,
                  onClick: (invoice) => handleAddPayment(invoice),
                },
                {
                  label: 'Ver Pagamentos',
                  icon: Receipt,
                  onClick: (invoice) => handleViewPayments(invoice),
                },
                {
                  label: 'Excluir',
                  icon: Trash2,
                  onClick: (invoice) => handleDelete(invoice.id),
                  variant: 'destructive',
                },
              ]}
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
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
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
                    onClick={() => handlePageChange(Math.min(pagination.total_pages, page + 1))}
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

      {/* Dialog for Create/Edit Invoice */}
      <InvoiceDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        invoice={editingInvoice}
        mode={dialogMode}
      />

      {/* Dialog for Add Payment */}
      {selectedInvoiceForPayment && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={handlePaymentDialogClose}
          invoice={selectedInvoiceForPayment}
          mode="create"
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Dialog de confirmação */}
      <ConfirmDialog />
    </>
  )
})