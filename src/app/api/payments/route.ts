import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getReceiptType } from '@/lib/validations/payment'
import type { PaymentsResponse } from '@/types/payment'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const per_page = Math.min(parseInt(searchParams.get('per_page') || '10'), 100)
    const search = searchParams.get('search')
    const invoice_id = searchParams.get('invoice_id')
    const payment_method_id = searchParams.get('payment_method_id')
    const payment_date_from = searchParams.get('payment_date_from')
    const payment_date_to = searchParams.get('payment_date_to')

    const offset = (page - 1) * per_page

    // Base query com joins
    let query = supabase
      .from('payments')
      .select(`
        id,
        user_id,
        invoice_id,
        payment_method_id,
        amount_cents,
        payment_date,
        receipt_path,
        receipt_size_bytes,
        receipt_type,
        notes,
        created_at,
        payment_method:payment_methods (
          id,
          name
        ),
        invoice:invoices (
          id,
          series,
          number,
          total_amount_cents,
          due_date,
          supplier:suppliers (
            id,
            name
          )
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)

    // Apply filters
    if (search) {
      // Buscar por série/número da nota ou nome da forma de pagamento
      query = query.or(`invoices.series.ilike.%${search}%,invoices.number.ilike.%${search}%,payment_methods.name.ilike.%${search}%`)
    }

    if (invoice_id) {
      query = query.eq('invoice_id', invoice_id)
    }

    if (payment_method_id) {
      query = query.eq('payment_method_id', payment_method_id)
    }

    if (payment_date_from) {
      query = query.gte('payment_date', payment_date_from)
    }

    if (payment_date_to) {
      query = query.lte('payment_date', payment_date_to)
    }

    // Execute query with pagination
    const { data: payments, error, count } = await query
      .order('payment_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1)

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    const total_pages = Math.ceil((count || 0) / per_page)

    const response: PaymentsResponse = {
      data: payments || [],
      count: count || 0,
      page,
      per_page,
      total_pages
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    
    const invoice_id = formData.get('invoice_id') as string
    const payment_method_id = formData.get('payment_method_id') as string
    const amount_cents = parseInt(formData.get('amount_cents') as string)
    const payment_date = formData.get('payment_date') as string
    const receipt_file = formData.get('receipt_file') as File
    const notes = (formData.get('notes') as string) || null

    // Validações básicas
    if (!invoice_id || !payment_method_id || !amount_cents || !payment_date || !receipt_file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar se a nota fiscal pertence ao usuário
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, total_amount_cents')
      .eq('id', invoice_id)
      .eq('user_id', user.id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 400 }
      )
    }

    // Verificar se a forma de pagamento é válida
    const { data: paymentMethod, error: methodError } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('id', payment_method_id)
      .or(`user_id.eq.${user.id},user_id.is.null`) // Método do usuário ou do sistema
      .single()

    if (methodError || !paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 400 }
      )
    }

    // Verificar valor total já pago para esta nota
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('amount_cents')
      .eq('invoice_id', invoice_id)
      .eq('user_id', user.id)

    const totalPaid = existingPayments?.reduce((sum, p) => sum + p.amount_cents, 0) || 0
    const remaining = invoice.total_amount_cents - totalPaid

    if (amount_cents > remaining) {
      return NextResponse.json(
        { error: `Payment amount exceeds remaining balance: R$ ${(remaining / 100).toFixed(2)}` },
        { status: 400 }
      )
    }

    // Upload do arquivo de comprovante
    const fileExtension = receipt_file.name.split('.').pop()
    const fileName = `${user.id}/receipts/${Date.now()}-${invoice_id}-payment.${fileExtension}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, receipt_file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload receipt file' },
        { status: 500 }
      )
    }

    // Criar registro do pagamento
    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        invoice_id,
        payment_method_id,
        amount_cents,
        payment_date,
        receipt_path: uploadData.path,
        receipt_size_bytes: receipt_file.size,
        receipt_type: getReceiptType(receipt_file),
        notes
      })
      .select(`
        id,
        user_id,
        invoice_id,
        payment_method_id,
        amount_cents,
        payment_date,
        receipt_path,
        receipt_size_bytes,
        receipt_type,
        notes,
        created_at,
        payment_method:payment_methods (
          id,
          name
        ),
        invoice:invoices (
          id,
          series,
          number,
          total_amount_cents
        )
      `)
      .single()

    if (insertError) {
      // Cleanup: remover arquivo se falhou ao criar registro
      await supabase.storage
        .from('receipts')
        .remove([uploadData.path])

      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      )
    }

    return NextResponse.json(payment, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}