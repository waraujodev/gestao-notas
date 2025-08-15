'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Breadcrumbs } from './Breadcrumbs'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar Mobile - Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu de navegação">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          
          {/* Sidebar */}
          <div className="relative flex w-64 flex-col bg-gray-900 focus-within:outline-none">
            <div className="absolute top-4 right-4 lg:hidden">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Fechar menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Área de Conteúdo */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Breadcrumbs />
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}