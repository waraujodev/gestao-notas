'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { InvoicesTable } from '@/components/invoices/InvoicesTable'
import { InvoicesFilters } from '@/components/invoices/InvoicesFilters'
import { useInvoices } from '@/hooks/useInvoices'
import type { InvoiceFilters, InvoiceSummary } from '@/types/invoice'

export default function InvoicesPage() {
  const [filters, setFilters] = useState<InvoiceFilters>({})
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)

  const { 
    invoices, 
    loading, 
    pagination,
    deleteInvoice,
    refetch 
  } = useInvoices({
    page,
    per_page: perPage,
    filters
  })

  const handleFiltersChange = (newFilters: InvoiceFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
  }

  const handleEdit = (invoice: InvoiceSummary) => {
    // TODO: Implement edit functionality in next phase
    console.log('Edit invoice:', invoice)
  }

  const handleView = (invoice: InvoiceSummary) => {
    // TODO: Implement view functionality in next phase
    console.log('View invoice:', invoice)
  }

  const handleAddPayment = (invoice: InvoiceSummary) => {
    // TODO: Implement add payment functionality in next phase
    console.log('Add payment to invoice:', invoice)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteInvoice(id)
    } catch (error) {
      // Error handling is done in the hook
      console.error('Delete error:', error)
    }
  }

  const handleNewInvoice = () => {
    // TODO: Implement new invoice functionality in next phase
    console.log('New invoice')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Notas Fiscais</h2>
            <p className="text-muted-foreground">
              Gerencie suas notas fiscais e acompanhe pagamentos
            </p>
          </div>
          <Button onClick={handleNewInvoice}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Nota Fiscal
          </Button>
        </div>

        {/* Filters */}
        <InvoicesFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClear={handleClearFilters}
          loading={loading}
        />

        {/* Table */}
        <InvoicesTable
          invoices={invoices}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onAddPayment={handleAddPayment}
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
      </div>
    </DashboardLayout>
  )
}