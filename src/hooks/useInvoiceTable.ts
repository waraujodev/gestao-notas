import { useState, useMemo, useCallback } from 'react'
import { InvoiceFilters, InvoiceSummary } from '@/types/invoice'
import { useDebounce } from './useDebounce'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { useInvoices } from './useInvoices'

export function useInvoiceTable() {
  // Estados principais
  const [filters, setFilters] = useState<InvoiceFilters>({})
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados para dialogs e modais
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<InvoiceSummary | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  
  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceSummary | null>(null)
  
  // Payments view state
  const [viewingPayments, setViewingPayments] = useState(false)
  const [selectedInvoiceForPayments, setSelectedInvoiceForPayments] = useState<InvoiceSummary | null>(null)

  // Debounce do termo de busca para evitar muitas requisições
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Memoizar filtros para evitar recriações desnecessárias
  const memoizedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearchTerm || undefined,
  }), [filters, debouncedSearchTerm])

  // Dialog de confirmação para exclusão
  const { confirm: confirmDelete, ConfirmDialog } = useConfirmDialog({
    title: 'Excluir Nota Fiscal',
    description: 'Tem certeza que deseja excluir esta nota fiscal? Esta ação não pode ser desfeita e removerá também todos os pagamentos relacionados.',
    variant: 'destructive'
  })

  // Hook principal de dados
  const { 
    invoices, 
    loading, 
    pagination,
    deleteInvoice,
    refetch
  } = useInvoices({
    page,
    per_page: perPage,
    filters: memoizedFilters
  })

  // Handlers otimizados com useCallback
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const handleFiltersChange = useCallback((newFilters: InvoiceFilters) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({})
    setSearchTerm('')
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleEdit = useCallback((invoice: InvoiceSummary) => {
    setEditingInvoice(invoice)
    setDialogMode('edit')
    setDialogOpen(true)
  }, [])

  const handleView = useCallback((invoice: InvoiceSummary) => {
    // TODO: Implement view functionality in next phase
    console.log('View invoice:', invoice)
  }, [])

  const handleAddPayment = useCallback((invoice: InvoiceSummary) => {
    setSelectedInvoiceForPayment(invoice)
    setPaymentDialogOpen(true)
  }, [])

  const handleViewPayments = useCallback((invoice: InvoiceSummary) => {
    setSelectedInvoiceForPayments(invoice)
    setViewingPayments(true)
  }, [])

  const handleDelete = useCallback(async (invoiceId: string) => {
    confirmDelete(async () => {
      await deleteInvoice(invoiceId)
    })
  }, [confirmDelete, deleteInvoice])

  const handleNewInvoice = useCallback(() => {
    setEditingInvoice(null)
    setDialogMode('create')
    setDialogOpen(true)
  }, [])

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false)
    setEditingInvoice(null)
    refetch()
  }, [refetch])

  const handlePaymentDialogClose = useCallback(() => {
    setPaymentDialogOpen(false)
    setSelectedInvoiceForPayment(null)
  }, [])

  const handlePaymentSuccess = useCallback(() => {
    refetch()
  }, [refetch])

  const handleClosePaymentsView = useCallback(() => {
    setViewingPayments(false)
    setSelectedInvoiceForPayments(null)
    refetch()
  }, [refetch])

  return {
    // Estados base
    filters,
    page,
    perPage,
    searchTerm,
    
    // Estados de UI
    dialogOpen,
    editingInvoice,
    dialogMode,
    paymentDialogOpen,
    selectedInvoiceForPayment,
    viewingPayments,
    selectedInvoiceForPayments,
    
    // Dados
    invoices,
    loading,
    pagination,
    
    // Handlers de busca e filtros
    handleSearch,
    handleFiltersChange,
    handleClearFilters,
    handlePageChange,
    
    // Handlers de ações
    handleEdit,
    handleView,
    handleAddPayment,
    handleViewPayments,
    handleDelete,
    handleNewInvoice,
    
    // Handlers de dialogs
    handleDialogClose,
    handlePaymentDialogClose,
    handlePaymentSuccess,
    handleClosePaymentsView,
    
    // Operações
    refetch,
    
    // Componentes
    ConfirmDialog
  }
}