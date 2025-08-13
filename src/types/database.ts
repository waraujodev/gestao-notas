/**
 * Tipos do banco de dados - Sistema de Gestão de Notas Fiscais
 */

export interface Database {
  public: {
    Tables: {
      suppliers: {
        Row: {
          id: string
          user_id: string
          name: string
          document: string | null
          email: string | null
          phone: string | null
          status: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          document?: string | null
          email?: string | null
          phone?: string | null
          status?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          document?: string | null
          email?: string | null
          phone?: string | null
          status?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string | null
          status: boolean
          is_system_default: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description?: string | null
          status?: boolean
          is_system_default?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string | null
          status?: boolean
          is_system_default?: boolean
          display_order?: number
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          supplier_id: string
          series: string
          number: string
          due_date: string
          total_amount_cents: number
          pdf_path: string
          pdf_size_bytes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          supplier_id: string
          series: string
          number: string
          due_date: string
          total_amount_cents: number
          pdf_path: string
          pdf_size_bytes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          supplier_id?: string
          series?: string
          number?: string
          due_date?: string
          total_amount_cents?: number
          pdf_path?: string
          pdf_size_bytes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          invoice_id: string
          payment_method_id: string
          amount_cents: number
          payment_date: string
          receipt_path: string
          receipt_size_bytes: number | null
          receipt_type: 'pdf' | 'jpg' | 'png' | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          invoice_id: string
          payment_method_id: string
          amount_cents: number
          payment_date: string
          receipt_path: string
          receipt_size_bytes?: number | null
          receipt_type?: 'pdf' | 'jpg' | 'png' | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          invoice_id?: string
          payment_method_id?: string
          amount_cents?: number
          payment_date?: string
          receipt_path?: string
          receipt_size_bytes?: number | null
          receipt_type?: 'pdf' | 'jpg' | 'png' | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_invoice_summary: {
        Args: {
          p_invoice_id: string
          p_user_id: string
        }
        Returns: {
          invoice_id: string
          total_amount_cents: number
          paid_amount_cents: number
          remaining_amount_cents: number
          payment_status: string
          is_overdue: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Tipos auxiliares para facilitar o uso
export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert']
export type SupplierUpdate = Database['public']['Tables']['suppliers']['Update']

export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']
export type PaymentMethodInsert = Database['public']['Tables']['payment_methods']['Insert']
export type PaymentMethodUpdate = Database['public']['Tables']['payment_methods']['Update']

export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

// Tipos para função de cálculo de status
export type InvoiceSummary = Database['public']['Functions']['calculate_invoice_summary']['Returns'][0]

// Tipos estendidos com relacionamentos
export interface SupplierWithStats extends Supplier {
  invoice_count?: number
  total_amount_cents?: number
}

export interface InvoiceWithRelations extends Invoice {
  supplier?: Supplier
  payments?: Payment[]
  summary?: InvoiceSummary
}

export interface PaymentWithRelations extends Payment {
  invoice?: Invoice
  payment_method?: PaymentMethod
}

// Tipos para formulários (com valores em reais para UX)
export interface InvoiceFormData {
  series: string
  number: string
  due_date: string
  total_amount: number // Em reais para o formulário
  supplier_id: string
  pdf_file?: File
}

export interface PaymentFormData {
  amount: number // Em reais para o formulário
  payment_date: string
  payment_method_id: string
  notes?: string
  receipt_file?: File
}

// Tipos para status de pagamento
export type PaymentStatus = 'Pendente' | 'Pago Parcial' | 'Pago' | 'Atrasado'

// Tipos para filtros
export interface InvoiceFilters {
  supplier_id?: string
  status?: PaymentStatus
  due_date_from?: string
  due_date_to?: string
  search?: string
}

export interface SupplierFilters {
  status?: boolean
  search?: string
}

// Tipos para paginação
export interface PaginationParams {
  page: number
  limit: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Tipos para estatísticas do dashboard
export interface DashboardStats {
  total_invoices: number
  pending_invoices: number
  overdue_invoices: number
  paid_invoices: number
  total_amount_cents: number
  paid_amount_cents: number
  pending_amount_cents: number
  overdue_amount_cents: number
}

// Tipos para upload de arquivos
export interface FileUploadResult {
  path: string
  size: number
  type: string
  url?: string
}