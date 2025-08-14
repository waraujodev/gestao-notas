export interface Payment {
  id: string
  user_id: string
  invoice_id: string
  payment_method_id: string
  amount_cents: number
  payment_date: string // ISO date string
  receipt_path: string
  receipt_size_bytes: number | null
  receipt_type: 'pdf' | 'jpg' | 'png'
  notes: string | null
  created_at: string
  
  // Relacionamentos
  payment_method?: {
    id: string
    name: string
  }
  invoice?: {
    id: string
    series: string
    number: string
    total_amount_cents: number
    due_date: string
    supplier_id: string
  }
}

export interface PaymentWithInvoice extends Payment {
  invoice: {
    id: string
    series: string
    number: string
    total_amount_cents: number
    due_date: string
    supplier_id: string
    supplier?: {
      id: string
      name: string
    }
  }
}

export interface PaymentFormData {
  payment_method_id: string
  amount: string // String no formulário (formato monetário)
  payment_date: string // YYYY-MM-DD format
  receipt_file: File
  notes?: string
}

export interface CreatePaymentData {
  invoice_id: string
  payment_method_id: string
  amount_cents: number
  payment_date: string
  receipt_file: File
  notes?: string
}

export interface UpdatePaymentData extends Partial<Omit<CreatePaymentData, 'receipt_file' | 'invoice_id'>> {
  id: string
  receipt_file?: File
}

export interface PaymentFilters {
  search?: string
  invoice_id?: string
  payment_method_id?: string
  payment_date_from?: string
  payment_date_to?: string
  created_from?: string
  created_to?: string
  min_amount_cents?: number
  max_amount_cents?: number
}

export interface PaymentsResponse {
  data: Payment[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

// Tipos para resumo de pagamentos de uma nota
export interface InvoicePaymentSummary {
  invoice_id: string
  total_amount_cents: number
  paid_amount_cents: number
  remaining_amount_cents: number
  payments_count: number
  last_payment_date: string | null
  payments: Payment[]
}

// Tipos para validações
export interface PaymentValidationContext {
  invoice_id: string
  invoice_total_cents: number
  current_paid_cents: number
  max_payment_cents: number // valor restante
}

export interface PaymentStats {
  total_payments: number
  total_amount_cents: number
  avg_payment_cents: number
  most_used_method: {
    id: string
    name: string
    count: number
  } | null
}