'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Settings,
  BarChart3,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Fornecedores',
    href: '/suppliers',
    icon: Users,
  },
  {
    title: 'Notas Fiscais',
    href: '/invoices',
    icon: FileText,
  },
  {
    title: 'Pagamentos',
    href: '/payments',
    icon: CreditCard,
  },
  {
    title: 'Relatórios',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()

  const handleSignOut = () => {
    signOut()
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      {/* Logo e Header */}
      <div className="flex h-16 items-center justify-center border-b border-gray-700 px-6">
        <h1 className="text-xl font-bold text-white">
          Gestão de Notas
        </h1>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-gray-300'
                    : 'text-gray-400 group-hover:text-gray-300'
                )}
              />
              {item.title}
              {item.badge && (
                <span className="ml-auto inline-block rounded-full bg-red-600 px-2 py-1 text-xs text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Informações do Usuário e Logout */}
      <div className="border-t border-gray-700 p-4">
        <div className="mb-3 flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-300">
              {user?.email || 'Usuário'}
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}