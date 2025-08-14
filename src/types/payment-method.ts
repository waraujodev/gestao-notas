export interface PaymentMethod {
  id: string
  user_id: string | null // NULL para métodos do sistema
  name: string
  description?: string
  status: boolean
  is_system_default: boolean
  display_order: number
  created_at: string
}

export interface CreatePaymentMethodData {
  name: string
  description?: string
  status?: boolean
  display_order?: number
}

export interface UpdatePaymentMethodData extends CreatePaymentMethodData {}

export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaymentMethodFilters {
  search?: string
  status?: boolean | null
  type?: 'all' | 'system' | 'custom'
  page?: number
  limit?: number
}