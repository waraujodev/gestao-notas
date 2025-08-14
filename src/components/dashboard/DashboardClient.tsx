'use client'

import { useState } from 'react'
import { MetricsCards } from './MetricsCards'
import { UpcomingInvoices } from './UpcomingInvoices'
import { DashboardFilters } from './DashboardFilters'
import { PaymentDialog } from '@/components/payments/PaymentDialog'
import { useDashboard } from '@/hooks/useDashboard'
import type { DashboardFilters as DashboardFiltersType } from '@/hooks/useDashboard'
import type { InvoiceSummary } from '@/types/invoice'

export function DashboardClient() {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceSummary | null>(null)
  const [filters, setFilters] = useState<DashboardFiltersType>({ period: 'all' })

  const { metrics, upcomingInvoices, loading, refetch } = useDashboard({
    filters
  })

  const handleViewInvoice = (invoice: InvoiceSummary) => {
    // TODO: Navegar para a página da nota fiscal
    console.log('View invoice:', invoice.id)
  }

  const handleAddPayment = (invoice: InvoiceSummary) => {
    setSelectedInvoiceForPayment(invoice)
    setPaymentDialogOpen(true)
  }

  const handlePaymentSuccess = () => {
    refetch() // Atualizar métricas após pagamento
    setPaymentDialogOpen(false)
    setSelectedInvoiceForPayment(null)
  }

  const handleFiltersChange = (newFilters: DashboardFiltersType) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({ period: 'all' })
  }

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Visão Geral</h2>
          <p className="text-muted-foreground">
            Acompanhe suas métricas e atividades recentes
          </p>
        </div>
        <DashboardFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClear={handleClearFilters}
          loading={loading}
        />
      </div>

      {/* Métricas Principais */}
      <MetricsCards metrics={metrics} loading={loading} />

      {/* Próximas a Vencer */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingInvoices
            invoices={upcomingInvoices}
            loading={loading}
            onViewInvoice={handleViewInvoice}
            onAddPayment={handleAddPayment}
          />
        </div>

        {/* Sidebar com informações adicionais */}
        <div className="space-y-6">
          {/* Card de resumo rápido */}
          {metrics && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Resumo Rápido</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de Pagamento:</span>
                  <span className="font-medium">
                    {metrics.total_amount_cents > 0 
                      ? ((metrics.paid_amount_cents / metrics.total_amount_cents) * 100).toFixed(1)
                      : 0
                    }%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tempo Médio:</span>
                  <span className="font-medium">
                    {metrics.average_days_to_payment} dias
                  </span>
                </div>
                
                {metrics.overdue_invoices > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Em Atraso:</span>
                    <span className="font-medium">
                      {metrics.overdue_invoices} nota{metrics.overdue_invoices !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Esta Semana:</span>
                  <span className="font-medium">
                    {metrics.due_this_week} vencimento{metrics.due_this_week !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions rápidas */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/invoices'}
                className="w-full text-left p-2 text-sm rounded hover:bg-muted transition-colors"
              >
                📄 Ver Todas as Notas
              </button>
              <button
                onClick={() => window.location.href = '/suppliers'}
                className="w-full text-left p-2 text-sm rounded hover:bg-muted transition-colors"
              >
                🏢 Gerenciar Fornecedores
              </button>
              <button
                onClick={() => window.location.href = '/payment-methods'}
                className="w-full text-left p-2 text-sm rounded hover:bg-muted transition-colors"
              >
                💳 Formas de Pagamento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Pagamento */}
      {selectedInvoiceForPayment && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          invoice={selectedInvoiceForPayment}
          mode="create"
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}