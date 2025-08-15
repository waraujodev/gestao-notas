import { useState, useCallback, useMemo } from 'react'

/**
 * Hook para otimizar gerenciamento de filtros
 * Evita re-renders desnecessários usando deep comparison
 * e memoização inteligente
 */
export function useOptimizedFilters<T extends Record<string, any>>(
  initialFilters: T
) {
  const [filtersState, setFiltersState] = useState<T>(initialFilters)
  
  // Memoizar filtros baseado nos valores, não na referência do objeto
  const memoizedFilters = useMemo(() => filtersState, [
    ...Object.values(filtersState)
  ])
  
  // Função otimizada para atualizar filtros
  const setFilters = useCallback((newFilters: Partial<T> | ((prev: T) => T)) => {
    setFiltersState(prev => {
      const result = typeof newFilters === 'function' 
        ? newFilters(prev)
        : { ...prev, ...newFilters }
      
      // Comparação simples para evitar atualizações desnecessárias
      const hasChanged = Object.keys(result).some(key => 
        result[key] !== prev[key]
      ) || Object.keys(prev).some(key => 
        !(key in result) && prev[key] !== undefined
      )
      
      return hasChanged ? result : prev
    })
  }, [])
  
  // Função para limpar todos os filtros
  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters)
  }, [initialFilters])
  
  // Função para resetar um filtro específico
  const resetFilter = useCallback((key: keyof T) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      if (key in initialFilters) {
        newFilters[key] = initialFilters[key]
      } else {
        delete newFilters[key]
      }
      return newFilters
    })
  }, [initialFilters, setFilters])
  
  // Função para verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return Object.keys(memoizedFilters).some(key => {
      const value = memoizedFilters[key]
      const initialValue = initialFilters[key]
      
      // Considera ativo se for diferente do valor inicial
      // ou se não existia no estado inicial
      return value !== initialValue && value !== undefined && value !== null && value !== ''
    })
  }, [memoizedFilters, initialFilters])
  
  // Contador de filtros ativos
  const activeFiltersCount = useMemo(() => {
    return Object.values(memoizedFilters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length
  }, [memoizedFilters])
  
  return {
    filters: memoizedFilters,
    setFilters,
    clearFilters,
    resetFilter,
    hasActiveFilters,
    activeFiltersCount
  }
}

/**
 * Versão simplificada para casos onde não é necessário 
 * comparação complexa
 */
export function useSimpleFilters<T extends Record<string, any>>(
  initialFilters: T
) {
  const [filters, setFiltersState] = useState<T>(initialFilters)
  
  const setFilters = useCallback((newFilters: Partial<T> | ((prev: T) => T)) => {
    setFiltersState(prev => 
      typeof newFilters === 'function' 
        ? newFilters(prev)
        : { ...prev, ...newFilters }
    )
  }, [])
  
  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters)
  }, [initialFilters])
  
  return {
    filters,
    setFilters,
    clearFilters
  }
}