import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export const metadata: Metadata = {
  title: 'Configurações - Gestão de Notas Fiscais',
  description: 'Configurações do sistema',
}

export default async function SettingsPage() {
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
          <h2 className='text-2xl font-bold tracking-tight'>Configurações</h2>
          <p className='text-muted-foreground'>
            Configure as preferências do sistema
          </p>
        </div>

        <div className='rounded-lg border bg-card p-6'>
          <p className='text-center text-muted-foreground'>
            Página de configurações será implementada nas próximas fases
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}