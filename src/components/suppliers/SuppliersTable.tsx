'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/useDebounce'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TableSkeleton } from '@/components/loading/TableSkeleton'
import { useSuppliers } from '@/hooks/useSuppliers'
import { SupplierFilters } from '@/types/supplier'
import { formatDate } from '@/lib/utils'
import { SuppliersFilters } from './SuppliersFilters'
import { SupplierForm } from './SupplierForm'

export function SuppliersTable() {
  const [filters, setFilters] = useState<SupplierFilters>({
    page: 1,
    limit: 10,
  })
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

  const { suppliers, loading, pagination, deleteSupplier, refetch } = useSuppliers({
    ...filters,
    search: debouncedSearchTerm || undefined,
  })

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    // Reset página quando buscar
    setFilters(prev => ({
      ...prev,
      page: 1,
    }))
  }

  const handleFilterChange = (newFilters: Partial<SupplierFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleEdit = (supplierId: string) => {
    setEditingSupplier(supplierId)
    setShowForm(true)
  }

  const handleDelete = async (supplierId: string) => {
    confirmDelete(async () => {
      await deleteSupplier(supplierId)
    })
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingSupplier(null)
    refetch()
  }

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

          {/* Tabela */}
          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {filters.search ? 
                              'Nenhum fornecedor encontrado com os filtros aplicados.' :
                              'Nenhum fornecedor cadastrado ainda.'
                            }
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">
                            {supplier.name}
                          </TableCell>
                          <TableCell>
                            {formatDocument(supplier.document)}
                          </TableCell>
                          <TableCell>{supplier.email || '-'}</TableCell>
                          <TableCell>{supplier.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={supplier.status ? 'default' : 'secondary'}>
                              {supplier.status ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(supplier.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(supplier.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(supplier.id)}
                                disabled={!supplier.status}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

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
            </>
          )}
        </div>
      </CardContent>
      
      {/* Dialog de confirmação */}
      <ConfirmDialog />
    </Card>
  )
}