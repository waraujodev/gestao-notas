'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Filter, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'
import { useSuppliers } from '@/hooks/useSuppliers'
import { getDateInputValue } from '@/lib/utils/date'
import type { InvoiceFilters, PaymentStatus } from '@/types/invoice'

interface InvoicesFiltersProps {
  filters: InvoiceFilters
  onFiltersChange: (filters: InvoiceFilters) => void
  onClear: () => void
  loading?: boolean
}

const STATUS_OPTIONS: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Pago Parcial', label: 'Pago Parcial' },
  { value: 'Pago', label: 'Pago' },
  { value: 'Atrasado', label: 'Atrasado' },
]

export function InvoicesFilters({
  filters,
  onFiltersChange,
  onClear,
  loading = false
}: InvoicesFiltersProps) {
  const [localFilters, setLocalFilters] = useState<InvoiceFilters>(filters)
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout>()
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const { suppliers, loading: loadingSuppliers } = useSuppliers({ 
    status: true,
    limit: 100 
  })

  // Debounce search input
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce)
    }

    const timeout = setTimeout(() => {
      onFiltersChange(localFilters)
    }, 300)

    setSearchDebounce(timeout)

    return () => clearTimeout(timeout)
  }, [localFilters.search])

  // Update filters immediately for non-search fields
  useEffect(() => {
    const { search, ...otherFilters } = localFilters
    const { search: currentSearch, ...currentOtherFilters } = filters
    
    // Only update if non-search filters changed
    if (JSON.stringify(otherFilters) !== JSON.stringify(currentOtherFilters)) {
      onFiltersChange(localFilters)
    }
  }, [localFilters.supplier_id, localFilters.status, localFilters.due_date_from, localFilters.due_date_to, localFilters.created_from, localFilters.created_to])

  const updateFilter = (key: keyof InvoiceFilters, value: string | undefined) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }))
  }

  const clearAllFilters = () => {
    setLocalFilters({})
    onClear()
    if (searchInputRef.current) {
      searchInputRef.current.value = ''
    }
    setIsAdvancedOpen(false)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.supplier_id) count++
    if (filters.status && filters.status !== 'all') count++
    if (filters.due_date_from || filters.due_date_to) count++
    if (filters.created_from || filters.created_to) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={searchInputRef}
            placeholder="Buscar por série, número da nota ou fornecedor..."
            className="pl-10"
            defaultValue={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            disabled={loading}
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => {
                updateFilter('search', undefined)
                if (searchInputRef.current) {
                  searchInputRef.current.value = ''
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros Avançados</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Limpar Todos
                  </Button>
                )}
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status do Pagamento</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Supplier Filter */}
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select
                  value={filters.supplier_id || 'all'}
                  onValueChange={(value) => updateFilter('supplier_id', value === 'all' ? undefined : value)}
                  disabled={loadingSuppliers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Fornecedores</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Período de Vencimento
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">De</Label>
                    <Input
                      type="date"
                      value={filters.due_date_from || ''}
                      onChange={(e) => updateFilter('due_date_from', e.target.value)}
                      max={filters.due_date_to || undefined}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Até</Label>
                    <Input
                      type="date"
                      value={filters.due_date_to || ''}
                      onChange={(e) => updateFilter('due_date_to', e.target.value)}
                      min={filters.due_date_from || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Created Date Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Período de Criação
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">De</Label>
                    <Input
                      type="date"
                      value={filters.created_from || ''}
                      onChange={(e) => updateFilter('created_from', e.target.value)}
                      max={filters.created_to || getDateInputValue()}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Até</Label>
                    <Input
                      type="date"
                      value={filters.created_to || ''}
                      onChange={(e) => updateFilter('created_to', e.target.value)}
                      min={filters.created_from || undefined}
                      max={getDateInputValue()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Busca: "{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  updateFilter('search', undefined)
                  if (searchInputRef.current) {
                    searchInputRef.current.value = ''
                  }
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.supplier_id && (
            <Badge variant="secondary" className="gap-1">
              Fornecedor: {suppliers.find(s => s.id === filters.supplier_id)?.name || 'Desconhecido'}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => updateFilter('supplier_id', undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => updateFilter('status', undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {(filters.due_date_from || filters.due_date_to) && (
            <Badge variant="secondary" className="gap-1">
              Vencimento: {filters.due_date_from || '...'} até {filters.due_date_to || '...'}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  updateFilter('due_date_from', undefined)
                  updateFilter('due_date_to', undefined)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {(filters.created_from || filters.created_to) && (
            <Badge variant="secondary" className="gap-1">
              Criação: {filters.created_from || '...'} até {filters.created_to || '...'}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  updateFilter('created_from', undefined)
                  updateFilter('created_to', undefined)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}