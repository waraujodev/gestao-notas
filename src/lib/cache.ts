/**
 * Sistema de cache simples para otimizar consultas repetidas
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  expiry?: number
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutos em ms

  /**
   * Armazena um item no cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = ttl || this.defaultTTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    })
  }

  /**
   * Recupera um item do cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > (item.expiry || this.defaultTTL)) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  /**
   * Remove um item específico do cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Remove itens que correspondem a um padrão
   */
  deletePattern(pattern: RegExp): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Remove itens expirados
   */
  cleanup(): number {
    let count = 0
    const now = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > (item.expiry || this.defaultTTL)) {
        this.cache.delete(key)
        count++
      }
    }
    
    return count
  }

  /**
   * Verifica se um item existe no cache e ainda é válido
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > (item.expiry || this.defaultTTL)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Instância global do cache
const globalCache = new SimpleCache()

/**
 * Hook para usar cache em componentes React
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  ttl?: number
): {
  data: T | null
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
} {
  const [data, setData] = React.useState<T | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Verificar cache primeiro
      const cached = globalCache.get<T>(key)
      if (cached) {
        setData(cached)
        return
      }

      // Buscar dados
      const result = await fetcher()
      
      // Armazenar no cache
      globalCache.set(key, result, ttl)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = async () => {
    globalCache.delete(key)
    await fetchData()
  }

  React.useEffect(() => {
    fetchData()
  }, [key])

  return {
    data,
    isLoading,
    error,
    refresh
  }
}

/**
 * Hook para invalidar cache relacionado a um usuário
 */
export function useCacheInvalidation() {
  const invalidateUser = (userId: string) => {
    globalCache.deletePattern(new RegExp(`^user:${userId}:`))
  }

  const invalidateSuppliers = (userId: string) => {
    globalCache.deletePattern(new RegExp(`^suppliers:${userId}`))
  }

  const invalidateInvoices = (userId: string) => {
    globalCache.deletePattern(new RegExp(`^invoices:${userId}`))
  }

  const invalidatePayments = (userId: string) => {
    globalCache.deletePattern(new RegExp(`^payments:${userId}`))
  }

  const invalidateDashboard = (userId: string) => {
    globalCache.deletePattern(new RegExp(`^dashboard:${userId}`))
  }

  const invalidateAll = () => {
    globalCache.clear()
  }

  return {
    invalidateUser,
    invalidateSuppliers,
    invalidateInvoices,
    invalidatePayments,
    invalidateDashboard,
    invalidateAll
  }
}

/**
 * Função utilitária para criar chaves de cache consistentes
 */
export const cacheKeys = {
  suppliers: (userId: string, filters?: any) => 
    `suppliers:${userId}${filters ? ':' + JSON.stringify(filters) : ''}`,
  
  invoices: (userId: string, filters?: any) => 
    `invoices:${userId}${filters ? ':' + JSON.stringify(filters) : ''}`,
  
  payments: (userId: string, invoiceId?: string) => 
    `payments:${userId}${invoiceId ? ':' + invoiceId : ''}`,
  
  paymentMethods: (userId: string) => 
    `payment-methods:${userId}`,
  
  dashboard: (userId: string, period?: string) => 
    `dashboard:${userId}${period ? ':' + period : ''}`,
  
  invoice: (userId: string, invoiceId: string) => 
    `invoice:${userId}:${invoiceId}`,
  
  supplier: (userId: string, supplierId: string) => 
    `supplier:${userId}:${supplierId}`
}

// Limpeza automática do cache a cada 10 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cleaned = globalCache.cleanup()
    if (cleaned > 0) {
      console.log(`Cache: Removed ${cleaned} expired items`)
    }
  }, 10 * 60 * 1000) // 10 minutos
}

import React from 'react'

export { globalCache as cache }