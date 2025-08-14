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

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !supplier) {
      return NextResponse.json({ error: 'Fornecedor não encontrado' }, { status: 404 })
    }

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error)
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
    const validatedData = supplierSchema.parse(body)

    // Verificar se o fornecedor existe e pertence ao usuário
    const { data: existing } = await supabase
      .from('suppliers')
      .select('id, name, document')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Fornecedor não encontrado' }, { status: 404 })
    }

    // Verificar duplicatas de nome (exceto o próprio)
    if (validatedData.name !== existing.name) {
      const { data: duplicateName } = await supabase
        .from('suppliers')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', validatedData.name)
        .neq('id', params.id)
        .single()

      if (duplicateName) {
        return NextResponse.json(
          { error: 'Já existe um fornecedor com este nome' },
          { status: 409 }
        )
      }
    }

    // Verificar duplicatas de documento (exceto o próprio)
    if (validatedData.document && validatedData.document !== existing.document) {
      const { data: duplicateDoc } = await supabase
        .from('suppliers')
        .select('id')
        .eq('user_id', user.id)
        .eq('document', validatedData.document)
        .neq('id', params.id)
        .single()

      if (duplicateDoc) {
        return NextResponse.json(
          { error: 'Já existe um fornecedor com este documento' },
          { status: 409 }
        )
      }
    }

    // Atualizar fornecedor
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update(validatedData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar fornecedor:', error)
      return NextResponse.json({ error: 'Erro ao atualizar fornecedor' }, { status: 500 })
    }

    return NextResponse.json(supplier)
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

    // Verificar se existe notas fiscais associadas
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id')
      .eq('supplier_id', params.id)
      .eq('user_id', user.id)
      .limit(1)

    if (invoices && invoices.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir fornecedor com notas fiscais associadas' },
        { status: 409 }
      )
    }

    // Exclusão lógica (alterar status para false)
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update({ status: false })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !supplier) {
      return NextResponse.json({ error: 'Fornecedor não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Fornecedor desativado com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}