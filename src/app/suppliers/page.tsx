import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export const metadata: Metadata = {
  title: 'Fornecedores - Gestão de Notas Fiscais',
  description: 'Gerencie seus fornecedores',
}

export default async function SuppliersPage() {
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
          <h2 className='text-2xl font-bold tracking-tight'>Fornecedores</h2>
          <p className='text-muted-foreground'>
            Gerencie seus fornecedores e suas informações
          </p>
        </div>

        <div className='rounded-lg border bg-card p-6'>
          <p className='text-center text-muted-foreground'>
            Lista de fornecedores será implementada na Fase 4
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}