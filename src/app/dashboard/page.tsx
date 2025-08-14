import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard - Gestão de Notas Fiscais',
  description: 'Painel principal do sistema de gestão de notas fiscais',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className='container mx-auto py-8'>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Bem-vindo ao sistema de gestão de notas fiscais
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <h3 className='tracking-tight text-sm font-medium'>
                Total de Notas
              </h3>
            </div>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>
              Notas fiscais cadastradas
            </p>
          </div>

          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <h3 className='tracking-tight text-sm font-medium'>Pendentes</h3>
            </div>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>
              Notas pendentes de pagamento
            </p>
          </div>

          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <h3 className='tracking-tight text-sm font-medium'>Em Atraso</h3>
            </div>
            <div className='text-2xl font-bold text-red-600'>0</div>
            <p className='text-xs text-muted-foreground'>
              Notas com vencimento atrasado
            </p>
          </div>

          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <h3 className='tracking-tight text-sm font-medium'>
                Total Pago
              </h3>
            </div>
            <div className='text-2xl font-bold text-green-600'>R$ 0,00</div>
            <p className='text-xs text-muted-foreground'>
              Valor total pago este mês
            </p>
          </div>
        </div>

        <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
          <h3 className='text-lg font-semibold mb-4'>Informações da Conta</h3>
          <p className='text-sm text-muted-foreground mb-2'>
            <strong>Email:</strong> {user.email}
          </p>
          <p className='text-sm text-muted-foreground'>
            <strong>ID do Usuário:</strong> {user.id}
          </p>
        </div>

        <div className='text-center text-muted-foreground'>
          <p>
            Este é um dashboard básico. As funcionalidades completas serão
            implementadas nas próximas fases.
          </p>
        </div>
      </div>
    </div>
  )
}