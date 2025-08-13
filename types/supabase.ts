export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        Relationships: []
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
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
          receipt_type: string | null
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
          receipt_type?: string | null
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
          receipt_type?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}