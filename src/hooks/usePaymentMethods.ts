'use client'

import { useState, useEffect } from 'react'
import { PaymentMethod, PaymentMethodsResponse, PaymentMethodFilters, CreatePaymentMethodData, UpdatePaymentMethodData } from '@/types/payment-method'
import { useToast } from './useToast'

interface UsePaymentMethodsOptions extends PaymentMethodFilters {
  auto_fetch?: boolean
}

export function usePaymentMethods(options: UsePaymentMethodsOptions = {}) {
  const { auto_fetch = true, ...filters } = options
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const toast = useToast()

  const fetchPaymentMethods = async (currentFilters: PaymentMethodFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      if (currentFilters.search) params.append('search', currentFilters.search)
      if (currentFilters.status !== undefined && currentFilters.status !== null) {
        params.append('status', currentFilters.status.toString())
      }
      if (currentFilters.type) params.append('type', currentFilters.type)
      if (currentFilters.page) params.append('page', currentFilters.page.toString())
      if (currentFilters.limit) params.append('limit', currentFilters.limit.toString())

      const response = await fetch(`/api/payment-methods?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar formas de pagamento')
      }

      const data: PaymentMethodsResponse = await response.json()
      setPaymentMethods(data.paymentMethods)
      setPagination(data.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast.error('Erro ao carregar formas de pagamento', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const createPaymentMethod = async (data: CreatePaymentMethodData): Promise<boolean> => {
    try {
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar forma de pagamento')
      }

      toast.success('Forma de pagamento criada com sucesso!')
      
      // Atualizar lista
      await fetchPaymentMethods(filters)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao criar forma de pagamento', {
        description: errorMessage
      })
      return false
    }
  }

  const updatePaymentMethod = async (id: string, data: UpdatePaymentMethodData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar forma de pagamento')
      }

      toast.success('Forma de pagamento atualizada com sucesso!')
      
      // Atualizar lista
      await fetchPaymentMethods(filters)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao atualizar forma de pagamento', {
        description: errorMessage
      })
      return false
    }
  }

  const deletePaymentMethod = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir forma de pagamento')
      }

      toast.success('Forma de pagamento desativada com sucesso!')
      
      // Atualizar lista
      await fetchPaymentMethods(filters)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao excluir forma de pagamento', {
        description: errorMessage
      })
      return false
    }
  }

  const getPaymentMethod = async (id: string): Promise<PaymentMethod | null> => {
    try {
      const response = await fetch(`/api/payment-methods/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar forma de pagamento')
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao carregar forma de pagamento', {
        description: errorMessage
      })
      return null
    }
  }

  // Carregar formas de pagamento quando filters mudam
  useEffect(() => {
    if (auto_fetch) {
      fetchPaymentMethods(filters)
    }
  }, [JSON.stringify(filters), auto_fetch])

  return {
    paymentMethods,
    loading,
    error,
    pagination,
    fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getPaymentMethod,
    refetch: () => fetchPaymentMethods(filters),
  }
}