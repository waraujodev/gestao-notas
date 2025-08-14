import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { InvoicesTable } from '@/components/invoices/InvoicesTable'

export const metadata: Metadata = {
  title: 'Notas Fiscais - Gestão de Notas Fiscais',
  description: 'Gerencie suas notas fiscais e acompanhe pagamentos',
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

        <InvoicesTable />
      </div>
    </DashboardLayout>
  )
}