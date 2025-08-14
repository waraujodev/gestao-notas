import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export const metadata: Metadata = {
  title: 'Notas Fiscais - Gestão de Notas Fiscais',
  description: 'Gerencie suas notas fiscais',
}

export default async function InvoicesPage() {
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
          <h2 className='text-2xl font-bold tracking-tight'>Notas Fiscais</h2>
          <p className='text-muted-foreground'>
            Gerencie suas notas fiscais e acompanhe pagamentos
          </p>
        </div>

        <div className='rounded-lg border bg-card p-6'>
          <p className='text-center text-muted-foreground'>
            Lista de notas fiscais será implementada na Fase 7
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}