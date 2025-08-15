import { useCallback, useRef, useMemo } from 'react'
import { useDebounce } from './useDebounce'

/**
 * Hook otimizado para callbacks que dependem de valores que mudam frequentemente
 * Combina useCallback com debounce para reduzir re-renders desnecessários
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  delay: number = 300
): T {
  const callbackRef = useRef(callback)
  const depsRef = useRef(deps)
  
  // Atualizar refs quando dependências mudarem
  useMemo(() => {
    callbackRef.current = callback
    depsRef.current = deps
  }, deps)

  // Callback debounced que usa a ref mais atual
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      return callbackRef.current(...args)
    },
    []
  )

  // Aplicar debounce
  const debouncedFn = useDebounce(debouncedCallback, delay)

  return debouncedFn as T
}

/**
 * Hook para callbacks de pesquisa otimizados
 */
export function useSearchCallback(
  onSearch: (term: string) => void,
  delay: number = 500
) {
  return useOptimizedCallback(
    (searchTerm: string) => {
      // Só executar se o termo tiver pelo menos 2 caracteres ou for vazio
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        onSearch(searchTerm.trim())
      }
    },
    [onSearch],
    delay
  )
}

/**
 * Hook para callbacks de filtro otimizados
 */
export function useFilterCallback<T>(
  onFilter: (filters: T) => void,
  delay: number = 300
) {
  return useOptimizedCallback(
    (filters: T) => {
      onFilter(filters)
    },
    [onFilter],
    delay
  )
}

/**
 * Hook para memoizar objetos complexos e evitar re-renders
 */
export function useStableObject<T extends Record<string, any>>(obj: T): T {
  return useMemo(() => obj, Object.values(obj))
}

/**
 * Hook para memoizar arrays e evitar re-renders
 */
export function useStableArray<T>(array: T[]): T[] {
  return useMemo(() => array, [array.length, ...array])
}

/**
 * Hook para callbacks que só devem ser executados uma vez por período
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  delay: number = 1000
): T {
  const lastCall = useRef(0)
  const callbackRef = useRef(callback)

  useMemo(() => {
    callbackRef.current = callback
  }, deps)

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCall.current >= delay) {
        lastCall.current = now
        return callbackRef.current(...args)
      }
    }) as T,
    [delay]
  )
}

/**
 * Hook para detectar mudanças em valores e evitar atualizações desnecessárias
 */
export function useChangeDetection<T>(
  value: T,
  compareFn?: (prev: T, next: T) => boolean
) {
  const prevValue = useRef<T>(value)
  const hasChanged = useRef(false)

  const defaultCompare = (prev: T, next: T) => prev !== next

  const compare = compareFn || defaultCompare

  if (compare(prevValue.current, value)) {
    hasChanged.current = true
    prevValue.current = value
  } else {
    hasChanged.current = false
  }

  return {
    hasChanged: hasChanged.current,
    previousValue: prevValue.current
  }
}