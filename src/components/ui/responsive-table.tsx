'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ResponsiveTableColumn {
  key: string
  label: string
  /** Se a coluna deve aparecer no mobile (default: false) */
  showOnMobile?: boolean
  /** Se a coluna é a principal (aparece como título no mobile) */
  isPrimary?: boolean
  /** Renderizador customizado para o valor */
  render?: (value: any, row: any) => React.ReactNode
  /** Classe CSS customizada */
  className?: string
}

interface ResponsiveTableAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (row: any) => void
  variant?: 'default' | 'destructive'
  disabled?: (row: any) => boolean
}

interface ResponsiveTableProps {
  columns: ResponsiveTableColumn[]
  data: any[]
  actions?: ResponsiveTableAction[]
  loading?: boolean
  emptyMessage?: string
  mobileCardClassName?: string
}

export function ResponsiveTable({
  columns,
  data,
  actions = [],
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  mobileCardClassName,
}: ResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const primaryColumn = columns.find(col => col.isPrimary) || columns[0]
  const mobileColumns = columns.filter(col => col.showOnMobile)
  const hiddenColumns = columns.filter(col => !col.showOnMobile && !col.isPrimary)

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

  const renderCellValue = (column: ResponsiveTableColumn, value: any, row: any) => {
    if (column.render) {
      return column.render(value, row)
    }
    return value
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                    column.className
                  )}
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.id || index} className="border-b hover:bg-muted/50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-4 py-3 text-sm', column.className)}
                  >
                    {renderCellValue(column, row[column.key], row)}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, actionIndex) => {
                          const Icon = action.icon
                          const isDisabled = action.disabled?.(row) || false
                          
                          return (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={() => !isDisabled && action.onClick(row)}
                              disabled={isDisabled}
                              className={cn(
                                action.variant === 'destructive' && 'text-destructive'
                              )}
                            >
                              {Icon && <Icon className="mr-2 h-4 w-4" />}
                              {action.label}
                            </DropdownMenuItem>
                          )
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((row, index) => {
          const rowId = row.id || index.toString()
          const isExpanded = expandedRows.has(rowId)
          const hasHiddenColumns = hiddenColumns.length > 0

          return (
            <Card 
              key={rowId} 
              className={cn('overflow-hidden focus-within:ring-2 focus-within:ring-primary', mobileCardClassName)}
              tabIndex={0}
              role="article"
              aria-label={`Item ${index + 1}: ${renderCellValue(primaryColumn, row[primaryColumn.key], row)}`}
            >
              <CardContent className="p-4">
                {/* Linha Principal */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Título Principal */}
                    <div className="font-medium text-foreground mb-1">
                      {renderCellValue(primaryColumn, row[primaryColumn.key], row)}
                    </div>
                    
                    {/* Colunas Mobile Visíveis */}
                    {mobileColumns.map((column) => (
                      <div key={column.key} className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">{column.label}:</span>{' '}
                        {renderCellValue(column, row[column.key], row)}
                      </div>
                    ))}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center space-x-2">
                    {/* Botão de Expandir (se há colunas ocultas) */}
                    {hasHiddenColumns && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(rowId)}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}

                    {/* Menu de Ações */}
                    {actions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, actionIndex) => {
                            const Icon = action.icon
                            const isDisabled = action.disabled?.(row) || false
                            
                            return (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={() => !isDisabled && action.onClick(row)}
                                disabled={isDisabled}
                                className={cn(
                                  action.variant === 'destructive' && 'text-destructive'
                                )}
                              >
                                {Icon && <Icon className="mr-2 h-4 w-4" />}
                                {action.label}
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {isExpanded && hasHiddenColumns && (
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    {hiddenColumns.map((column) => (
                      <div key={column.key} className="text-sm">
                        <span className="font-medium text-muted-foreground">
                          {column.label}:
                        </span>{' '}
                        <span className="text-foreground">
                          {renderCellValue(column, row[column.key], row)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}