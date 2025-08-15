'use client'

import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import ErrorBoundary, { ErrorFallbackProps } from '@/components/ui/error-boundary'

interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ComponentType<ErrorFallbackProps>
  className?: string
}

// Fallback padrão para loading
function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    </div>
  )
}

// Fallback para loading em forma de card
function CardLoadingFallback() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  )
}

// Fallback para loading de tabelas
function TableLoadingFallback() {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="rounded-md border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente principal LazyWrapper
export function LazyWrapper({
  children,
  fallback = <DefaultLoadingFallback />,
  errorFallback,
  className
}: LazyWrapperProps) {
  return (
    <div className={className}>
      <ErrorBoundary fallback={errorFallback}>
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

// HOC para criar componentes lazy com configurações específicas
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  fallbackType: 'default' | 'card' | 'table' = 'default'
) {
  const LazyComponent = React.lazy(importFn)
  
  const fallbacks = {
    default: <DefaultLoadingFallback />,
    card: <CardLoadingFallback />,
    table: <TableLoadingFallback />
  }

  return React.forwardRef<any, P>((props, ref) => (
    <LazyWrapper fallback={fallbacks[fallbackType]}>
      <LazyComponent {...props} ref={ref} />
    </LazyWrapper>
  ))
}

// Hook para lazy loading condicional
export function useLazyLoading(shouldLoad: boolean = true) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasLoaded, setHasLoaded] = React.useState(false)

  React.useEffect(() => {
    if (shouldLoad && !hasLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false)
        setHasLoaded(true)
      }, 100) // Pequeno delay para evitar flash

      return () => clearTimeout(timer)
    }
  }, [shouldLoad, hasLoaded])

  return {
    isLoading: isLoading && !hasLoaded,
    hasLoaded
  }
}

// Componentes específicos para diferentes tipos de loading
export const LazyCard = ({ children, ...props }: LazyWrapperProps) => (
  <LazyWrapper fallback={<CardLoadingFallback />} {...props}>
    {children}
  </LazyWrapper>
)

export const LazyTable = ({ children, ...props }: LazyWrapperProps) => (
  <LazyWrapper fallback={<TableLoadingFallback />} {...props}>
    {children}
  </LazyWrapper>
)

// Hook para intersection observer (lazy loading baseado em viewport)
export function useIntersectionObserver(
  ref: React.RefObject<Element | null>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const [hasIntersected, setHasIntersected] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      const isElementIntersecting = entry.isIntersecting
      
      setIsIntersecting(isElementIntersecting)
      
      if (isElementIntersecting && !hasIntersected) {
        setHasIntersected(true)
      }
    }, {
      threshold: 0.1,
      ...options
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [hasIntersected, options])

  return {
    isIntersecting,
    hasIntersected
  }
}

// Componente para lazy loading baseado em scroll
export function LazyOnScroll({
  children,
  fallback = <DefaultLoadingFallback />,
  rootMargin = '100px'
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { hasIntersected } = useIntersectionObserver(ref, { rootMargin })

  return (
    <div ref={ref}>
      {hasIntersected ? (
        <LazyWrapper fallback={fallback}>
          {children}
        </LazyWrapper>
      ) : (
        fallback
      )}
    </div>
  )
}