import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PaymentStatus } from '@/types/invoice'

interface Context {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Buscar invoice
    const { data: invoice, error } = await supabase
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
        supplier:suppliers (
          id,
          name,
          document
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Buscar pagamentos
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount_cents')
      .eq('invoice_id', id)
      .eq('user_id', user.id)

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
    }

    // Calcular totais
    const paid_amount_cents = payments?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0
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

    const enrichedInvoice = {
      ...invoice,
      paid_amount_cents,
      remaining_amount_cents,
      payment_status,
      is_overdue
    }

    return NextResponse.json(enrichedInvoice)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar se o invoice existe e pertence ao usuário
    const { data: existingInvoice, error: findError } = await supabase
      .from('invoices')
      .select('id, pdf_path, supplier_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (findError || !existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    
    const supplier_id = formData.get('supplier_id') as string || existingInvoice.supplier_id
    const series = formData.get('series') as string
    const number = formData.get('number') as string
    const due_date = formData.get('due_date') as string
    const total_amount_cents = formData.get('total_amount_cents') ? 
      parseInt(formData.get('total_amount_cents') as string) : undefined
    const pdf_file = formData.get('pdf_file') as File | null

    // Preparar dados de atualização
    const updateData: any = {}
    
    if (supplier_id !== existingInvoice.supplier_id) {
      // Verificar se o novo fornecedor pertence ao usuário
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
      updateData.supplier_id = supplier_id
    }

    if (series) updateData.series = series
    if (number) updateData.number = number
    if (due_date) updateData.due_date = due_date
    if (total_amount_cents !== undefined) updateData.total_amount_cents = total_amount_cents

    // Verificar duplicatas se série/número ou fornecedor mudaram
    if ((series || number || supplier_id !== existingInvoice.supplier_id)) {
      const checkSeries = series || (await supabase
        .from('invoices')
        .select('series')
        .eq('id', id)
        .single()).data?.series

      const checkNumber = number || (await supabase
        .from('invoices')
        .select('number')
        .eq('id', id)
        .single()).data?.number

      const { data: duplicateInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('user_id', user.id)
        .eq('supplier_id', supplier_id)
        .eq('series', checkSeries)
        .eq('number', checkNumber)
        .neq('id', id)
        .single()

      if (duplicateInvoice) {
        return NextResponse.json(
          { error: 'Invoice with same series/number already exists for this supplier' },
          { status: 400 }
        )
      }
    }

    // Upload novo arquivo PDF se fornecido
    let newPdfPath = existingInvoice.pdf_path
    if (pdf_file) {
      const fileExtension = pdf_file.name.split('.').pop()
      const fileName = `${user.id}/invoices/${Date.now()}-${series || 'update'}-${number || Date.now()}.${fileExtension}`
      
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

      // Remover arquivo antigo após upload bem-sucedido
      await supabase.storage
        .from('invoices')
        .remove([existingInvoice.pdf_path])

      updateData.pdf_path = uploadData.path
      updateData.pdf_size_bytes = pdf_file.size
    }

    // Atualizar invoice
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
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
        supplier:suppliers (
          id,
          name,
          document
        )
      `)
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      
      // Cleanup: remover novo arquivo se falhou ao atualizar
      if (pdf_file && updateData.pdf_path) {
        await supabase.storage
          .from('invoices')
          .remove([updateData.pdf_path])
      }

      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      )
    }

    // Buscar pagamentos para calcular status
    const { data: payments } = await supabase
      .from('payments')
      .select('amount_cents')
      .eq('invoice_id', id)
      .eq('user_id', user.id)

    const paid_amount_cents = payments?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0
    const remaining_amount_cents = updatedInvoice.total_amount_cents - paid_amount_cents
    const is_overdue = new Date(updatedInvoice.due_date) < new Date() && remaining_amount_cents > 0

    let payment_status: PaymentStatus
    if (paid_amount_cents === 0 && is_overdue) {
      payment_status = 'Atrasado'
    } else if (paid_amount_cents === 0) {
      payment_status = 'Pendente'
    } else if (paid_amount_cents >= updatedInvoice.total_amount_cents) {
      payment_status = 'Pago'
    } else {
      payment_status = 'Pago Parcial'
    }

    const enrichedInvoice = {
      ...updatedInvoice,
      paid_amount_cents,
      remaining_amount_cents,
      payment_status,
      is_overdue
    }

    return NextResponse.json(enrichedInvoice)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Buscar invoice para obter o pdf_path
    const { data: invoice, error: findError } = await supabase
      .from('invoices')
      .select('id, pdf_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (findError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Verificar se existem pagamentos associados
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id')
      .eq('invoice_id', id)
      .eq('user_id', user.id)
      .limit(1)

    if (paymentsError) {
      console.error('Error checking payments:', paymentsError)
      return NextResponse.json(
        { error: 'Failed to check payments' },
        { status: 500 }
      )
    }

    if (payments && payments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete invoice with associated payments' },
        { status: 400 }
      )
    }

    // Deletar invoice (isso também deletará pagamentos por CASCADE)
    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete invoice' },
        { status: 500 }
      )
    }

    // Remover arquivo PDF do storage
    const { error: storageError } = await supabase.storage
      .from('invoices')
      .remove([invoice.pdf_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Não retornar erro pois o registro já foi deletado
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}