'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, AlertTriangle, Clock, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { cn } from '@/lib/utils'
import type { InvoiceSummary, PaymentStatus } from '@/types/invoice'

interface UpcomingInvoicesProps {
  invoices: InvoiceSummary[]
  loading?: boolean
  onViewInvoice?: (invoice: InvoiceSummary) => void
  onAddPayment?: (invoice: InvoiceSummary) => void
}

function getStatusVariant(status: PaymentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Pago':
      return 'default'
    case 'Pago Parcial':
      return 'secondary'
    case 'Pendente':
      return 'outline'
    case 'Atrasado':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getDaysUntilDue(dueDate: string): { days: number; label: string; variant: 'default' | 'warning' | 'danger' } {
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      label: `${Math.abs(diffDays)} dia${Math.abs(diffDays) !== 1 ? 's' : ''} atrasado`,
      variant: 'danger'
    }
  } else if (diffDays === 0) {
    return {
      days: 0,
      label: 'Vence hoje',
      variant: 'danger'
    }
  } else if (diffDays <= 7) {
    return {
      days: diffDays,
      label: `${diffDays} dia${diffDays !== 1 ? 's' : ''}`,
      variant: 'warning'
    }
  } else {
    return {
      days: diffDays,
      label: `${diffDays} dia${diffDays !== 1 ? 's' : ''}`,
      variant: 'default'
    }
  }
}

export function UpcomingInvoices({ 
  invoices, 
  loading = false, 
  onViewInvoice,
  onAddPayment 
}: UpcomingInvoicesProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas a Vencer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-24"></div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-16"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximas a Vencer
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhuma nota próxima ao vencimento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => {
              const dueInfo = getDaysUntilDue(invoice.due_date)
              
              return (
                <div
                  key={invoice.id}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg transition-colors hover:bg-muted/50",
                    dueInfo.variant === 'danger' && "border-red-200 bg-red-50",
                    dueInfo.variant === 'warning' && "border-orange-200 bg-orange-50"
                  )}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {invoice.supplier?.name || 'Fornecedor não encontrado'}
                      </span>
                      <Badge variant={getStatusVariant(invoice.payment_status)} className="text-xs">
                        {invoice.payment_status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Série {invoice.series} • Número {invoice.number}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Vencimento: {formatDate(invoice.due_date)}
                      </span>
                      <span>
                        Restante: {formatCurrency(invoice.remaining_amount_cents)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className={cn(
                        "font-medium text-sm",
                        dueInfo.variant === 'danger' && "text-red-600",
                        dueInfo.variant === 'warning' && "text-orange-600"
                      )}>
                        {dueInfo.variant === 'danger' && <AlertTriangle className="inline w-3 h-3 mr-1" />}
                        {dueInfo.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(invoice.total_amount_cents)}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      {onViewInvoice && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onViewInvoice(invoice)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {onAddPayment && invoice.remaining_amount_cents > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={() => onAddPayment(invoice)}
                        >
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}