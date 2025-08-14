'use client'

import { useState } from 'react'
import { Calendar, Filter, RotateCcw } from 'lucide-react'
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
import type { DashboardFilters } from '@/hooks/useDashboard'

interface DashboardFiltersProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  onClear: () => void
  loading?: boolean
}

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todos os Períodos' },
  { value: 'week', label: 'Últimos 7 dias' },
  { value: 'month', label: 'Último mês' },
  { value: 'quarter', label: 'Últimos 3 meses' },
  { value: 'year', label: 'Último ano' },
  { value: 'custom', label: 'Período personalizado' },
]

export function DashboardFilters({
  filters,
  onFiltersChange,
  onClear,
  loading = false
}: DashboardFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<DashboardFilters>(filters)

  const updateFilter = (key: keyof DashboardFilters, value: string | undefined) => {
    const newFilters = {
      ...localFilters,
      [key]: value === '' ? undefined : value
    }

    // Se mudou o período para algo diferente de custom, limpar datas
    if (key === 'period' && value !== 'custom') {
      newFilters.start_date = undefined
      newFilters.end_date = undefined
    }

    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const clearAllFilters = () => {
    const clearedFilters: DashboardFilters = { period: 'all' }
    setLocalFilters(clearedFilters)
    onClear()
    setIsOpen(false)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.period && filters.period !== 'all') count++
    if (filters.start_date || filters.end_date) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Período
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
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros do Dashboard</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>

            {/* Período */}
            <div className="space-y-2">
              <Label>Período</Label>
              <Select
                value={localFilters.period || 'all'}
                onValueChange={(value) => updateFilter('period', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Datas personalizadas (apenas se período for 'custom') */}
            {localFilters.period === 'custom' && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Período Personalizado
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">Data Inicial</Label>
                    <Input
                      type="date"
                      value={localFilters.start_date || ''}
                      onChange={(e) => updateFilter('start_date', e.target.value)}
                      max={localFilters.end_date || undefined}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Data Final</Label>
                    <Input
                      type="date"
                      value={localFilters.end_date || ''}
                      onChange={(e) => updateFilter('end_date', e.target.value)}
                      min={localFilters.start_date || undefined}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={applyFilters} disabled={loading} className="flex-1">
                Aplicar Filtros
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex gap-1">
          {filters.period && filters.period !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {PERIOD_OPTIONS.find(opt => opt.value === filters.period)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={() => {
                  const newFilters: DashboardFilters = { ...filters, period: 'all' }
                  onFiltersChange(newFilters)
                }}
              >
                <RotateCcw className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {(filters.start_date || filters.end_date) && (
            <Badge variant="secondary" className="gap-1">
              {filters.start_date || '...'} até {filters.end_date || '...'}
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={() => {
                  const newFilters: DashboardFilters = { 
                    ...filters, 
                    start_date: undefined, 
                    end_date: undefined,
                    period: filters.period === 'custom' ? 'all' : filters.period
                  }
                  onFiltersChange(newFilters)
                }}
              >
                <RotateCcw className="h-2 w-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}