export interface Invoice {
  id: string
  user_id: string
  supplier_id: string
  series: string
  number: string
  due_date: string // ISO date string
  total_amount_cents: number
  pdf_path: string
  pdf_size_bytes: number | null
  created_at: string
  updated_at: string
  
  // Relacionamentos
  supplier?: {
    id: string
    name: string
    document: string
  }
}

export interface InvoiceSummary extends Invoice {
  paid_amount_cents: number
  remaining_amount_cents: number
  payment_status: PaymentStatus
  is_overdue: boolean
}

export type PaymentStatus = 'Pendente' | 'Pago Parcial' | 'Pago' | 'Atrasado'

// Types para formulários
export interface InvoiceFormData {
  supplier_id: string
  series: string
  number: string
  due_date: string
  total_amount: string // String no formulário, convertido para centavos
  pdf_file: File
  notes?: string
}

// Tipo processado pelo Zod (valores já transformados)
export interface InvoiceProcessedData {
  supplier_id: string
  series: string
  number: string
  due_date: string
  total_amount: number // Já convertido para centavos
  pdf_file: File
  notes?: string
}

export interface InvoiceFilters {
  search?: string
  supplier_id?: string
  status?: PaymentStatus | 'all'
  due_date_from?: string
  due_date_to?: string
  created_from?: string
  created_to?: string
}

export interface InvoicesResponse {
  data: InvoiceSummary[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

export interface CreateInvoiceData {
  supplier_id: string
  series: string
  number: string
  due_date: string
  total_amount_cents: number
  pdf_file: File
}

export interface UpdateInvoiceData extends Partial<Omit<CreateInvoiceData, 'pdf_file'>> {
  id: string
  pdf_file?: File
  notes?: string
}