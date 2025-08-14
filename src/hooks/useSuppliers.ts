'use client'

import { useState, useEffect } from 'react'
import { Supplier, SuppliersResponse, SupplierFilters, CreateSupplierData, UpdateSupplierData } from '@/types/supplier'
import { useToast } from './useToast'

interface UseSuppliersOptions extends SupplierFilters {
  auto_fetch?: boolean
  per_page?: number
}

export function useSuppliers(options: UseSuppliersOptions = {}) {
  const { auto_fetch = true, per_page, ...filters } = options
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const toast = useToast()

  const fetchSuppliers = async (currentFilters: SupplierFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      if (currentFilters.search) params.append('search', currentFilters.search)
      if (currentFilters.status !== undefined && currentFilters.status !== null) {
        params.append('status', currentFilters.status.toString())
      }
      if (currentFilters.page) params.append('page', currentFilters.page.toString())
      if (currentFilters.limit) params.append('limit', currentFilters.limit.toString())
      if (per_page) params.append('limit', per_page.toString())

      const response = await fetch(`/api/suppliers?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar fornecedores')
      }

      const data: SuppliersResponse = await response.json()
      setSuppliers(data.suppliers)
      setPagination(data.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast.error('Erro ao carregar fornecedores', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const createSupplier = async (data: CreateSupplierData): Promise<boolean> => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar fornecedor')
      }

      const newSupplier = await response.json()
      toast.success('Fornecedor criado com sucesso!')
      
      // Atualizar lista
      await fetchSuppliers(filters)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao criar fornecedor', {
        description: errorMessage
      })
      return false
    }
  }

  const updateSupplier = async (id: string, data: UpdateSupplierData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar fornecedor')
      }

      toast.success('Fornecedor atualizado com sucesso!')
      
      // Atualizar lista
      await fetchSuppliers(filters)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao atualizar fornecedor', {
        description: errorMessage
      })
      return false
    }
  }

  const deleteSupplier = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir fornecedor')
      }

      toast.success('Fornecedor desativado com sucesso!')
      
      // Atualizar lista
      await fetchSuppliers(filters)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao excluir fornecedor', {
        description: errorMessage
      })
      return false
    }
  }

  const getSupplier = async (id: string): Promise<Supplier | null> => {
    try {
      const response = await fetch(`/api/suppliers/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar fornecedor')
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error('Erro ao carregar fornecedor', {
        description: errorMessage
      })
      return null
    }
  }

  // Carregar fornecedores quando filters mudam
  useEffect(() => {
    if (auto_fetch) {
      fetchSuppliers(filters)
    }
  }, [JSON.stringify(filters), auto_fetch])

  return {
    suppliers,
    loading,
    error,
    pagination,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplier,
    refetch: () => fetchSuppliers(filters),
  }
}