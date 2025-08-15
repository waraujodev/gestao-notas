'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'
import type { DashboardMetrics } from '@/hooks/useDashboard'

interface InvoiceStatusChartProps {
  metrics: DashboardMetrics | null
  loading?: boolean
}

interface StatusData {
  label: string
  count: number
  amount_cents: number
  color: string
  bgColor: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function InvoiceStatusChart({ metrics, loading = false }: InvoiceStatusChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Status das Notas Fiscais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-32 bg-muted rounded animate-pulse"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-muted rounded-full"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                </div>
                <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Status das Notas Fiscais
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Nenhuma nota fiscal encontrada</p>
        </CardContent>
      </Card>
    )
  }

  const statusData: StatusData[] = [
    {
      label: 'Pagas',
      count: metrics.paid_invoices,
      amount_cents: metrics.paid_amount_cents,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-600',
      variant: 'default'
    },
    {
      label: 'Pendentes',
      count: metrics.pending_invoices,
      amount_cents: metrics.pending_amount_cents,
      color: 'text-amber-600',
      bgColor: 'bg-amber-600',
      variant: 'secondary'
    },
    {
      label: 'Atrasadas',
      count: metrics.overdue_invoices,
      amount_cents: metrics.overdue_amount_cents,
      color: 'text-destructive',
      bgColor: 'bg-destructive',
      variant: 'destructive'
    }
  ].filter(item => item.count > 0) // Só mostrar status que existem

  const total = statusData.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Status das Notas Fiscais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gráfico de barras simples */}
        <div className="space-y-3">
          {statusData.map((status, index) => {
            const percentage = total > 0 ? (status.count / total) * 100 : 0
            
            return (
              <div key={status.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-3 w-3 rounded-full", status.bgColor)}></div>
                    <span className="font-medium">{status.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={status.variant} className="text-xs">
                      {status.count}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-500", status.bgColor)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="text-xs text-muted-foreground text-right">
                  {formatCurrency(status.amount_cents)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Resumo total */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {total} notas
              </Badge>
              <span className="text-sm font-medium">
                {formatCurrency(metrics.total_amount_cents)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}