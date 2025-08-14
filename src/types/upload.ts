export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  path: string
  bucket: string
  uploaded_at: string
}

export interface UploadProgress {
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
}

export interface FileUploadOptions {
  bucket: 'invoices' | 'receipts'
  maxSize?: number // em bytes
  allowedTypes?: string[]
  folder?: string
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export const UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    invoices: ['application/pdf'],
    receipts: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  },
  buckets: {
    invoices: 'invoices',
    receipts: 'receipts',
  },
} as const