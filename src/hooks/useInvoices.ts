import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useToast } from './useToast'
import { createClient } from '@/lib/supabase/client'
import type { 
  Invoice, 
  InvoiceSummary, 
  InvoiceFilters, 
  InvoicesResponse,
  CreateInvoiceData,
  UpdateInvoiceData 
} from '@/types/invoice'

interface UseInvoicesOptions {
  page?: number
  per_page?: number
  filters?: InvoiceFilters
  auto_fetch?: boolean
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const {
    page = 1,
    per_page = 10,
    filters = {},
    auto_fetch = true
  } = options

  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
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

  // Memoizar dependências de filtros para evitar re-renders desnecessários
  const filterDeps = useMemo(() => [
    filters.search,
    filters.supplier_id, 
    filters.status,
    filters.due_date_from,
    filters.due_date_to
  ], [
    filters.search,
    filters.supplier_id,
    filters.status, 
    filters.due_date_from,
    filters.due_date_to
  ])

  const fetchInvoices = useCallback(async () => {
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

      const response = await fetch(`/api/invoices?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar notas fiscais')
      }

      const data: InvoicesResponse = await response.json()
      
      setInvoices(data.data)
      setPagination({
        count: data.count,
        page: data.page,
        per_page: data.per_page,
        total_pages: data.total_pages
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      console.error('Invoices fetch error:', message)
    } finally {
      setLoading(false)
    }
  }, [page, per_page, filterDeps])

  const createInvoice = async (data: CreateInvoiceData) => {
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('supplier_id', data.supplier_id)
      formData.append('series', data.series)
      formData.append('number', data.number)
      formData.append('due_date', data.due_date)
      formData.append('total_amount_cents', data.total_amount_cents.toString())
      formData.append('pdf_file', data.pdf_file)

      const response = await fetch('/api/invoices', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar nota fiscal')
      }

      await fetchInvoices()
      toast.success('Nota fiscal criada com sucesso!')

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateInvoice = async (data: UpdateInvoiceData) => {
    setLoading(true)
    
    try {
      const formData = new FormData()
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          if (key === 'pdf_file' && value instanceof File) {
            formData.append(key, value)
          } else if (key !== 'pdf_file') {
            formData.append(key, value.toString())
          }
        }
      })

      const response = await fetch(`/api/invoices/${data.id}`, {
        method: 'PUT',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao atualizar nota fiscal')
      }

      await fetchInvoices()
      toast.success('Nota fiscal atualizada com sucesso!')

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteInvoice = async (id: string) => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao excluir nota fiscal')
      }

      await fetchInvoices()
      toast.success('Nota fiscal excluída com sucesso!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getInvoiceById = async (id: string): Promise<InvoiceSummary | null> => {
    try {
      const response = await fetch(`/api/invoices/${id}`)
      
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
      fetchInvoices()
    }
  }, [auto_fetch, page, per_page, filters, fetchInvoices])

  // Mostrar toast de erro quando houver erro
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error, toast])

  return {
    invoices,
    loading,
    error,
    pagination,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    refetch: fetchInvoices
  }
}