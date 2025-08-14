import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de forma de pagamento
const paymentMethodSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  description: z.string().optional(),
  status: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', params.id)
      .or(`user_id.is.null,user_id.eq.${user.id}`) // Permitir métodos do sistema ou do usuário
      .single()

    if (error || !paymentMethod) {
      return NextResponse.json({ error: 'Forma de pagamento não encontrada' }, { status: 404 })
    }

    return NextResponse.json(paymentMethod)
  } catch (error) {
    console.error('Erro ao buscar forma de pagamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Validar dados
    const body = await request.json()
    const validatedData = paymentMethodSchema.parse(body)

    // Verificar se a forma de pagamento existe e pertence ao usuário
    const { data: existing } = await supabase
      .from('payment_methods')
      .select('id, name, user_id, is_system_default')
      .eq('id', params.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Forma de pagamento não encontrada' }, { status: 404 })
    }

    // Não permitir editar métodos do sistema
    if (existing.is_system_default || existing.user_id === null) {
      return NextResponse.json(
        { error: 'Não é possível editar formas de pagamento do sistema' },
        { status: 403 }
      )
    }

    // Verificar se pertence ao usuário
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar duplicatas de nome (exceto o próprio)
    if (validatedData.name !== existing.name) {
      const { data: duplicateName } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', validatedData.name)
        .neq('id', params.id)
        .single()

      if (duplicateName) {
        return NextResponse.json(
          { error: 'Já existe uma forma de pagamento com este nome' },
          { status: 409 }
        )
      }
    }

    // Atualizar forma de pagamento
    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .update(validatedData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar forma de pagamento:', error)
      return NextResponse.json({ error: 'Erro ao atualizar forma de pagamento' }, { status: 500 })
    }

    return NextResponse.json(paymentMethod)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro na API de formas de pagamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se a forma de pagamento existe e pertence ao usuário
    const { data: existing } = await supabase
      .from('payment_methods')
      .select('id, user_id, is_system_default')
      .eq('id', params.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Forma de pagamento não encontrada' }, { status: 404 })
    }

    // Não permitir excluir métodos do sistema
    if (existing.is_system_default || existing.user_id === null) {
      return NextResponse.json(
        { error: 'Não é possível excluir formas de pagamento do sistema' },
        { status: 403 }
      )
    }

    // Verificar se pertence ao usuário
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se existe pagamentos associados
    const { data: payments } = await supabase
      .from('payments')
      .select('id')
      .eq('payment_method_id', params.id)
      .eq('user_id', user.id)
      .limit(1)

    if (payments && payments.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir forma de pagamento com pagamentos associados' },
        { status: 409 }
      )
    }

    // Exclusão lógica (alterar status para false)
    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .update({ status: false })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !paymentMethod) {
      return NextResponse.json({ error: 'Forma de pagamento não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Forma de pagamento desativada com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir forma de pagamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}