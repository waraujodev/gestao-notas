# ESPECIFICAÇÃO: Padrão de Interface para Tabelas

**Data de criação:** 14/08/2025  
**Hora:** 20:04:56  
**Categoria:** Especificação Técnica  
**Status:** Implementado

## 📋 Visão Geral

Este documento define o padrão consistente para implementação de páginas com tabelas no sistema de Gestão de Notas Fiscais. O padrão foi estabelecido com base nas implementações bem-sucedidas das páginas de Fornecedores e Formas de Pagamento, e aplicado na padronização da página de Notas Fiscais.

## 🎯 Objetivo

Garantir consistência visual e funcional entre todas as páginas do sistema que utilizam tabelas para CRUD de dados, melhorando a experiência do usuário e facilitando a manutenção do código.

## 📐 Estrutura de Arquivos

### 1. Página Principal (Server Component)
**Local:** `src/app/[entidade]/page.tsx`

```typescript
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { [Entidade]Table } from '@/components/[entidade]/[Entidade]Table'

export const metadata: Metadata = {
  title: '[Nome da Entidade] - Gestão de Notas Fiscais',
  description: 'Gerencie [descrição da entidade]',
}

export default async function [Entidade]Page() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>[Nome da Entidade]</h2>
          <p className='text-muted-foreground'>
            [Descrição detalhada da funcionalidade]
          </p>
        </div>

        <[Entidade]Table />
      </div>
    </DashboardLayout>
  )
}
```

### 2. Componente de Tabela (Client Component)
**Local:** `src/components/[entidade]/[Entidade]Table.tsx`

## 🏗️ Estrutura do Componente de Tabela

### Imports Obrigatórios

```typescript
'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreHorizontal, [IconesEspecificos] } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TableSkeleton } from '@/components/loading/TableSkeleton'
import { use[Entidade] } from '@/hooks/use[Entidade]'
// Outros imports específicos da entidade
```

### Estados Obrigatórios

```typescript
export function [Entidade]Table() {
  // Estados principais
  const [filters, setFilters] = useState<[Entidade]Filters>({})
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados de dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing[Entidade], setEditing[Entidade]] = useState<[TipoEntidade] | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  // Estados específicos (se necessário)
  // Ex: para invoices - pagamentos, visualizações, etc.
```

### Hook de Dados

```typescript
  const { 
    [entidades], 
    loading, 
    pagination,
    delete[Entidade],
    refetch
  } = use[Entidade]({
    page,
    per_page: perPage,
    filters
  })
```

### Handlers Obrigatórios

```typescript
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
    }))
    setPage(1)
  }

  const handleFiltersChange = (newFilters: [Entidade]Filters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleEdit = ([entidade]: [TipoEntidade]) => {
    setEditing[Entidade]([entidade])
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (deleteId) {
      await delete[Entidade](deleteId)
      setDeleteId(null)
    }
  }

  const handleNew[Entidade] = () => {
    setEditing[Entidade](null)
    setDialogMode('create')
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditing[Entidade](null)
    refetch()
  }
```

## 🎨 Estrutura Visual

### 1. Card Principal

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>[Nome da Entidade]</CardTitle>
        <CardDescription>
          [Descrição da funcionalidade]
        </CardDescription>
      </div>
      <Button onClick={handleNew[Entidade]}>
        <Plus className="mr-2 h-4 w-4" />
        Nova [Entidade]
      </Button>
    </div>
  </CardHeader>
  
  <CardContent>
    {/* Conteúdo da tabela */}
  </CardContent>
</Card>
```

### 2. Seção de Filtros

```tsx
<div className="space-y-4">
  {/* Filtros */}
  <div className="flex items-center space-x-4">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Buscar por [critérios específicos]..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
      />
    </div>
    <[Entidade]Filters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onClear={handleClearFilters}
      loading={loading}
    />
  </div>
```

### 3. Tabela com Loading e Estados Vazios

```tsx
  {/* Tabela */}
  {loading ? (
    <TableSkeleton rows={10} columns={[numero_colunas]} />
  ) : (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Cabeçalhos específicos */}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[entidades].length === 0 ? (
              <TableRow>
                <TableCell colSpan={[numero_colunas]} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <[IconeEntidade] className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    {filters.search ? 
                      'Nenhum(a) [entidade] encontrado(a) com os filtros aplicados.' :
                      'Nenhum(a) [entidade] cadastrado(a) ainda.'
                    }
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Mapeamento dos dados
            )}
          </TableBody>
        </Table>
      </div>
```

### 4. Menu de Ações

```tsx
<TableCell className="text-right">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">Abrir menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => handleView([entidade])}>
        <Eye className="mr-2 h-4 w-4" />
        Visualizar
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleEdit([entidade])}>
        <Edit className="mr-2 h-4 w-4" />
        Editar
      </DropdownMenuItem>
      {/* Ações específicas da entidade */}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => setDeleteId([entidade].id)}
        className="text-red-600"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Excluir
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>
```

### 5. Paginação

```tsx
{/* Paginação */}
{pagination.total_pages > 1 && (
  <div className="flex items-center justify-between">
    <div className="text-sm text-muted-foreground">
      Mostrando {((page - 1) * perPage) + 1} a {Math.min(page * perPage, pagination.count)} de {pagination.count} resultados
    </div>
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(Math.max(1, page - 1))}
        disabled={page === 1 || loading}
      >
        Anterior
      </Button>
      <div className="flex items-center gap-1 text-sm">
        <span>Página</span>
        <span className="font-medium">{page}</span>
        <span>de</span>
        <span className="font-medium">{pagination.total_pages}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(Math.min(pagination.total_pages, page + 1))}
        disabled={page === pagination.total_pages || loading}
      >
        Próxima
      </Button>
    </div>
  </div>
)}
```

### 6. Dialogs e Confirmações

```tsx
{/* Dialog for Create/Edit */}
<[Entidade]Dialog
  open={dialogOpen}
  onOpenChange={handleDialogClose}
  [entidade]={editing[Entidade]}
  mode={dialogMode}
/>

{/* Alert Dialog for Delete Confirmation */}
<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
      <AlertDialogDescription>
        Tem certeza que deseja excluir este(a) [entidade]? Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## 🎨 Padrões de Estilo

### Cores de Status (quando aplicável)

```typescript
function getStatusVariant(status: StatusType): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Ativo': return 'default' // Verde
    case 'Parcial': return 'secondary' // Azul  
    case 'Inativo': return 'outline' // Cinza
    case 'Erro': return 'destructive' // Vermelho
    default: return 'outline'
  }
}
```

### Classes CSS Consistentes

- **Espaçamento**: `space-y-4` para seções, `space-y-1` para itens relacionados
- **Hover**: `hover:bg-muted/50` para linhas da tabela
- **Texto secundário**: `text-muted-foreground` para informações auxiliares
- **Alinhamento**: `text-right` para valores monetários e ações
- **Ícones**: `h-4 w-4` para ícones pequenos, `h-12 w-12` para estados vazios

### Responsividade

- Usar `className="text-right"` para dispositivos móveis
- Priorizar informações essenciais em telas menores
- Quebrar layout em cards para mobile (implementação futura)

## 📦 Componentes Auxiliares Necessários

### 1. Filtros Específicos
`src/components/[entidade]/[Entidade]Filters.tsx`

### 2. Dialog de Formulário
`src/components/[entidade]/[Entidade]Dialog.tsx`

### 3. Hook de Dados
`src/hooks/use[Entidade].ts`

### 4. Tipos TypeScript
`src/types/[entidade].ts`

## ✅ Checklist de Implementação

Para aplicar este padrão em uma nova entidade:

- [ ] Criar página principal seguindo estrutura server component
- [ ] Implementar componente de tabela com todos os estados obrigatórios
- [ ] Criar componente de filtros específicos
- [ ] Implementar dialog de formulário
- [ ] Configurar hook de dados com paginação
- [ ] Definir tipos TypeScript
- [ ] Aplicar estilos consistentes
- [ ] Testar responsividade
- [ ] Implementar tratamento de erro
- [ ] Adicionar loading states
- [ ] Configurar confirmação de exclusão

## 🚀 Benefícios

1. **Consistência**: Interface uniforme em todo o sistema
2. **Manutenibilidade**: Código padronizado e previsível
3. **Produtividade**: Facilita criação de novas páginas
4. **UX**: Experiência consistente para o usuário
5. **Qualidade**: Menos bugs e comportamentos inesperados

## 📝 Observações

- Este padrão foi aplicado com sucesso nas páginas de Fornecedores, Formas de Pagamento e Notas Fiscais
- Futuras páginas devem seguir este padrão rigorosamente
- Exceções devem ser documentadas e justificadas
- Melhorias no padrão devem ser aplicadas retroativamente quando possível

---

**Última atualização:** 14/08/2025 - 20:04:56  
**Aplicado em:** Fornecedores, Formas de Pagamento, Notas Fiscais  
**Próximas aplicações:** Dashboard, Relatórios, Configurações