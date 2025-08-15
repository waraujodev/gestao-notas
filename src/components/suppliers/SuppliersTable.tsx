'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/useDebounce'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { ResponsiveTable } from '@/components/ui/responsive-table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useSuppliers } from '@/hooks/useSuppliers'
import { SupplierFilters } from '@/types/supplier'
import { formatDate } from '@/lib/utils'
import { SuppliersFilters } from './SuppliersFilters'
import { SupplierForm } from './SupplierForm'

export const SuppliersTable = React.memo(function SuppliersTable() {
  const [filters, setFilters] = useState<SupplierFilters>(() => ({
    page: 1,
    limit: 10,
  }))
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null)

  // Debounce do termo de busca para evitar muitas requisições
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Dialog de confirmação para exclusão
  const { confirm: confirmDelete, ConfirmDialog } = useConfirmDialog({
    title: 'Excluir Fornecedor',
    description: 'Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita e pode afetar notas fiscais relacionadas.',
    variant: 'destructive'
  })

  // Memoizar objeto de filtros para evitar re-renders
  const memoizedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearchTerm || undefined,
  }), [
    filters.page,
    filters.limit,
    filters.status,
    debouncedSearchTerm
  ])

  const { suppliers, loading, pagination, deleteSupplier, refetch } = useSuppliers(memoizedFilters)

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
    // Reset página quando buscar
    setFilters(prev => ({
      ...prev,
      page: 1,
    }))
  }, [])

  const handleFilterChange = useCallback((newFilters: Partial<SupplierFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])

  const handleEdit = useCallback((supplierId: string) => {
    setEditingSupplier(supplierId)
    setShowForm(true)
  }, [])

  const handleDelete = useCallback(async (supplierId: string) => {
    confirmDelete(async () => {
      await deleteSupplier(supplierId)
    })
  }, [confirmDelete, deleteSupplier])

  const handleFormClose = useCallback(() => {
    setShowForm(false)
    setEditingSupplier(null)
    refetch()
  }, [refetch])

  const formatDocument = (document?: string) => {
    if (!document) return '-'
    
    // Formatar CNPJ ou CPF
    if (document.length === 14) {
      return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    } else if (document.length === 11) {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    
    return document
  }

  if (showForm) {
    return (
      <SupplierForm
        supplierId={editingSupplier}
        onClose={handleFormClose}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fornecedores</CardTitle>
            <CardDescription>
              Gerencie os fornecedores do seu negócio
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, documento ou email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <SuppliersFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          </div>

          {/* Tabela Responsiva */}
          <ResponsiveTable
            columns={[
              {
                key: 'name',
                label: 'Nome',
                isPrimary: true,
                showOnMobile: false,
              },
              {
                key: 'document',
                label: 'Documento',
                showOnMobile: true,
                render: (value) => formatDocument(value),
              },
              {
                key: 'email',
                label: 'Email',
                showOnMobile: false,
                render: (value) => value || '-',
              },
              {
                key: 'phone',
                label: 'Telefone',
                showOnMobile: false,
                render: (value) => value || '-',
              },
              {
                key: 'status',
                label: 'Status',
                showOnMobile: true,
                render: (value) => (
                  <Badge variant={value ? 'default' : 'secondary'}>
                    {value ? 'Ativo' : 'Inativo'}
                  </Badge>
                ),
              },
              {
                key: 'created_at',
                label: 'Criado em',
                showOnMobile: false,
                render: (value) => formatDate(value),
              },
            ]}
            data={suppliers}
            loading={loading}
            emptyMessage={
              filters.search
                ? 'Nenhum fornecedor encontrado com os filtros aplicados.'
                : 'Nenhum fornecedor cadastrado ainda.'
            }
            actions={[
              {
                label: 'Editar',
                icon: Edit,
                onClick: (supplier) => handleEdit(supplier.id),
              },
              {
                label: 'Excluir',
                icon: Trash2,
                onClick: (supplier) => handleDelete(supplier.id),
                variant: 'destructive',
                disabled: (supplier) => !supplier.status,
              },
            ]}
          />

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} fornecedores
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Dialog de confirmação */}
      <ConfirmDialog />
    </Card>
  )
})