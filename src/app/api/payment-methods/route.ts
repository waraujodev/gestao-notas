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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Parâmetros de busca
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Query base - incluir métodos do sistema e do usuário
    let query = supabase
      .from('payment_methods')
      .select('*', { count: 'exact' })
      .order('is_system_default', { ascending: false })
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    // Filtrar por tipo
    if (type === 'system') {
      query = query.is('user_id', null)
    } else if (type === 'custom') {
      query = query.eq('user_id', user.id)
    } else {
      // Mostrar métodos do sistema E métodos do usuário
      query = query.or(`user_id.is.null,user_id.eq.${user.id}`)
    }

    // Filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (status !== null && status !== '') {
      query = query.eq('status', status === 'true')
    }

    // Paginação
    query = query.range(offset, offset + limit - 1)

    const { data: paymentMethods, error, count } = await query

    if (error) {
      console.error('Erro ao buscar formas de pagamento:', error)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    return NextResponse.json({
      paymentMethods,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro na API de formas de pagamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    // Verificar duplicatas (nome único por usuário)
    const { data: existing } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', validatedData.name)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma forma de pagamento com este nome' },
        { status: 409 }
      )
    }

    // Criar forma de pagamento
    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .insert({
        ...validatedData,
        user_id: user.id,
        is_system_default: false, // Sempre false para métodos criados por usuários
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar forma de pagamento:', error)
      return NextResponse.json({ error: 'Erro ao criar forma de pagamento' }, { status: 500 })
    }

    return NextResponse.json(paymentMethod, { status: 201 })
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