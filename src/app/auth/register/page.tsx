import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Criar Conta - Gestão de Notas Fiscais',
  description: 'Crie sua conta para acessar o sistema de gestão de notas fiscais',
}

export default function RegisterPage() {
  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Sistema de Gestão de Notas Fiscais
          </h1>
          <p className='text-sm text-muted-foreground'>
            Crie sua conta e comece a organizar suas notas fiscais
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}