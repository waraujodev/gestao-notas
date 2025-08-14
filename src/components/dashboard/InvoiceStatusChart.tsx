'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'
import type { DashboardMetrics } from '@/hooks/useDashboard'
import { formatCurrency } from '@/lib/utils/currency'

interface InvoiceStatusChartProps {
  metrics: DashboardMetrics | null
  loading?: boolean
}

const STATUS_COLORS = {
  Pago: '#22c55e',       // Verde
  'Pago Parcial': '#f59e0b', // Amarelo
  Pendente: '#6b7280',   // Cinza
  Atrasado: '#ef4444'    // Vermelho
}

export function InvoiceStatusChart({ metrics, loading = false }: InvoiceStatusChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Status das Notas Fiscais
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="w-48 h-48 bg-gray-200 rounded-full animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Status das Notas Fiscais
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    )
  }

  // Preparar dados para o gráfico
  const chartData = [
    {
      name: 'Pagas',
      value: metrics.paid_invoices,
      amount: metrics.paid_amount_cents,
      color: STATUS_COLORS.Pago
    },
    {
      name: 'Parciais',
      value: metrics.partial_paid_invoices,
      amount: (metrics.total_amount_cents - metrics.paid_amount_cents - (metrics.pending_invoices + metrics.overdue_invoices) * (metrics.total_amount_cents / metrics.total_invoices)),
      color: STATUS_COLORS['Pago Parcial']
    },
    {
      name: 'Pendentes',
      value: metrics.pending_invoices,
      amount: metrics.pending_invoices * (metrics.total_amount_cents / metrics.total_invoices),
      color: STATUS_COLORS.Pendente
    },
    {
      name: 'Atrasadas',
      value: metrics.overdue_invoices,
      amount: metrics.overdue_invoices * (metrics.total_amount_cents / metrics.total_invoices),
      color: STATUS_COLORS.Atrasado
    }
  ].filter(item => item.value > 0) // Remover status com 0 notas

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} nota{data.value !== 1 ? 's' : ''}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.amount)}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.value}: {chartData[index]?.value || 0}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Status das Notas Fiscais
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Nenhuma nota fiscal encontrada</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Resumo textual */}
        {metrics.total_invoices > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total de Notas:</span>
                <span className="ml-2 font-medium">{metrics.total_invoices}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Valor Total:</span>
                <span className="ml-2 font-medium">{formatCurrency(metrics.total_amount_cents)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">% Pagas:</span>
                <span className="ml-2 font-medium text-green-600">
                  {((metrics.paid_invoices / metrics.total_invoices) * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">% Atrasadas:</span>
                <span className="ml-2 font-medium text-red-600">
                  {((metrics.overdue_invoices / metrics.total_invoices) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}