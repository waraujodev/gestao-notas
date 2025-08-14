import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export const metadata: Metadata = {
  title: 'Relatórios - Gestão de Notas Fiscais',
  description: 'Relatórios e análises',
}

export default async function ReportsPage() {
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
          <h2 className='text-2xl font-bold tracking-tight'>Relatórios</h2>
          <p className='text-muted-foreground'>
            Análises e relatórios do sistema
          </p>
        </div>

        <div className='rounded-lg border bg-card p-6'>
          <p className='text-center text-muted-foreground'>
            Relatórios serão implementados na Fase 9
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}