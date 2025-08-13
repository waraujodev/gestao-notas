import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login - Gestão de Notas Fiscais',
  description: 'Entre na sua conta para acessar o sistema de gestão de notas fiscais',
}

export default function LoginPage() {
  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Sistema de Gestão de Notas Fiscais
          </h1>
          <p className='text-sm text-muted-foreground'>
            Gerencie suas notas fiscais de forma simples e eficiente
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}