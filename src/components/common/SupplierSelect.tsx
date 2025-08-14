'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useSuppliers } from '@/hooks/useSuppliers'
import { formatDocument } from '@/lib/utils/document'
import type { Supplier } from '@/types/supplier'

interface SupplierSelectProps {
  value?: string
  onChange?: (supplierId: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  onCreateNew?: () => void
}

export function SupplierSelect({
  value,
  onChange,
  placeholder = 'Selecione um fornecedor...',
  disabled = false,
  error = false,
  onCreateNew
}: SupplierSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  
  const { suppliers, loading, refetch } = useSuppliers({
    limit: 100 // Buscar até 100 fornecedores
  })

  const selectedSupplier = suppliers.find(supplier => supplier.id === value)

  // Filtrar fornecedores baseado na busca local (além da busca do servidor)
  const filteredSuppliers = suppliers.filter(supplier => {
    if (!searchValue) return true
    
    const searchLower = searchValue.toLowerCase()
    return (
      supplier.name.toLowerCase().includes(searchLower) ||
      supplier.document?.toLowerCase().includes(searchLower)
    )
  })

  const handleSelect = (supplierId: string) => {
    onChange?.(supplierId)
    setOpen(false)
    setSearchValue('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSearchValue('')
    }
  }

  // Atualizar lista quando abrir o popover
  useEffect(() => {
    if (open && !loading) {
      refetch()
    }
  }, [open, refetch, loading])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            error && 'border-red-500 focus-visible:ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
        >
          {selectedSupplier ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedSupplier.name}</span>
              {selectedSupplier.document && (
                <span className="text-xs text-muted-foreground">
                  {formatDocument(selectedSupplier.document)}
                </span>
              )}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar fornecedor..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Nenhum fornecedor encontrado
                </p>
                {onCreateNew && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onCreateNew()
                      setOpen(false)
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Criar novo fornecedor
                  </Button>
                )}
              </div>
            </CommandEmpty>
            
            <CommandGroup>
              {onCreateNew && (
                <CommandItem
                  onSelect={() => {
                    onCreateNew()
                    setOpen(false)
                  }}
                  className="text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar novo fornecedor
                </CommandItem>
              )}
              
              {loading ? (
                <CommandItem disabled>
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Carregando fornecedores...
                  </div>
                </CommandItem>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <CommandItem
                    key={supplier.id}
                    value={`${supplier.name} ${supplier.document}`}
                    onSelect={() => handleSelect(supplier.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === supplier.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{supplier.name}</span>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {supplier.document && (
                          <span>{formatDocument(supplier.document)}</span>
                        )}
                        {supplier.email && (
                          <span>{supplier.email}</span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}