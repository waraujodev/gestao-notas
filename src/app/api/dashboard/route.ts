import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DashboardMetrics } from '@/hooks/useDashboard'

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

    // Parse query parameters for filters
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'all'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Buscar todas as notas do usuário com pagamentos
    let invoicesQuery = supabase
      .from('invoices')
      .select(`
        id,
        series,
        number,
        due_date,
        total_amount_cents,
        created_at,
        suppliers!inner (
          id,
          name
        )
      `)
      .eq('user_id', user.id)

    // Aplicar filtros de período
    if (period !== 'all') {
      const now = new Date()
      let filterDate: Date

      switch (period) {
        case 'week':
          filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          filterDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        case 'quarter':
          filterDate = new Date(now.setMonth(now.getMonth() - 3))
          break
        case 'year':
          filterDate = new Date(now.setFullYear(now.getFullYear() - 1))
          break
        default:
          filterDate = new Date(0) // Não filtrar se período não reconhecido
      }

      invoicesQuery = invoicesQuery.gte('created_at', filterDate.toISOString())
    }

    // Aplicar filtros customizados
    if (startDate) {
      invoicesQuery = invoicesQuery.gte('created_at', startDate + 'T00:00:00.000Z')
    }
    if (endDate) {
      invoicesQuery = invoicesQuery.lte('created_at', endDate + 'T23:59:59.999Z')
    }

    const { data: invoices, error: invoicesError } = await invoicesQuery
      .order('created_at', { ascending: false })

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError)
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      )
    }

    // Buscar todos os pagamentos das notas encontradas
    const invoiceIds = invoices?.map(inv => inv.id) || []
    let paymentsData: { invoice_id: string; total_paid_cents: number; payment_dates: string[] }[] = []

    if (invoiceIds.length > 0) {
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('invoice_id, amount_cents, payment_date')
        .in('invoice_id', invoiceIds)
        .eq('user_id', user.id)

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError)
      } else {
        // Agrupar pagamentos por invoice_id
        const paymentsByInvoice = payments?.reduce((acc, payment) => {
          const invoiceId = payment.invoice_id
          if (!acc[invoiceId]) {
            acc[invoiceId] = { total: 0, dates: [] }
          }
          acc[invoiceId].total += payment.amount_cents
          acc[invoiceId].dates.push(payment.payment_date)
          return acc
        }, {} as Record<string, { total: number; dates: string[] }>) || {}

        paymentsData = Object.entries(paymentsByInvoice).map(([invoice_id, data]) => ({
          invoice_id,
          total_paid_cents: data.total,
          payment_dates: data.dates
        }))
      }
    }

    // Calcular métricas
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    let totalInvoices = 0
    let totalAmountCents = 0
    let paidAmountCents = 0
    let pendingAmountCents = 0
    let overdueAmountCents = 0
    let pendingInvoices = 0
    let overdueInvoices = 0
    let paidInvoices = 0
    let partialPaidInvoices = 0
    let dueThisWeek = 0
    let dueNextWeek = 0
    let paymentDays: number[] = []

    const enrichedInvoices = invoices?.map(invoice => {
      const paymentData = paymentsData.find(p => p.invoice_id === invoice.id)
      const paidCents = paymentData?.total_paid_cents || 0
      const remainingCents = invoice.total_amount_cents - paidCents
      const dueDate = new Date(invoice.due_date)
      const isOverdue = dueDate < now && remainingCents > 0

      // Calcular tempo médio para pagamento (apenas notas pagas)
      if (paidCents >= invoice.total_amount_cents && paymentData?.payment_dates.length) {
        const firstPaymentDate = new Date(Math.min(...paymentData.payment_dates.map(d => new Date(d).getTime())))
        const invoiceCreated = new Date(invoice.created_at)
        const daysToPay = Math.ceil((firstPaymentDate.getTime() - invoiceCreated.getTime()) / (1000 * 60 * 60 * 24))
        if (daysToPay > 0) {
          paymentDays.push(daysToPay)
        }
      }

      // Contadores gerais
      totalInvoices++
      totalAmountCents += invoice.total_amount_cents

      // Status da nota
      if (paidCents === 0 && isOverdue) {
        overdueInvoices++
        overdueAmountCents += remainingCents
      } else if (paidCents === 0) {
        pendingInvoices++
        pendingAmountCents += remainingCents
      } else if (paidCents >= invoice.total_amount_cents) {
        paidInvoices++
        paidAmountCents += invoice.total_amount_cents
      } else {
        partialPaidInvoices++
        paidAmountCents += paidCents
        pendingAmountCents += remainingCents
      }

      // Vencimentos próximos (apenas notas não pagas completamente)
      if (remainingCents > 0) {
        if (dueDate >= now && dueDate <= oneWeekFromNow) {
          dueThisWeek++
        } else if (dueDate > oneWeekFromNow && dueDate <= twoWeeksFromNow) {
          dueNextWeek++
        }
      }

      return {
        ...invoice,
        supplier: (invoice as any).suppliers,
        paid_amount_cents: paidCents,
        remaining_amount_cents: remainingCents,
        payment_status: paidCents === 0 && isOverdue ? 'Atrasado' :
                       paidCents === 0 ? 'Pendente' :
                       paidCents >= invoice.total_amount_cents ? 'Pago' : 'Pago Parcial',
        is_overdue: isOverdue
      }
    }) || []

    const averageDaysToPayment = paymentDays.length > 0 
      ? Math.round(paymentDays.reduce((sum, days) => sum + days, 0) / paymentDays.length)
      : 0

    const metrics: DashboardMetrics = {
      total_invoices: totalInvoices,
      total_amount_cents: totalAmountCents,
      paid_amount_cents: paidAmountCents,
      pending_amount_cents: pendingAmountCents,
      overdue_amount_cents: overdueAmountCents,
      pending_invoices: pendingInvoices,
      overdue_invoices: overdueInvoices,
      paid_invoices: paidInvoices,
      partial_paid_invoices: partialPaidInvoices,
      average_days_to_payment: averageDaysToPayment,
      due_this_week: dueThisWeek,
      due_next_week: dueNextWeek
    }

    // Próximas notas a vencer (próximas 5)
    const upcomingInvoices = enrichedInvoices
      .filter(invoice => invoice.remaining_amount_cents > 0)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5)

    return NextResponse.json({
      metrics,
      upcoming_invoices: upcomingInvoices
    })

  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}