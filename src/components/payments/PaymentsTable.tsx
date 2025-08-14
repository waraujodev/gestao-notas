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
import { MoreHorizontal, Eye, Edit2, Trash2, FileText, Image, Receipt, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import type { Payment } from '@/types/payment'

interface PaymentsTableProps {
  payments: Payment[]
  loading?: boolean
  showInvoiceInfo?: boolean
  onEdit?: (payment: Payment) => void
  onDelete?: (id: string) => void
  onView?: (payment: Payment) => void
  onDownloadReceipt?: (payment: Payment) => void
}

export function PaymentsTable({
  payments,
  loading = false,
  showInvoiceInfo = true,
  onEdit,
  onDelete,
  onView,
  onDownloadReceipt
}: PaymentsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const getReceiptIcon = (receiptType: 'pdf' | 'jpg' | 'png') => {
    switch (receiptType) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />
      case 'jpg':
      case 'png':
        return <Image className="h-4 w-4 text-blue-600" />
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {showInvoiceInfo && <TableHead>Nota Fiscal</TableHead>}
              <TableHead>Data</TableHead>
              <TableHead>Forma de Pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Comprovante</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {showInvoiceInfo && (
                  <TableCell>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
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

  if (payments.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center">
        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum pagamento encontrado</h3>
        <p className="mt-2 text-gray-600">
          {showInvoiceInfo 
            ? 'Não há pagamentos cadastrados ainda.'
            : 'Esta nota fiscal ainda não possui pagamentos registrados.'
          }
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
              {showInvoiceInfo && <TableHead>Nota Fiscal</TableHead>}
              <TableHead>Data do Pagamento</TableHead>
              <TableHead>Forma de Pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Comprovante</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} className="hover:bg-muted/50">
                {showInvoiceInfo && (
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {payment.invoice?.series}/{payment.invoice?.number}
                      </div>
                      {payment.invoice?.supplier && (
                        <div className="text-sm text-muted-foreground">
                          {payment.invoice.supplier.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                )}
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {formatDate(payment.payment_date)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Registrado em {formatDate(payment.created_at)}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline">
                    {payment.payment_method?.name || 'Não informado'}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="font-semibold text-green-600">
                    {formatCurrency(payment.amount_cents)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getReceiptIcon(payment.receipt_type)}
                    <span className="text-sm text-muted-foreground capitalize">
                      {payment.receipt_type}
                    </span>
                    {onDownloadReceipt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadReceipt(payment)}
                        className="h-6 w-6 p-0"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {payment.notes ? (
                    <div className="max-w-32 truncate text-sm" title={payment.notes}>
                      {payment.notes}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
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
                        <DropdownMenuItem onClick={() => onView(payment)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                      )}
                      
                      {onDownloadReceipt && (
                        <DropdownMenuItem onClick={() => onDownloadReceipt(payment)}>
                          <Download className="mr-2 h-4 w-4" />
                          Baixar Comprovante
                        </DropdownMenuItem>
                      )}
                      
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(payment)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => setDeleteId(payment.id)}
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
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
              O valor será descontado do total pago da nota fiscal.
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