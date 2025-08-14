'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from './useToast'
import type { InvoiceSummary } from '@/types/invoice'

export interface DashboardMetrics {
  total_invoices: number
  total_amount_cents: number
  paid_amount_cents: number
  pending_amount_cents: number
  overdue_amount_cents: number
  pending_invoices: number
  overdue_invoices: number
  paid_invoices: number
  partial_paid_invoices: number
  average_days_to_payment: number
  due_this_week: number
  due_next_week: number
}

export interface DashboardFilters {
  period?: 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom'
  start_date?: string
  end_date?: string
}

interface UseDashboardOptions {
  filters?: DashboardFilters
  auto_fetch?: boolean
}

export function useDashboard(options: UseDashboardOptions = {}) {
  const {
    filters = { period: 'all' },
    auto_fetch = true
  } = options

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [upcomingInvoices, setUpcomingInvoices] = useState<InvoiceSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toast = useToast()

  const fetchDashboardData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) {
            acc[key] = value.toString()
          }
          return acc
        }, {} as Record<string, string>)
      })

      const response = await fetch(`/api/dashboard?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard')
      }

      const data = await response.json()
      
      setMetrics(data.metrics)
      setUpcomingInvoices(data.upcoming_invoices || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      console.error('Dashboard error:', message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Auto fetch on mount and when dependencies change
  useEffect(() => {
    if (auto_fetch) {
      fetchDashboardData()
    }
  }, [fetchDashboardData, auto_fetch])

  // Mostrar toast de erro quando houver erro
  useEffect(() => {
    if (error) {
      toast.error('Erro ao carregar dashboard', {
        description: error
      })
    }
  }, [error, toast])

  return {
    metrics,
    upcomingInvoices,
    loading,
    error,
    refetch: fetchDashboardData
  }
}