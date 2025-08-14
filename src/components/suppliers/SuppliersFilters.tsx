'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SupplierFilters } from '@/types/supplier'

interface SuppliersFiltersProps {
  filters: SupplierFilters
  onFiltersChange: (filters: Partial<SupplierFilters>) => void
}

export function SuppliersFilters({ filters, onFiltersChange }: SuppliersFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleStatusFilter = (status: boolean | null) => {
    onFiltersChange({ status })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: null,
      search: undefined,
    })
  }

  const activeFiltersCount = [
    filters.status !== null && filters.status !== undefined,
    filters.search,
  ].filter(Boolean).length

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="relative"
      >
        <Filter className="mr-2 h-4 w-4" />
        Filtros
        {activeFiltersCount > 0 && (
          <Badge
            variant="default"
            className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
          >
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {showFilters && (
        <Card className="absolute right-0 top-full z-10 mt-2 w-80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Filtros</CardTitle>
                <CardDescription>
                  Refine sua busca por fornecedores
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Filtro por Status */}
            <div>
              <label className="text-sm font-medium">Status</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  variant={filters.status === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter(null)}
                >
                  Todos
                </Button>
                <Button
                  variant={filters.status === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter(true)}
                >
                  Ativos
                </Button>
                <Button
                  variant={filters.status === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter(false)}
                >
                  Inativos
                </Button>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={activeFiltersCount === 0}
              >
                Limpar Filtros
              </Button>
              <Button
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}