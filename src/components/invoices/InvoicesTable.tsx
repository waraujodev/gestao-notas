'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreHorizontal, FileText, Receipt } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableSkeleton } from '@/components/loading/TableSkeleton'
import { useInvoices } from '@/hooks/useInvoices'
import { InvoiceFilters, InvoiceSummary, PaymentStatus } from '@/types/invoice'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, isOverdue } from '@/lib/utils/date'
import { InvoicesFilters } from './InvoicesFilters'
import { InvoiceDialog } from './InvoiceDialog'
import { InvoicePayments } from './InvoicePayments'
import { PaymentDialog } from '@/components/payments/PaymentDialog'

function getStatusVariant(status: PaymentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Pago':
      return 'default' // Verde
    case 'Pago Parcial':
      return 'secondary' // Azul
    case 'Pendente':
      return 'outline' // Cinza
    case 'Atrasado':
      return 'destructive' // Vermelho
    default:
      return 'outline'
  }
}

export function InvoicesTable() {
  const [filters, setFilters] = useState<InvoiceFilters>({})
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<InvoiceSummary | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  // Dialog de confirmação para exclusão
  const { confirm: confirmDelete, ConfirmDialog } = useConfirmDialog({
    title: 'Excluir Nota Fiscal',
    description: 'Tem certeza que deseja excluir esta nota fiscal? Esta ação não pode ser desfeita e removerá também todos os pagamentos relacionados.',
    variant: 'destructive'
  })
  
  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceSummary | null>(null)
  
  // Payments view state
  const [viewingPayments, setViewingPayments] = useState(false)
  const [selectedInvoiceForPayments, setSelectedInvoiceForPayments] = useState<InvoiceSummary | null>(null)

  // Debounce do termo de busca para evitar muitas requisições
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const { 
    invoices, 
    loading, 
    pagination,
    deleteInvoice,
    refetch
  } = useInvoices({
    page,
    per_page: perPage,
    filters: {
      ...filters,
      search: debouncedSearchTerm || undefined,
    }
  })

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleFiltersChange = (newFilters: InvoiceFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleEdit = (invoice: InvoiceSummary) => {
    setEditingInvoice(invoice)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleView = (invoice: InvoiceSummary) => {
    // TODO: Implement view functionality in next phase
    console.log('View invoice:', invoice)
  }

  const handleAddPayment = (invoice: InvoiceSummary) => {
    setSelectedInvoiceForPayment(invoice)
    setPaymentDialogOpen(true)
  }

  const handleViewPayments = (invoice: InvoiceSummary) => {
    setSelectedInvoiceForPayments(invoice)
    setViewingPayments(true)
  }

  const handleDelete = async (invoiceId: string) => {
    confirmDelete(async () => {
      await deleteInvoice(invoiceId)
    })
  }

  const handleNewInvoice = () => {
    setEditingInvoice(null)
    setDialogMode('create')
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingInvoice(null)
    refetch()
  }

  const handlePaymentDialogClose = () => {
    setPaymentDialogOpen(false)
    setSelectedInvoiceForPayment(null)
  }

  const handlePaymentSuccess = () => {
    refetch()
  }

  const handleClosePaymentsView = () => {
    setViewingPayments(false)
    setSelectedInvoiceForPayments(null)
    refetch()
  }

  // Se estiver visualizando pagamentos, mostrar apenas essa tela
  if (viewingPayments && selectedInvoiceForPayments) {
    return (
      <InvoicePayments 
        invoice={selectedInvoiceForPayments} 
        onClose={handleClosePaymentsView}
      />
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notas Fiscais</CardTitle>
              <CardDescription>
                Gerencie suas notas fiscais e acompanhe pagamentos
              </CardDescription>
            </div>
            <Button onClick={handleNewInvoice}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Nota Fiscal
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
                  placeholder="Buscar por série, número ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <InvoicesFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClear={handleClearFilters}
                loading={loading}
              />
            </div>

            {/* Tabela */}
            {loading ? (
              <TableSkeleton rows={10} columns={8} />
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nota Fiscal</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead className="text-right">Valor Pago</TableHead>
                        <TableHead className="text-right">Valor Restante</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="text-muted-foreground">
                              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              {filters.search ? 
                                'Nenhuma nota fiscal encontrada com os filtros aplicados.' :
                                'Nenhuma nota fiscal cadastrada ainda.'
                              }
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        invoices.map((invoice) => {
                          const overdue = isOverdue(invoice.due_date)
                          
                          return (
                            <TableRow key={invoice.id} className="hover:bg-muted/50">
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {invoice.series}/{invoice.number}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Criada em {formatDate(invoice.created_at)}
                                  </div>
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {invoice.supplier?.name || 'Fornecedor não encontrado'}
                                  </div>
                                  {invoice.supplier?.document && (
                                    <div className="text-sm text-muted-foreground">
                                      {invoice.supplier.document}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              
                              <TableCell>
                                <div className={`space-y-1 ${overdue ? 'text-red-600' : ''}`}>
                                  <div className={overdue ? 'font-medium' : ''}>
                                    {formatDate(invoice.due_date)}
                                  </div>
                                  {overdue && (
                                    <div className="text-xs text-red-500">
                                      Em atraso
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              
                              <TableCell className="text-right font-medium">
                                {formatCurrency(invoice.total_amount_cents)}
                              </TableCell>
                              
                              <TableCell className="text-right">
                                {formatCurrency(invoice.paid_amount_cents || 0)}
                              </TableCell>
                              
                              <TableCell className="text-right">
                                {formatCurrency((invoice.total_amount_cents || 0) - (invoice.paid_amount_cents || 0))}
                              </TableCell>
                              
                              <TableCell>
                                <Badge variant={getStatusVariant(invoice.payment_status || 'Pendente')}>
                                  {invoice.payment_status || 'Pendente'}
                                </Badge>
                              </TableCell>
                              
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Abrir menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleView(invoice)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Visualizar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleAddPayment(invoice)}>
                                      <Plus className="mr-2 h-4 w-4" />
                                      Adicionar Pagamento
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewPayments(invoice)}>
                                      <Receipt className="mr-2 h-4 w-4" />
                                      Ver Pagamentos
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(invoice.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {((page - 1) * perPage) + 1} a {Math.min(page * perPage, pagination.count)} de {pagination.count} resultados
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        disabled={page === 1 || loading}
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center gap-1 text-sm">
                        <span>Página</span>
                        <span className="font-medium">{page}</span>
                        <span>de</span>
                        <span className="font-medium">{pagination.total_pages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.min(pagination.total_pages, page + 1))}
                        disabled={page === pagination.total_pages || loading}
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

      {/* Dialog for Create/Edit Invoice */}
      <InvoiceDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        invoice={editingInvoice}
        mode={dialogMode}
      />

      {/* Dialog for Add Payment */}
      {selectedInvoiceForPayment && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={handlePaymentDialogClose}
          invoice={selectedInvoiceForPayment}
          mode="create"
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Dialog de confirmação */}
      <ConfirmDialog />
    </>
  )
}