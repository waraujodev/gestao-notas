'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'
import type { DashboardMetrics } from '@/hooks/useDashboard'

interface PerformanceIndicatorsProps {
  metrics: DashboardMetrics | null
  loading?: boolean
}

interface IndicatorData {
  label: string
  value: string | number
  status: 'good' | 'warning' | 'critical'
  icon: React.ReactNode
  description: string
  trend?: 'up' | 'down' | 'stable'
}

export function PerformanceIndicators({ metrics, loading = false }: PerformanceIndicatorsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Indicadores de Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                  <div className="h-3 bg-muted/60 rounded animate-pulse w-16"></div>
                </div>
              </div>
              <div className="h-6 bg-muted rounded animate-pulse w-12"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Indicadores de Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Dados insuficientes para calcular indicadores</p>
        </CardContent>
      </Card>
    )
  }

  // Cálculos dos indicadores
  const paymentRate = metrics.total_amount_cents > 0 
    ? (metrics.paid_amount_cents / metrics.total_amount_cents) * 100 
    : 0

  const overdueRate = metrics.total_invoices > 0
    ? (metrics.overdue_invoices / metrics.total_invoices) * 100
    : 0

  const averageInvoiceValue = metrics.total_invoices > 0
    ? metrics.total_amount_cents / metrics.total_invoices
    : 0

  const pendingValue = metrics.pending_amount_cents + metrics.overdue_amount_cents

  const indicators: IndicatorData[] = [
    {
      label: 'Taxa de Pagamento',
      value: `${paymentRate.toFixed(1)}%`,
      status: paymentRate >= 80 ? 'good' : paymentRate >= 60 ? 'warning' : 'critical',
      icon: <CheckCircle2 className="h-4 w-4" />,
      description: 'Percentual de valor pago',
      trend: paymentRate >= 80 ? 'up' : paymentRate >= 60 ? 'stable' : 'down'
    },
    {
      label: 'Taxa de Inadimplência',
      value: `${overdueRate.toFixed(1)}%`,
      status: overdueRate <= 5 ? 'good' : overdueRate <= 15 ? 'warning' : 'critical',
      icon: <AlertCircle className="h-4 w-4" />,
      description: 'Percentual de notas atrasadas',
      trend: overdueRate <= 5 ? 'up' : overdueRate <= 15 ? 'stable' : 'down'
    },
    {
      label: 'Ticket Médio',
      value: formatCurrency(averageInvoiceValue),
      status: averageInvoiceValue >= 100000 ? 'good' : averageInvoiceValue >= 50000 ? 'warning' : 'critical', // R$ 1000 = 100000 centavos
      icon: <DollarSign className="h-4 w-4" />,
      description: 'Valor médio por nota fiscal',
      trend: 'stable'
    },
    {
      label: 'Prazo Médio',
      value: `${metrics.average_days_to_payment || 0} dias`,
      status: (metrics.average_days_to_payment || 0) <= 30 ? 'good' : 
             (metrics.average_days_to_payment || 0) <= 45 ? 'warning' : 'critical',
      icon: <Clock className="h-4 w-4" />,
      description: 'Tempo médio para pagamento',
      trend: (metrics.average_days_to_payment || 0) <= 30 ? 'up' : 'down'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'critical': return 'text-destructive bg-destructive/5 border-destructive/20'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return 'default'
      case 'warning': return 'secondary'
      case 'critical': return 'destructive'
      default: return 'outline'
    }
  }

  const getTrendIcon = (trend: string | undefined, status: string) => {
    if (!trend) return null
    
    const iconClass = cn(
      "h-3 w-3",
      status === 'good' ? 'text-emerald-600' :
      status === 'warning' ? 'text-amber-600' : 'text-destructive'
    )

    switch (trend) {
      case 'up': return <TrendingUp className={iconClass} />
      case 'down': return <TrendingDown className={iconClass} />
      default: return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Indicadores de Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {indicators.map((indicator, index) => (
          <div
            key={indicator.label}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-colors",
              getStatusColor(indicator.status)
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                indicator.status === 'good' ? 'bg-emerald-100' :
                indicator.status === 'warning' ? 'bg-amber-100' : 'bg-destructive/10'
              )}>
                {indicator.icon}
              </div>
              <div className="space-y-1">
                <div className="font-medium text-sm">{indicator.label}</div>
                <div className="text-xs opacity-75">{indicator.description}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="font-bold text-sm">{indicator.value}</div>
                {indicator.trend && (
                  <div className="flex items-center justify-end gap-1">
                    {getTrendIcon(indicator.trend, indicator.status)}
                  </div>
                )}
              </div>
              <Badge variant={getStatusBadge(indicator.status) as any} className="text-xs">
                {indicator.status === 'good' ? 'Bom' :
                 indicator.status === 'warning' ? 'Atenção' : 'Crítico'}
              </Badge>
            </div>
          </div>
        ))}

        {/* Resumo geral */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Saúde Financeira</span>
            <Badge 
              variant={
                paymentRate >= 80 && overdueRate <= 5 ? 'default' :
                paymentRate >= 60 && overdueRate <= 15 ? 'secondary' : 'destructive'
              }
              className="text-xs"
            >
              {paymentRate >= 80 && overdueRate <= 5 ? 'Excelente' :
               paymentRate >= 60 && overdueRate <= 15 ? 'Boa' : 'Precisa Atenção'}
            </Badge>
          </div>
          {pendingValue > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(pendingValue)} em aberto
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}