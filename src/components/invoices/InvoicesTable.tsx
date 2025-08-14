'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Eye, Edit2, Trash2, Plus, FileText, Receipt } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, isOverdue } from '@/lib/utils/date'
import type { InvoiceSummary, PaymentStatus } from '@/types/invoice'

interface InvoicesTableProps {
  invoices: InvoiceSummary[]
  loading?: boolean
  onEdit?: (invoice: InvoiceSummary) => void
  onDelete?: (id: string) => void
  onView?: (invoice: InvoiceSummary) => void
  onAddPayment?: (invoice: InvoiceSummary) => void
  onViewPayments?: (invoice: InvoiceSummary) => void
}

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

function getStatusColor(status: PaymentStatus): string {
  switch (status) {
    case 'Pago':
      return 'text-green-700 bg-green-100 border-green-200'
    case 'Pago Parcial':
      return 'text-blue-700 bg-blue-100 border-blue-200'
    case 'Pendente':
      return 'text-gray-700 bg-gray-100 border-gray-200'
    case 'Atrasado':
      return 'text-red-700 bg-red-100 border-red-200'
    default:
      return 'text-gray-700 bg-gray-100 border-gray-200'
  }
}

export function InvoicesTable({
  invoices,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onAddPayment,
  onViewPayments
}: InvoicesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  if (loading) {
    return (
      <div className="border rounded-md">
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
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold">Nenhuma nota fiscal encontrada</h3>
        <p className="mt-2 text-gray-600">
          Comece cadastrando sua primeira nota fiscal.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-md">
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
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const overdue = isOverdue(invoice.due_date)
              
              return (
                <TableRow key={invoice.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {invoice.series}/{invoice.number}
                      </div>
                      <div className="text-sm text-gray-500">
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
                        <div className="text-sm text-gray-500">
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
                    <div className={invoice.paid_amount_cents > 0 ? 'text-green-600' : 'text-gray-500'}>
                      {formatCurrency(invoice.paid_amount_cents)}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className={invoice.remaining_amount_cents > 0 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                      {formatCurrency(invoice.remaining_amount_cents)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      variant={getStatusVariant(invoice.payment_status)}
                      className={getStatusColor(invoice.payment_status)}
                    >
                      {invoice.payment_status}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(invoice)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                        )}
                        
                        {onViewPayments && (
                          <DropdownMenuItem onClick={() => onViewPayments(invoice)}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Ver Pagamentos
                          </DropdownMenuItem>
                        )}

                        {onAddPayment && invoice.remaining_amount_cents > 0 && (
                          <DropdownMenuItem onClick={() => onAddPayment(invoice)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Pagamento
                          </DropdownMenuItem>
                        )}
                        
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(invoice)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setDeleteId(invoice.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta nota fiscal? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}