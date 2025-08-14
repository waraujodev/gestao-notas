export interface Supplier {
  id: string
  user_id: string
  name: string
  document?: string
  email?: string
  phone?: string
  status: boolean
  created_at: string
  updated_at: string
}

export interface CreateSupplierData {
  name: string
  document?: string
  email?: string
  phone?: string
  status?: boolean
}

export interface UpdateSupplierData extends CreateSupplierData {}

export interface SuppliersResponse {
  suppliers: Supplier[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SupplierFilters {
  search?: string
  status?: boolean | null
  page?: number
  limit?: number
}