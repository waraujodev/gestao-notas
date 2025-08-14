import { z } from 'zod'
import { realToCents } from '@/lib/utils/currency'
import type { InvoiceFormData, InvoiceProcessedData } from '@/types/invoice'

// Schema para validação de valores monetários (em reais, convertido para centavos)
const moneySchema = z
  .string()
  .min(1, 'Valor obrigatório')
  .refine((val) => {
    const numValue = parseFloat(val.replace(/[R$\s.]/g, '').replace(',', '.'))
    return !isNaN(numValue) && numValue > 0
  }, 'Valor deve ser maior que zero')
  .refine((val) => {
    const numValue = parseFloat(val.replace(/[R$\s.]/g, '').replace(',', '.'))
    return numValue <= 999999999.99 // ~10 bilhões
  }, 'Valor muito alto')
  .transform((val) => {
    const numValue = parseFloat(val.replace(/[R$\s.]/g, '').replace(',', '.'))
    return realToCents(numValue)
  })

// Schema para data
const dateSchema = z
  .string()
  .min(1, 'Data obrigatória')
  .refine((date) => {
    const parsedDate = new Date(date + 'T00:00:00.000Z')
    return !isNaN(parsedDate.getTime())
  }, 'Data inválida')
  .refine((date) => {
    const parsedDate = new Date(date + 'T00:00:00.000Z')
    const minDate = new Date('2020-01-01')
    return parsedDate >= minDate
  }, 'Data muito antiga')
  .refine((date) => {
    const parsedDate = new Date(date + 'T00:00:00.000Z')
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 10)
    return parsedDate <= maxDate
  }, 'Data muito futura')

// Schema para arquivo PDF
const pdfFileSchema = z
  .instanceof(File, { message: 'Arquivo obrigatório' })
  .refine((file) => file.size > 0, 'Arquivo não pode estar vazio')
  .refine((file) => file.size <= 10 * 1024 * 1024, 'Arquivo deve ter no máximo 10MB')
  .refine(
    (file) => file.type === 'application/pdf',
    'Apenas arquivos PDF são permitidos'
  )

// Schema principal do formulário de nota fiscal
export const invoiceFormSchema = z.object({
  supplier_id: z
    .string()
    .min(1, 'Fornecedor obrigatório')
    .uuid('Fornecedor inválido'),

  series: z
    .string()
    .trim()
    .min(1, 'Série obrigatória')
    .max(20, 'Série deve ter no máximo 20 caracteres')
    .regex(/^[A-Za-z0-9\-]+$/, 'Série deve conter apenas letras, números e hífen'),

  number: z
    .string()
    .trim()
    .min(1, 'Número obrigatório')
    .max(20, 'Número deve ter no máximo 20 caracteres')
    .regex(/^[0-9]+$/, 'Número deve conter apenas dígitos'),

  due_date: dateSchema,

  total_amount: z.string().pipe(moneySchema),

  pdf_file: pdfFileSchema,

  // Campo opcional para observações
  notes: z
    .string()
    .trim()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
})

// Schema para edição (todos os campos opcionais exceto ID)
export const invoiceEditSchema = z.object({
  id: z.string().uuid('ID inválido'),
  
  supplier_id: z
    .string()
    .min(1, 'Fornecedor obrigatório')
    .uuid('Fornecedor inválido')
    .optional(),

  series: z
    .string()
    .trim()
    .min(1, 'Série obrigatória')
    .max(20, 'Série deve ter no máximo 20 caracteres')
    .regex(/^[A-Za-z0-9\-]+$/, 'Série deve conter apenas letras, números e hífen')
    .optional(),

  number: z
    .string()
    .trim()
    .min(1, 'Número obrigatório')
    .max(20, 'Número deve ter no máximo 20 caracteres')
    .regex(/^[0-9]+$/, 'Número deve conter apenas dígitos')
    .optional(),

  due_date: dateSchema.optional(),

  total_amount: z.string().pipe(moneySchema).optional(),

  pdf_file: pdfFileSchema.optional(),

  notes: z
    .string()
    .trim()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
})

// Tipos derivados dos schemas
export type InvoiceZodFormData = z.infer<typeof invoiceFormSchema>
export type InvoiceEditData = z.infer<typeof invoiceEditSchema>

// Schema para dados processados (enviados para a API)
export const invoiceApiSchema = invoiceFormSchema.transform((data) => ({
  supplier_id: data.supplier_id,
  series: data.series,
  number: data.number,
  due_date: data.due_date,
  total_amount_cents: data.total_amount, // já convertido para centavos
  pdf_file: data.pdf_file,
  notes: data.notes
}))

export type InvoiceApiData = z.infer<typeof invoiceApiSchema>

// Função para valores padrão do formulário
export function getInvoiceDefaultValues() {
  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
  
  return {
    series: '',
    number: '',
    due_date: nextMonth.toISOString().split('T')[0], // Vencimento para próximo mês
    total_amount: '', // String vazia para input
    supplier_id: '',
    notes: ''
  }
}

// Função para preparar dados do formulário para envio
export function prepareInvoiceData(data: InvoiceFormData): FormData {
  const formData = new FormData()
  
  // Converter string para centavos
  const numericValue = parseFloat(data.total_amount.toString().replace(/[R$\s.]/g, '').replace(',', '.'))
  const totalAmountCents = realToCents(numericValue)
  
  formData.append('supplier_id', data.supplier_id)
  formData.append('series', data.series)
  formData.append('number', data.number)
  formData.append('due_date', data.due_date)
  formData.append('total_amount_cents', totalAmountCents.toString())
  formData.append('pdf_file', data.pdf_file)
  
  if (data.notes?.trim()) {
    formData.append('notes', data.notes.trim())
  }
  
  return formData
}

// Função para preparar dados de edição
export function prepareInvoiceEditData(data: InvoiceEditData): FormData {
  const formData = new FormData()
  
  if (data.supplier_id) formData.append('supplier_id', data.supplier_id)
  if (data.series) formData.append('series', data.series)
  if (data.number) formData.append('number', data.number)
  if (data.due_date) formData.append('due_date', data.due_date)
  if (data.total_amount !== undefined) {
    const numericValue = parseFloat(data.total_amount.toString().replace(/[R$\s.]/g, '').replace(',', '.'))
    const amountCents = realToCents(numericValue)
    formData.append('total_amount_cents', amountCents.toString())
  }
  if (data.pdf_file) formData.append('pdf_file', data.pdf_file)
  if (data.notes !== undefined) formData.append('notes', data.notes.trim())
  
  return formData
}