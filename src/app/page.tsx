import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const supabase = createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Se usuário está logado, redirecionar para dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[600px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-4xl font-bold tracking-tight'>
            Sistema de Gestão de Notas Fiscais
          </h1>
          <p className='text-xl text-muted-foreground'>
            Gerencie suas notas fiscais de forma simples e eficiente
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <h3 className='text-lg font-semibold mb-2'>Características</h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>✓ Cadastro de fornecedores com validação CNPJ/CPF</li>
              <li>✓ Upload e visualização de PDFs</li>
              <li>✓ Controle de pagamentos múltiplos</li>
              <li>✓ Dashboard com métricas em tempo real</li>
              <li>✓ Relatórios e filtros avançados</li>
            </ul>
          </div>

          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <h3 className='text-lg font-semibold mb-2'>Segurança</h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>✓ Dados isolados por usuário</li>
              <li>✓ Autenticação segura com Supabase</li>
              <li>✓ Upload seguro de documentos</li>
              <li>✓ Backup automático</li>
              <li>✓ Conformidade com LGPD</li>
            </ul>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button asChild size='lg'>
            <Link href='/auth/register'>Criar Conta Gratuita</Link>
          </Button>
          <Button variant='outline' size='lg' asChild>
            <Link href='/auth/login'>Fazer Login</Link>
          </Button>
        </div>

        <div className='text-center text-sm text-muted-foreground'>
          <p>
            Comece agora mesmo a organizar suas notas fiscais
          </p>
        </div>
      </div>
    </div>
  )
}
