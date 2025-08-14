import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de fornecedor
const supplierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  document: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.boolean().default(true),
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Query base
    let query = supabase
      .from('suppliers')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,document.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (status !== null && status !== '') {
      query = query.eq('status', status === 'true')
    }

    // Paginação
    query = query.range(offset, offset + limit - 1)

    const { data: suppliers, error, count } = await query

    if (error) {
      console.error('Erro ao buscar fornecedores:', error)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    return NextResponse.json({
      suppliers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro na API de fornecedores:', error)
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
    const validatedData = supplierSchema.parse(body)

    // Verificar duplicatas (nome único por usuário)
    const { data: existing } = await supabase
      .from('suppliers')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', validatedData.name)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um fornecedor com este nome' },
        { status: 409 }
      )
    }

    // Verificar duplicata de documento se fornecido
    if (validatedData.document) {
      const { data: existingDoc } = await supabase
        .from('suppliers')
        .select('id')
        .eq('user_id', user.id)
        .eq('document', validatedData.document)
        .single()

      if (existingDoc) {
        return NextResponse.json(
          { error: 'Já existe um fornecedor com este documento' },
          { status: 409 }
        )
      }
    }

    // Criar fornecedor
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar fornecedor:', error)
      return NextResponse.json({ error: 'Erro ao criar fornecedor' }, { status: 500 })
    }

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro na API de fornecedores:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}