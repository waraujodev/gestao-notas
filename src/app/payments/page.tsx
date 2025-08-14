import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PaymentsClient } from '@/components/payments/PaymentsClient'

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
            Gerencie pagamentos de notas fiscais e acompanhe o fluxo de caixa
          </p>
        </div>

        <PaymentsClient />
      </div>
    </DashboardLayout>
  )
}