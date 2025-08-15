'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  FileText,
  Calendar
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'
import type { DashboardMetrics } from '@/hooks/useDashboard'

interface MetricsCardsProps {
  metrics: DashboardMetrics | null
  loading?: boolean
}

export function MetricsCards({ metrics, loading = false }: MetricsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-muted/60 rounded animate-pulse w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma métrica disponível</p>
      </div>
    )
  }

  const totalPendingAndOverdue = metrics.pending_amount_cents + metrics.overdue_amount_cents
  const paymentRate = metrics.total_amount_cents > 0 
    ? (metrics.paid_amount_cents / metrics.total_amount_cents) * 100
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total de Notas Fiscais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Notas</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total_invoices}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.paid_invoices} pagas • {metrics.pending_invoices} pendentes
          </p>
        </CardContent>
      </Card>

      {/* Valor Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.total_amount_cents)}
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">
              {paymentRate.toFixed(1)}% pago
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Valor Pago */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Pago</CardTitle>
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(metrics.paid_amount_cents)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" />
            {metrics.paid_invoices} nota{metrics.paid_invoices !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Valor Pendente + Atrasado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor em Aberto</CardTitle>
          <AlertTriangle className={cn(
            "h-4 w-4",
            metrics.overdue_amount_cents > 0 ? "text-destructive" : "text-amber-600"
          )} />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            metrics.overdue_amount_cents > 0 ? "text-destructive" : "text-amber-600"
          )}>
            {formatCurrency(totalPendingAndOverdue)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {metrics.overdue_amount_cents > 0 ? (
              <TrendingDown className="w-3 h-3 mr-1 text-destructive" />
            ) : (
              <Clock className="w-3 h-3 mr-1 text-amber-600" />
            )}
            {metrics.overdue_invoices > 0 && `${metrics.overdue_invoices} atrasada${metrics.overdue_invoices !== 1 ? 's' : ''}`}
            {metrics.overdue_invoices > 0 && metrics.pending_invoices > 0 && ' • '}
            {metrics.pending_invoices > 0 && `${metrics.pending_invoices} pendente${metrics.pending_invoices !== 1 ? 's' : ''}`}
          </div>
        </CardContent>
      </Card>

      {/* Valor Atrasado (se houver) */}
      {metrics.overdue_amount_cents > 0 && (
        <Card className="border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Valor Atrasado</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(metrics.overdue_amount_cents)}
            </div>
            <p className="text-xs text-destructive">
              {metrics.overdue_invoices} nota{metrics.overdue_invoices !== 1 ? 's' : ''} vencida{metrics.overdue_invoices !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tempo Médio para Pagamento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.average_days_to_payment || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            dias para pagamento
          </p>
        </CardContent>
      </Card>

      {/* Vencimentos Próximos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencimentos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Esta semana</span>
              <Badge variant={metrics.due_this_week > 0 ? "destructive" : "secondary"}>
                {metrics.due_this_week}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Próxima semana</span>
              <Badge variant={metrics.due_next_week > 0 ? "outline" : "secondary"}>
                {metrics.due_next_week}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taxa de Pagamento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Pagamento</CardTitle>
          <CheckCircle className={cn(
            "h-4 w-4",
            paymentRate >= 80 ? "text-emerald-600" :
            paymentRate >= 60 ? "text-amber-600" : "text-destructive"
          )} />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            paymentRate >= 80 ? "text-emerald-600" :
            paymentRate >= 60 ? "text-amber-600" : "text-destructive"
          )}>
            {paymentRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            das notas fiscais
          </p>
        </CardContent>
      </Card>
    </div>
  )
}