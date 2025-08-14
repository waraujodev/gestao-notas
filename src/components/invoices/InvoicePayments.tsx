'use client'

import { useState } from 'react'
import { Plus, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PaymentsTable } from '@/components/payments/PaymentsTable'
import { PaymentDialog } from '@/components/payments/PaymentDialog'
import { useInvoicePayments } from '@/hooks/usePayments'
import { formatCurrency } from '@/lib/utils/currency'
import type { InvoiceSummary } from '@/types/invoice'

interface InvoicePaymentsProps {
  invoice: InvoiceSummary
  onClose?: () => void
}

export function InvoicePayments({ invoice, onClose }: InvoicePaymentsProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  
  const {
    payments,
    summary,
    loading,
    createPayment,
    refetch
  } = useInvoicePayments(invoice.id)

  const handlePaymentSuccess = () => {
    refetch()
    setPaymentDialogOpen(false)
  }

  const handleDownloadReceipt = async (payment: any) => {
    // TODO: Implementar download do comprovante
    console.log('Download receipt:', payment)
  }

  const handleEdit = (payment: any) => {
    // TODO: Implementar edição de pagamento
    console.log('Edit payment:', payment)
  }

  const handleDelete = async (paymentId: string) => {
    // TODO: Implementar exclusão de pagamento
    console.log('Delete payment:', paymentId)
  }

  const progressPercentage = invoice.total_amount_cents > 0 
    ? Math.round((invoice.paid_amount_cents / invoice.total_amount_cents) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pagamentos da Nota Fiscal</h2>
          <p className="text-sm text-muted-foreground">
            {invoice.supplier?.name} • Série {invoice.series} • Número {invoice.number}
          </p>
        </div>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Voltar
            </Button>
          )}
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total da Nota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoice.total_amount_cents)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(invoice.paid_amount_cents)}
            </div>
            <p className="text-sm text-muted-foreground">
              {payments.length} pagamento{payments.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Restante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(invoice.remaining_amount_cents)}
            </div>
            <Badge variant={
              invoice.payment_status === 'Pago' ? 'default' :
              invoice.payment_status === 'Atrasado' ? 'destructive' :
              invoice.payment_status === 'Pago Parcial' ? 'secondary' : 'outline'
            }>
              {invoice.payment_status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progresso do Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span className="font-medium">{progressPercentage}% pago</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Button */}
      {invoice.remaining_amount_cents > 0 && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Histórico de Pagamentos</h3>
          <Button onClick={() => setPaymentDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Pagamento
          </Button>
        </div>
      )}

      {/* Payments Table */}
      <PaymentsTable
        payments={payments}
        loading={loading}
        showInvoiceInfo={false}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDownloadReceipt={handleDownloadReceipt}
      />

      {/* Add Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        invoice={invoice}
        mode="create"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}