import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export const metadata: Metadata = {
  title: 'Pagamentos - Gestão de Notas Fiscais',
  description: 'Gerencie pagamentos de notas fiscais',
}

export default async function PaymentsPage() {
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
          <h2 className='text-2xl font-bold tracking-tight'>Pagamentos</h2>
          <p className='text-muted-foreground'>
            Acompanhe e gerencie os pagamentos das notas fiscais
          </p>
        </div>

        <div className='rounded-lg border bg-card p-6'>
          <p className='text-center text-muted-foreground'>
            Sistema de pagamentos será implementado na Fase 8
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}