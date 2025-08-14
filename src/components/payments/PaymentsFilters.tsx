'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, X, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useSuppliers } from '@/hooks/useSuppliers'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import type { PaymentFilters } from '@/types/payment'

interface PaymentsFiltersProps {
  filters: PaymentFilters
  onFiltersChange: (filters: PaymentFilters) => void
  onClear: () => void
  loading?: boolean
}

export function PaymentsFilters({
  filters,
  onFiltersChange,
  onClear,
  loading = false
}: PaymentsFiltersProps) {
  const [localFilters, setLocalFilters] = useState<PaymentFilters>(filters)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  const { suppliers } = useSuppliers({ auto_fetch: true, per_page: 100 })
  const { paymentMethods } = usePaymentMethods({ auto_fetch: true })

  // Sincronizar filtros locais com props
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof PaymentFilters, value: string | Date | undefined) => {
    const newFilters = { ...localFilters }
    
    if (value === undefined || value === '' || value === 'all') {
      delete newFilters[key]
    } else {
      (newFilters as any)[key] = value instanceof Date ? value.toISOString().split('T')[0] : value
    }
    
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClear = () => {
    setLocalFilters({})
    onClear()
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filtros</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Campo de busca em linha separada para mais espaço */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Buscar</label>
        <Input
          placeholder="Nota fiscal, fornecedor, método ou observações..."
          value={localFilters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

        {/* Fornecedor */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Fornecedor</label>
          <Select
            value={localFilters.supplier_id || 'all'}
            onValueChange={(value) => handleFilterChange('supplier_id', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os fornecedores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os fornecedores</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Forma de Pagamento */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Forma de Pagamento</label>
          <Select
            value={localFilters.payment_method_id || 'all'}
            onValueChange={(value) => handleFilterChange('payment_method_id', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as formas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as formas</SelectItem>
              {paymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Valor mínimo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Valor Mínimo (R$)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0,00"
            value={localFilters.min_amount ? (Number(localFilters.min_amount) / 100).toFixed(2) : ''}
            onChange={(e) => {
              const value = e.target.value
              if (value === '') {
                handleFilterChange('min_amount', undefined)
              } else {
                const cents = Math.round(parseFloat(value) * 100)
                handleFilterChange('min_amount', cents.toString())
              }
            }}
            disabled={loading}
          />
        </div>

        {/* Valor máximo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Valor Máximo (R$)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0,00"
            value={localFilters.max_amount ? (Number(localFilters.max_amount) / 100).toFixed(2) : ''}
            onChange={(e) => {
              const value = e.target.value
              if (value === '') {
                handleFilterChange('max_amount', undefined)
              } else {
                const cents = Math.round(parseFloat(value) * 100)
                handleFilterChange('max_amount', cents.toString())
              }
            }}
            disabled={loading}
          />
        </div>

        {/* Data inicial */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Data Inicial</label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !localFilters.start_date && "text-muted-foreground"
                )}
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.start_date ? (
                  format(new Date(localFilters.start_date), "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  "Selecionar data"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.start_date ? new Date(localFilters.start_date) : undefined}
                onSelect={(date) => {
                  handleFilterChange('start_date', date)
                  setStartDateOpen(false)
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Data final */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Data Final</label>
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !localFilters.end_date && "text-muted-foreground"
                )}
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.end_date ? (
                  format(new Date(localFilters.end_date), "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  "Selecionar data"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.end_date ? new Date(localFilters.end_date) : undefined}
                onSelect={(date) => {
                  handleFilterChange('end_date', date)
                  setEndDateOpen(false)
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {localFilters.search && (
            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
              Busca: "{localFilters.search}"
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => handleFilterChange('search', undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {localFilters.supplier_id && (
            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
              Fornecedor selecionado
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => handleFilterChange('supplier_id', undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {localFilters.payment_method_id && (
            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
              Forma de pagamento
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => handleFilterChange('payment_method_id', undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}