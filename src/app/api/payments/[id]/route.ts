import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getReceiptType } from '@/lib/validations/payment'

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

    // Buscar pagamento
    const { data: payment, error } = await supabase
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
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(payment)

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

    // Verificar se o pagamento existe e pertence ao usuário
    const { data: existingPayment, error: findError } = await supabase
      .from('payments')
      .select('id, receipt_path, amount_cents, invoice_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (findError || !existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    
    const payment_method_id = formData.get('payment_method_id') as string
    const amount_cents = formData.get('amount_cents') ? 
      parseInt(formData.get('amount_cents') as string) : undefined
    const payment_date = formData.get('payment_date') as string
    const receipt_file = formData.get('receipt_file') as File | null
    const notes = formData.get('notes') as string | null

    // Preparar dados de atualização
    const updateData: any = {}
    
    if (payment_method_id) {
      // Verificar se a forma de pagamento é válida
      const { data: paymentMethod, error: methodError } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('id', payment_method_id)
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .single()

      if (methodError || !paymentMethod) {
        return NextResponse.json(
          { error: 'Payment method not found' },
          { status: 400 }
        )
      }
      updateData.payment_method_id = payment_method_id
    }

    if (payment_date) updateData.payment_date = payment_date
    if (notes !== null) updateData.notes = notes || null

    // Verificar novo valor se fornecido
    if (amount_cents !== undefined && amount_cents !== existingPayment.amount_cents) {
      // Buscar nota fiscal para validação
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('total_amount_cents')
        .eq('id', existingPayment.invoice_id)
        .single()

      if (invoiceError || !invoice) {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 400 }
        )
      }

      // Calcular total pago excluindo o pagamento atual
      const { data: otherPayments } = await supabase
        .from('payments')
        .select('amount_cents')
        .eq('invoice_id', existingPayment.invoice_id)
        .eq('user_id', user.id)
        .neq('id', id)

      const otherPaidTotal = otherPayments?.reduce((sum, p) => sum + p.amount_cents, 0) || 0
      const availableAmount = invoice.total_amount_cents - otherPaidTotal

      if (amount_cents > availableAmount) {
        return NextResponse.json(
          { error: `Payment amount exceeds available balance: R$ ${(availableAmount / 100).toFixed(2)}` },
          { status: 400 }
        )
      }

      updateData.amount_cents = amount_cents
    }

    // Upload novo arquivo se fornecido
    let newReceiptPath = existingPayment.receipt_path
    if (receipt_file) {
      const fileExtension = receipt_file.name.split('.').pop()
      const fileName = `${user.id}/receipts/${Date.now()}-${existingPayment.invoice_id}-payment-update.${fileExtension}`
      
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

      // Remover arquivo antigo após upload bem-sucedido
      await supabase.storage
        .from('receipts')
        .remove([existingPayment.receipt_path])

      updateData.receipt_path = uploadData.path
      updateData.receipt_size_bytes = receipt_file.size
      updateData.receipt_type = getReceiptType(receipt_file)
    }

    // Atualizar pagamento
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
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

    if (updateError) {
      console.error('Update error:', updateError)
      
      // Cleanup: remover novo arquivo se falhou ao atualizar
      if (receipt_file && updateData.receipt_path) {
        await supabase.storage
          .from('receipts')
          .remove([updateData.receipt_path])
      }

      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedPayment)

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

    // Buscar pagamento para obter o receipt_path
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('id, receipt_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (findError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Deletar pagamento
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete payment' },
        { status: 500 }
      )
    }

    // Remover arquivo de comprovante do storage
    const { error: storageError } = await supabase.storage
      .from('receipts')
      .remove([payment.receipt_path])

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