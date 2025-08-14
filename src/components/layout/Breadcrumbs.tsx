'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  title: string
  href?: string
}

export function Breadcrumbs() {
  const pathname = usePathname()

  // Mapear rotas para breadcrumbs
  const getBreadcrumbs = (path: string): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean)
    
    const breadcrumbs: BreadcrumbItem[] = [
      { title: 'Início', href: '/dashboard' }
    ]

    // Mapear segmentos para títulos
    const segmentTitles: Record<string, string> = {
      dashboard: 'Dashboard',
      suppliers: 'Fornecedores',
      invoices: 'Notas Fiscais',
      payments: 'Pagamentos',
      'payment-methods': 'Formas de Pagamento',
      reports: 'Relatórios',
      settings: 'Configurações',
      new: 'Novo',
      edit: 'Editar',
      view: 'Visualizar',
    }

    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const title = segmentTitles[segment] || segment
      
      // Se é o último segmento, não adicionar href (página atual)
      if (index === segments.length - 1) {
        breadcrumbs.push({ title })
      } else {
        breadcrumbs.push({ title, href: currentPath })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(pathname)

  // Não mostrar breadcrumbs na página inicial ou de auth
  if (pathname === '/' || pathname.startsWith('/auth') || pathname === '/dashboard') {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1" />
          )}
          
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors flex items-center"
            >
              {index === 0 && <Home className="h-4 w-4 mr-1" />}
              {item.title}
            </Link>
          ) : (
            <span className="text-foreground font-medium flex items-center">
              {index === 0 && <Home className="h-4 w-4 mr-1" />}
              {item.title}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}