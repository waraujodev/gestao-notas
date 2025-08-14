import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { UploadDemo } from '@/components/upload/UploadDemo'

export const metadata: Metadata = {
  title: 'Upload Demo - Gestão de Notas Fiscais',
  description: 'Demonstração do sistema de upload de arquivos',
}

export default async function UploadDemoPage() {
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
          <h2 className='text-2xl font-bold tracking-tight'>Upload de Arquivos</h2>
          <p className='text-muted-foreground'>
            Demonstração do sistema de upload com drag-and-drop e preview
          </p>
        </div>

        <UploadDemo />
      </div>
    </DashboardLayout>
  )
}