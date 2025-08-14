import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PaymentMethodsTable } from '@/components/payment-methods/PaymentMethodsTable'

export const metadata: Metadata = {
  title: 'Formas de Pagamento - Gestão de Notas Fiscais',
  description: 'Gerencie as formas de pagamento',
}

export default async function PaymentMethodsPage() {
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
          <h2 className='text-2xl font-bold tracking-tight'>Formas de Pagamento</h2>
          <p className='text-muted-foreground'>
            Gerencie as formas de pagamento disponíveis no sistema
          </p>
        </div>

        <PaymentMethodsTable />
      </div>
    </DashboardLayout>
  )
}