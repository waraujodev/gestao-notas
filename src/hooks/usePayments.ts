import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from './useToast'
import { createClient } from '@/lib/supabase/client'
import type { 
  Payment, 
  PaymentFilters, 
  PaymentsResponse,
  CreatePaymentData,
  UpdatePaymentData,
  InvoicePaymentSummary
} from '@/types/payment'

interface UsePaymentsOptions {
  page?: number
  per_page?: number
  filters?: PaymentFilters
  auto_fetch?: boolean
}

export function usePayments(options: UsePaymentsOptions = {}) {
  const {
    page = 1,
    per_page = 10,
    filters = {},
    auto_fetch = true
  } = options

  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    count: 0,
    page: 1,
    per_page: 10,
    total_pages: 0
  })

  const toast = useToast()
  const lastFiltersRef = useRef<string>('')
  const isInitialMount = useRef(true)

  const fetchPayments = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value && value !== 'all') {
            acc[key] = value.toString()
          }
          return acc
        }, {} as Record<string, string>)
      })

      const response = await fetch(`/api/payments?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar pagamentos')
      }

      const data: PaymentsResponse = await response.json()
      
      setPayments(data.data)
      setPagination({
        count: data.count,
        page: data.page,
        per_page: data.per_page,
        total_pages: data.total_pages
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      console.error('Payments fetch error:', message)
    } finally {
      setLoading(false)
    }
  }, [page, per_page, filters])

  const createPayment = async (data: CreatePaymentData) => {
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('invoice_id', data.invoice_id)
      formData.append('payment_method_id', data.payment_method_id)
      formData.append('amount_cents', data.amount_cents.toString())
      formData.append('payment_date', data.payment_date)
      formData.append('receipt_file', data.receipt_file)
      if (data.notes) formData.append('notes', data.notes)

      const response = await fetch('/api/payments', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao registrar pagamento')
      }

      await fetchPayments()
      toast.success('Pagamento registrado com sucesso!')

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updatePayment = async (data: UpdatePaymentData) => {
    setLoading(true)
    
    try {
      const formData = new FormData()
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          if (key === 'receipt_file' && value instanceof File) {
            formData.append(key, value)
          } else if (key !== 'receipt_file') {
            formData.append(key, value.toString())
          }
        }
      })

      const response = await fetch(`/api/payments/${data.id}`, {
        method: 'PUT',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao atualizar pagamento')
      }

      await fetchPayments()
      toast.success('Pagamento atualizado com sucesso!')

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deletePayment = async (id: string) => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao excluir pagamento')
      }

      await fetchPayments()
      toast.success('Pagamento excluído com sucesso!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getPaymentById = async (id: string): Promise<Payment | null> => {
    try {
      const response = await fetch(`/api/payments/${id}`)
      
      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch {
      return null
    }
  }

  // Auto fetch on mount and when dependencies change (usando ref para evitar loops)
  useEffect(() => {
    if (!auto_fetch) return

    const currentFiltersString = JSON.stringify({ page, per_page, filters })
    
    // Só fazer fetch se:
    // 1. É o primeiro mount OU
    // 2. Os filtros realmente mudaram
    if (isInitialMount.current || currentFiltersString !== lastFiltersRef.current) {
      lastFiltersRef.current = currentFiltersString
      isInitialMount.current = false
      fetchPayments()
    }
  }, [auto_fetch, page, per_page, filters, fetchPayments])

  // Mostrar toast de erro quando houver erro
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error, toast])

  return {
    payments,
    loading,
    error,
    pagination,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentById,
    refetch: fetchPayments
  }
}

// Hook específico para pagamentos de uma nota fiscal
export function useInvoicePayments(invoiceId: string) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<InvoicePaymentSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toast = useToast()

  const fetchInvoicePayments = useCallback(async () => {
    if (!invoiceId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/payments?invoice_id=${invoiceId}&per_page=100`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar pagamentos da nota')
      }

      const data: PaymentsResponse = await response.json()
      setPayments(data.data)

      // Calcular resumo
      if (data.data.length > 0) {
        const firstPayment = data.data[0]
        const totalPaid = data.data.reduce((sum, p) => sum + p.amount_cents, 0)
        const invoiceTotal = firstPayment.invoice?.total_amount_cents || 0
        
        setSummary({
          invoice_id: invoiceId,
          total_amount_cents: invoiceTotal,
          paid_amount_cents: totalPaid,
          remaining_amount_cents: invoiceTotal - totalPaid,
          payments_count: data.data.length,
          last_payment_date: data.data[0].payment_date,
          payments: data.data
        })
      } else {
        setSummary(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      console.error('Invoice payments fetch error:', message)
    } finally {
      setLoading(false)
    }
  }, [invoiceId])

  const createPayment = async (data: Omit<CreatePaymentData, 'invoice_id'>) => {
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('invoice_id', invoiceId)
      formData.append('payment_method_id', data.payment_method_id)
      formData.append('amount_cents', data.amount_cents.toString())
      formData.append('payment_date', data.payment_date)
      formData.append('receipt_file', data.receipt_file)
      if (data.notes) formData.append('notes', data.notes)

      const response = await fetch('/api/payments', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao registrar pagamento')
      }

      await fetchInvoicePayments()
      toast.success('Pagamento registrado com sucesso!')

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoicePayments()
  }, [fetchInvoicePayments])

  // Mostrar toast de erro quando houver erro
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error, toast])

  return {
    payments,
    summary,
    loading,
    error,
    createPayment,
    refetch: fetchInvoicePayments
  }
}