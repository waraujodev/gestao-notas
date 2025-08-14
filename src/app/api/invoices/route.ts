import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { InvoicesResponse, PaymentStatus } from '@/types/invoice'

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
    const supplier_id = searchParams.get('supplier_id')
    const status = searchParams.get('status') as PaymentStatus | null
    const due_date_from = searchParams.get('due_date_from')
    const due_date_to = searchParams.get('due_date_to')
    const created_from = searchParams.get('created_from')
    const created_to = searchParams.get('created_to')

    const offset = (page - 1) * per_page

    // Base query com joins
    let query = supabase
      .from('invoices')
      .select(`
        id,
        user_id,
        supplier_id,
        series,
        number,
        due_date,
        total_amount_cents,
        pdf_path,
        pdf_size_bytes,
        created_at,
        updated_at,
        suppliers!inner (
          id,
          name,
          document
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)

    // Apply filters
    if (search) {
      query = query.or(`series.ilike.%${search}%,number.ilike.%${search}%,suppliers.name.ilike.%${search}%`)
    }

    if (supplier_id) {
      query = query.eq('supplier_id', supplier_id)
    }

    if (due_date_from) {
      query = query.gte('due_date', due_date_from)
    }

    if (due_date_to) {
      query = query.lte('due_date', due_date_to)
    }

    if (created_from) {
      query = query.gte('created_at', created_from + 'T00:00:00.000Z')
    }

    if (created_to) {
      query = query.lte('created_at', created_to + 'T23:59:59.999Z')
    }

    // Execute query with pagination
    const { data: invoices, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1)

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      )
    }

    // Para cada invoice, calcular os totais de pagamento e status
    const invoiceIds = invoices?.map(inv => inv.id) || []
    
    let paymentsData: { invoice_id: string; total_paid_cents: number }[] = []
    
    if (invoiceIds.length > 0) {
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('invoice_id, amount_cents')
        .in('invoice_id', invoiceIds)
        .eq('user_id', user.id)

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError)
      } else {
        // Agrupar pagamentos por invoice_id
        const paymentsByInvoice = payments?.reduce((acc, payment) => {
          const invoiceId = payment.invoice_id
          if (!acc[invoiceId]) {
            acc[invoiceId] = 0
          }
          acc[invoiceId] += payment.amount_cents
          return acc
        }, {} as Record<string, number>) || {}

        paymentsData = Object.entries(paymentsByInvoice).map(([invoice_id, total_paid_cents]) => ({
          invoice_id,
          total_paid_cents
        }))
      }
    }

    // Enriquecer dados dos invoices com informações de pagamento
    const enrichedInvoices = invoices?.map(invoice => {
      const paymentData = paymentsData.find(p => p.invoice_id === invoice.id)
      const paid_amount_cents = paymentData?.total_paid_cents || 0
      const remaining_amount_cents = invoice.total_amount_cents - paid_amount_cents
      const is_overdue = new Date(invoice.due_date) < new Date() && remaining_amount_cents > 0

      let payment_status: PaymentStatus
      if (paid_amount_cents === 0 && is_overdue) {
        payment_status = 'Atrasado'
      } else if (paid_amount_cents === 0) {
        payment_status = 'Pendente'
      } else if (paid_amount_cents >= invoice.total_amount_cents) {
        payment_status = 'Pago'
      } else {
        payment_status = 'Pago Parcial'
      }

      return {
        ...invoice,
        supplier: (invoice as any).suppliers,  // Ajustar nome do relacionamento
        paid_amount_cents,
        remaining_amount_cents,
        payment_status,
        is_overdue
      }
    }) || []

    // Apply status filter after calculation
    let filteredInvoices = enrichedInvoices
    if (status && status as string !== 'all') {
      filteredInvoices = enrichedInvoices.filter(inv => inv.payment_status === status)
    }

    const total_pages = Math.ceil((count || 0) / per_page)

    const response: InvoicesResponse = {
      data: filteredInvoices,
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
    
    const supplier_id = formData.get('supplier_id') as string
    const series = formData.get('series') as string
    const number = formData.get('number') as string
    const due_date = formData.get('due_date') as string
    const total_amount_cents = parseInt(formData.get('total_amount_cents') as string)
    const pdf_file = formData.get('pdf_file') as File

    // Validações básicas
    if (!supplier_id || !series || !number || !due_date || !total_amount_cents || !pdf_file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar se o fornecedor pertence ao usuário
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', supplier_id)
      .eq('user_id', user.id)
      .single()

    if (supplierError || !supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 400 }
      )
    }

    // Verificar se já existe nota com mesma série/número para o fornecedor
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('user_id', user.id)
      .eq('supplier_id', supplier_id)
      .eq('series', series)
      .eq('number', number)
      .single()

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice with same series/number already exists for this supplier' },
        { status: 400 }
      )
    }

    // Upload do arquivo PDF
    const fileExtension = pdf_file.name.split('.').pop()
    const fileName = `${user.id}/invoices/${Date.now()}-${series}-${number}.${fileExtension}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, pdf_file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload PDF file' },
        { status: 500 }
      )
    }

    // Criar registro da nota fiscal
    const { data: invoice, error: insertError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        supplier_id,
        series,
        number,
        due_date,
        total_amount_cents,
        pdf_path: uploadData.path,
        pdf_size_bytes: pdf_file.size
      })
      .select(`
        id,
        user_id,
        supplier_id,
        series,
        number,
        due_date,
        total_amount_cents,
        pdf_path,
        pdf_size_bytes,
        created_at,
        updated_at,
        suppliers!inner (
          id,
          name,
          document
        )
      `)
      .single()

    if (insertError) {
      // Cleanup: remover arquivo se falhou ao criar registro
      await supabase.storage
        .from('invoices')
        .remove([uploadData.path])

      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      )
    }

    // Adicionar campos calculados
    const enrichedInvoice = {
      ...invoice,
      supplier: (invoice as any).suppliers,  // Ajustar nome do relacionamento
      paid_amount_cents: 0,
      remaining_amount_cents: invoice.total_amount_cents,
      payment_status: 'Pendente' as PaymentStatus,
      is_overdue: false
    }

    return NextResponse.json(enrichedInvoice, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}