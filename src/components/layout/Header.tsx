'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  // Mapear rotas para títulos
  const getPageTitle = (path: string): string => {
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/suppliers': 'Fornecedores',
      '/invoices': 'Notas Fiscais',
      '/payments': 'Pagamentos',
      '/payment-methods': 'Formas de Pagamento',
      '/reports': 'Relatórios',
      '/settings': 'Configurações',
    }

    return titles[path] || 'Gestão de Notas Fiscais'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar busca global
    console.log('Buscar:', searchQuery)
  }

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Menu Mobile + Título */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Abrir menu de navegação"
            aria-expanded="false"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {getPageTitle(pathname)}
            </h1>
          </div>
        </div>

        {/* Busca Central */}
        <div className="hidden flex-1 max-w-xs sm:block lg:max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="search"
              placeholder="Buscar notas, fornecedores..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Ações do Usuário */}
        <div className="flex items-center space-x-4">
          {/* Busca Mobile */}
          <Button variant="ghost" size="sm" className="sm:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Toggle Tema */}
          <ThemeToggle />

          {/* Notificações */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {/* Badge de notificação */}
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Menu do Usuário */}
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || ''}
                </p>
              </div>
              
              <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}