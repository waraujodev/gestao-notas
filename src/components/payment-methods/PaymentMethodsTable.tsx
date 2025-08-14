'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { PaymentMethodFilters } from '@/types/payment-method'
import { formatDate } from '@/lib/utils'
import { PaymentMethodsFilters } from './PaymentMethodsFilters'
import { PaymentMethodForm } from './PaymentMethodForm'

export function PaymentMethodsTable() {
  const [filters, setFilters] = useState<PaymentMethodFilters>({
    page: 1,
    limit: 20,
    type: 'all',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<string | null>(null)

  const { paymentMethods, loading, pagination, deletePaymentMethod, refetch } = usePaymentMethods(filters)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }))
  }

  const handleFilterChange = (newFilters: Partial<PaymentMethodFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleEdit = (paymentMethodId: string) => {
    setEditingPaymentMethod(paymentMethodId)
    setShowForm(true)
  }

  const handleDelete = async (paymentMethodId: string) => {
    if (confirm('Tem certeza que deseja desativar esta forma de pagamento?')) {
      await deletePaymentMethod(paymentMethodId)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPaymentMethod(null)
    refetch()
  }

  const canEdit = (paymentMethod: any) => {
    return !paymentMethod.is_system_default && paymentMethod.user_id !== null
  }

  if (showForm) {
    return (
      <PaymentMethodForm
        paymentMethodId={editingPaymentMethod}
        onClose={handleFormClose}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Formas de Pagamento</CardTitle>
            <CardDescription>
              Gerencie as formas de pagamento disponíveis no sistema
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Forma de Pagamento
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
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <PaymentMethodsFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          </div>

          {/* Tabela */}
          {loading ? (
            <TableSkeleton rows={10} columns={6} />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {filters.search ? 
                              'Nenhuma forma de pagamento encontrada com os filtros aplicados.' :
                              'Nenhuma forma de pagamento cadastrada ainda.'
                            }
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paymentMethods.map((paymentMethod) => (
                        <TableRow key={paymentMethod.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              {paymentMethod.is_system_default && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                              <span>{paymentMethod.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{paymentMethod.description || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={paymentMethod.is_system_default ? 'default' : 'secondary'}>
                              {paymentMethod.is_system_default ? 'Sistema' : 'Personalizada'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={paymentMethod.status ? 'success' : 'secondary'}>
                              {paymentMethod.status ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>{paymentMethod.display_order}</TableCell>
                          <TableCell>
                            {formatDate(paymentMethod.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {canEdit(paymentMethod) && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(paymentMethod.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(paymentMethod.id)}
                                    disabled={!paymentMethod.status}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {!canEdit(paymentMethod) && (
                                <span className="text-xs text-muted-foreground">
                                  Sistema
                                </span>
                              )}
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
                    {pagination.total} formas de pagamento
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
    </Card>
  )
}