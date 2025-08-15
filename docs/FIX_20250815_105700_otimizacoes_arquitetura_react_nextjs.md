# FIX: Otimizações de Arquitetura React/Next.js

**Data de criação:** 15/08/2025  
**Status:** ✅ CONCLUÍDO - Fases 1 e 2 implementadas  
**Baseado em:** Análise de arquitetura React 19+ e Next.js 15+

## 🎯 Objetivo

Implementar correções críticas de performance e arquitetura para garantir conformidade total com as melhores práticas do React 19+ e Next.js 15+, eliminando anti-patterns e otimizando a experiência do usuário.

## 🔍 Problemas Identificados

### 🔴 **Críticos (Performance)**

1. **JSON.stringify em dependências de hooks** - Causa re-renders desnecessários
2. **Componentes de tabela não memoizados** - Re-renderização completa a cada mudança
3. **Callbacks não otimizados** - Recriação de funções a cada render
4. **Memory leak potencial** - `router.refresh()` após desmontagem

### 🟡 **Importantes (Arquitetura)**

5. **Falta de Loading/Error Boundaries** - UX prejudicada durante estados de erro
6. **Componente InvoicesTable muito complexo** - 398 linhas, múltiplas responsabilidades

## 📋 Plano de Correções

### **Fase 1: Correções Críticas de Performance**

#### **1.1 Corrigir JSON.stringify em Hooks**

**Arquivos afetados:**
- `src/hooks/useInvoices.ts:82`
- `src/hooks/useSuppliers.ts:170`

**Problema atual:**
```typescript
// ❌ PROBLEMA - JSON.stringify é executado a cada render
}, [page, per_page, JSON.stringify(filters)])
```

**Solução:**
```typescript
// ✅ SOLUÇÃO - Memoizar string de filtros
const memoizedFilters = useMemo(() => 
  JSON.stringify(filters), [filters]
)

// Ou melhor ainda, dependências granulares:
const filterDeps = useMemo(() => [
  filters.search,
  filters.supplier_id,
  filters.status,
  filters.due_date_from,
  filters.due_date_to
], [filters.search, filters.supplier_id, filters.status, filters.due_date_from, filters.due_date_to])

// No useCallback:
}, [page, per_page, filterDeps])
```

#### **1.2 Implementar React.memo em Componentes de Tabela**

**Arquivos afetados:**
- `src/components/invoices/InvoicesTable.tsx`
- `src/components/suppliers/SuppliersTable.tsx`

**Implementação:**
```typescript
// ✅ SOLUÇÃO - Memoizar componentes pesados
export const InvoicesTable = React.memo(function InvoicesTable() {
  // ... implementação existente
})

export const SuppliersTable = React.memo(function SuppliersTable() {
  // ... implementação existente
})
```

#### **1.3 Otimizar Callbacks com useCallback**

**Padrão a ser aplicado:**
```typescript
// ✅ SOLUÇÃO - Callbacks memoizados
const handleSearch = useCallback((value: string) => {
  setSearchTerm(value)
  setPage(1)
}, [])

const handleFiltersChange = useCallback((newFilters: InvoiceFilters) => {
  setFilters(newFilters)
  setPage(1)
}, [])
```

#### **1.4 Corrigir Memory Leak no useAuth**

**Arquivo afetado:**
- `src/hooks/useAuth.ts`

**Problema atual:**
```typescript
// ❌ PROBLEMA - router.refresh() pode ser chamado após desmontagem
if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
  router.refresh()
}
```

**Solução:**
```typescript
// ✅ SOLUÇÃO - Verificar se componente ainda está montado
const isMountedRef = useRef(true)

useEffect(() => {
  return () => {
    isMountedRef.current = false
  }
}, [])

// No callback:
if (isMountedRef.current && (event === 'SIGNED_IN' || event === 'SIGNED_OUT')) {
  router.refresh()
}
```

### **Fase 2: Melhorias de Arquitetura**

#### **2.1 Implementar Loading e Error Boundaries**

**Novos arquivos a serem criados:**
- `app/dashboard/loading.tsx`
- `app/dashboard/error.tsx`
- `app/invoices/loading.tsx`
- `app/invoices/error.tsx`
- `app/suppliers/loading.tsx`
- `app/suppliers/error.tsx`

**Template de loading.tsx:**
```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}
```

**Template de error.tsx:**
```typescript
'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-semibold">Algo deu errado!</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
      </p>
      <Button onClick={reset}>Tentar Novamente</Button>
    </div>
  )
}
```

#### **2.2 Refatorar InvoicesTable - Extrair Hook Customizado**

**Novo arquivo:**
- `src/hooks/useInvoiceTable.ts`

**Estrutura do hook:**
```typescript
export function useInvoiceTable() {
  // Estados
  const [filters, setFilters] = useState<InvoiceFilters>({})
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  // ... outros estados

  // Memoizações
  const memoizedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearchTerm || undefined,
  }), [filters, debouncedSearchTerm])

  // Callbacks otimizados
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const handleFiltersChange = useCallback((newFilters: InvoiceFilters) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  // Lógica de negócio complexa
  const { invoices, loading, pagination, deleteInvoice, refetch } = useInvoices({
    page,
    per_page: 10,
    filters: memoizedFilters
  })

  return {
    // Estados
    filters,
    page,
    searchTerm,
    
    // Dados
    invoices,
    loading,
    pagination,
    
    // Handlers
    handleSearch,
    handleFiltersChange,
    handlePageChange: setPage,
    
    // Operações
    deleteInvoice,
    refetch
  }
}
```

#### **2.3 Criar Hook Otimizado para Filtros**

**Novo arquivo:**
- `src/hooks/useOptimizedFilters.ts`

```typescript
import { useState, useCallback, useMemo } from 'react'
import { isEqual } from 'lodash-es' // ou implementação própria

export function useOptimizedFilters<T extends Record<string, any>>(
  initialFilters: T
) {
  const [filtersState, setFiltersState] = useState<T>(initialFilters)
  
  // Memoizar para evitar re-renders desnecessários
  const memoizedFilters = useMemo(() => filtersState, [
    ...Object.values(filtersState)
  ])
  
  const setFilters = useCallback((newFilters: Partial<T> | ((prev: T) => T)) => {
    setFiltersState(prev => {
      const result = typeof newFilters === 'function' 
        ? newFilters(prev)
        : { ...prev, ...newFilters }
      
      // Só atualizar se realmente mudou
      return isEqual(prev, result) ? prev : result
    })
  }, [])
  
  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters)
  }, [initialFilters])
  
  return {
    filters: memoizedFilters,
    setFilters,
    clearFilters
  }
}
```

### **Fase 3: Otimizações Avançadas**

#### **3.1 Implementar Cache Otimista**

**Novo arquivo:**
- `src/hooks/useOptimisticMutation.ts`

```typescript
import { useOptimistic, useTransition } from 'react'

export function useOptimisticMutation<T, U>(
  initialData: T[],
  mutationFn: (data: U) => Promise<T>,
  optimisticUpdateFn: (data: T[], newItem: U) => T[]
) {
  const [isPending, startTransition] = useTransition()
  const [optimisticData, addOptimistic] = useOptimistic(
    initialData,
    optimisticUpdateFn
  )

  const mutate = async (data: U) => {
    addOptimistic(data)
    
    startTransition(async () => {
      try {
        await mutationFn(data)
      } catch (error) {
        // Rollback será automático
        throw error
      }
    })
  }

  return {
    data: optimisticData,
    mutate,
    isPending
  }
}
```

#### **3.2 Implementar Virtual Scrolling (Opcional)**

Para tabelas com muitos dados:

**Novo arquivo:**
- `src/components/ui/virtual-table.tsx`

```typescript
import { FixedSizeList as List } from 'react-window'

interface VirtualTableProps {
  items: any[]
  height: number
  itemHeight: number
  renderItem: (props: any) => React.ReactNode
}

export function VirtualTable({ items, height, itemHeight, renderItem }: VirtualTableProps) {
  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={items}
    >
      {renderItem}
    </List>
  )
}
```

## 📋 Checklist de Implementação

### **Fase 1: Performance (Crítico)**
- [x] **1.1** Corrigir JSON.stringify em useInvoices.ts
- [x] **1.2** Corrigir JSON.stringify em useSuppliers.ts  
- [x] **1.3** Implementar React.memo em InvoicesTable
- [x] **1.4** Implementar React.memo em SuppliersTable
- [x] **1.5** Otimizar callbacks em InvoicesTable
- [x] **1.6** Otimizar callbacks em SuppliersTable
- [x] **1.7** Corrigir memory leak em useAuth
- [x] **1.8** Testar performance antes/depois

### **Fase 2: Arquitetura (Importante)**
- [x] **2.1** Criar loading.tsx para todas as rotas principais
- [x] **2.2** Criar error.tsx para todas as rotas principais
- [x] **2.3** Extrair hook useInvoiceTable
- [x] **2.4** Refatorar InvoicesTable para usar o hook
- [x] **2.5** Criar hook useOptimizedFilters
- [x] **2.6** Aplicar hook de filtros onde apropriado

### **Fase 3: Otimizações Avançadas (Opcional)**
- [ ] **3.1** Implementar useOptimisticMutation
- [ ] **3.2** Considerar Virtual Scrolling para tabelas grandes
- [ ] **3.3** Implementar Server Actions (migração gradual)

## 🧪 Testes de Performance

### **Métricas a serem medidas:**

1. **Render Count**: Quantas vezes componentes re-renderizam
2. **Bundle Size**: Tamanho do bundle após otimizações
3. **First Contentful Paint (FCP)**: Tempo para primeiro conteúdo
4. **Largest Contentful Paint (LCP)**: Tempo para maior conteúdo
5. **Cumulative Layout Shift (CLS)**: Estabilidade visual

### **Ferramentas de medição:**

```typescript
// Contador de renders (desenvolvimento)
const renderCount = useRef(0)
renderCount.current++
console.log(`Component rendered ${renderCount.current} times`)

// Performance mark
performance.mark('component-start')
// ... código do componente
performance.mark('component-end')
performance.measure('component-duration', 'component-start', 'component-end')
```

## 📊 Resultados Esperados

### **Performance:**
- ⬇️ 70% redução em re-renders desnecessários
- ⬇️ 40% redução no tempo de renderização de tabelas
- ⬇️ 30% redução no bundle size das páginas

### **UX:**
- ⬆️ Loading states apropriados
- ⬆️ Error handling robusto
- ⬆️ Responsividade geral da aplicação

### **Maintainability:**
- ⬆️ Componentes menores e mais focados
- ⬆️ Hooks reutilizáveis
- ⬆️ Código mais legível e testável

## 🚀 Ordem de Implementação

1. **Prioridade Máxima:** Fase 1 (Performance crítica)
2. **Prioridade Alta:** Fase 2.1-2.2 (Loading/Error states)
3. **Prioridade Média:** Fase 2.3-2.6 (Refatoração de hooks)
4. **Prioridade Baixa:** Fase 3 (Otimizações avançadas)

## 📝 Notas de Implementação

### **Compatibilidade:**
- Todas as correções são compatíveis com React 19+ e Next.js 15+
- Não há breaking changes na API pública dos componentes
- Melhorias são progressivas e podem ser implementadas incrementalmente

### **Testing:**
- Cada correção deve incluir testes antes/depois
- Usar React DevTools Profiler para medir performance
- Lighthouse para métricas web vitals

### **Rollback:**
- Cada correção deve ser commitada separadamente
- Manter versões anteriores dos hooks durante transição
- Plano de rollback documentado para cada mudança

---

> **Próximos passos:** Implementar Fase 1 completamente antes de prosseguir com outras fases.  
> **Meta:** Projeto com performance otimizada e arquitetura exemplar para React 19+ e Next.js 15+