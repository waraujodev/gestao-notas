import { z } from 'zod'
import { realToCents } from '@/lib/utils/currency'

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

// Schema para data de pagamento
const paymentDateSchema = z
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
    maxDate.setDate(maxDate.getDate() + 30) // Até 30 dias no futuro
    return parsedDate <= maxDate
  }, 'Data muito futura (máximo 30 dias)')

// Schema para arquivo de comprovante (PDF, JPG, PNG)
const receiptFileSchema = z
  .instanceof(File, { message: 'Comprovante obrigatório' })
  .refine((file) => file.size > 0, 'Arquivo não pode estar vazio')
  .refine((file) => file.size <= 10 * 1024 * 1024, 'Arquivo deve ter no máximo 10MB')
  .refine(
    (file) => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      return allowedTypes.includes(file.type)
    },
    'Apenas arquivos PDF, JPG ou PNG são permitidos'
  )

// Schema principal do formulário de pagamento
export const paymentFormSchema = z.object({
  payment_method_id: z
    .string()
    .min(1, 'Forma de pagamento obrigatória')
    .uuid('Forma de pagamento inválida'),

  amount: z.string().pipe(moneySchema),

  payment_date: paymentDateSchema,

  receipt_file: receiptFileSchema,

  notes: z
    .string()
    .trim()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
})

// Schema para edição (todos os campos opcionais exceto ID)
export const paymentEditSchema = z.object({
  id: z.string().uuid('ID inválido'),
  
  payment_method_id: z
    .string()
    .min(1, 'Forma de pagamento obrigatória')
    .uuid('Forma de pagamento inválida')
    .optional(),

  amount: z.string().pipe(moneySchema).optional(),

  payment_date: paymentDateSchema.optional(),

  receipt_file: receiptFileSchema.optional(),

  notes: z
    .string()
    .trim()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
})

// Schema com validação de valor restante (usado no contexto da nota)
export const paymentWithContextSchema = paymentFormSchema.extend({
  // Validação adicional será feita no componente com context da nota
})

// Tipos derivados dos schemas
export type PaymentFormData = z.infer<typeof paymentFormSchema>
export type PaymentEditData = z.infer<typeof paymentEditSchema>

// Schema para dados processados (enviados para a API)
export const paymentApiSchema = paymentFormSchema.transform((data) => ({
  payment_method_id: data.payment_method_id,
  amount_cents: data.amount, // já convertido para centavos
  payment_date: data.payment_date,
  receipt_file: data.receipt_file,
  notes: data.notes
}))

export type PaymentApiData = z.infer<typeof paymentApiSchema>

// Função para valores padrão do formulário
export function getPaymentDefaultValues(): Partial<PaymentFormData> {
  const today = new Date().toISOString().split('T')[0]
  
  return {
    payment_method_id: '',
    amount: '', // Será preenchido pelo usuário
    payment_date: today, // Data de hoje por padrão
    notes: ''
  }
}

// Função para preparar dados do formulário para envio
export function preparePaymentData(data: PaymentFormData, invoice_id: string): FormData {
  const formData = new FormData()
  
  // Converter string para centavos
  const numericValue = parseFloat(data.amount.toString().replace(/[R$\s.]/g, '').replace(',', '.'))
  const amountCents = realToCents(numericValue)
  
  formData.append('invoice_id', invoice_id)
  formData.append('payment_method_id', data.payment_method_id)
  formData.append('amount_cents', amountCents.toString())
  formData.append('payment_date', data.payment_date)
  formData.append('receipt_file', data.receipt_file)
  
  if (data.notes?.trim()) {
    formData.append('notes', data.notes.trim())
  }
  
  return formData
}

// Função para preparar dados de edição
export function preparePaymentEditData(data: PaymentEditData): FormData {
  const formData = new FormData()
  
  if (data.payment_method_id) formData.append('payment_method_id', data.payment_method_id)
  if (data.payment_date) formData.append('payment_date', data.payment_date)
  if (data.receipt_file) formData.append('receipt_file', data.receipt_file)
  if (data.notes !== undefined) formData.append('notes', data.notes || '')
  
  if (data.amount !== undefined) {
    const numericValue = parseFloat(data.amount.toString().replace(/[R$\s.]/g, '').replace(',', '.'))
    const amountCents = realToCents(numericValue)
    formData.append('amount_cents', amountCents.toString())
  }
  
  return formData
}

// Função para validar valor do pagamento contra valor restante da nota
export function validatePaymentAmount(
  paymentAmountCents: number,
  remainingAmountCents: number,
  isEdit: boolean = false,
  currentPaymentCents: number = 0
): { valid: boolean; error?: string } {
  
  // No modo edição, considerar o valor atual do pagamento
  const effectiveRemaining = isEdit 
    ? remainingAmountCents + currentPaymentCents 
    : remainingAmountCents

  if (paymentAmountCents > effectiveRemaining) {
    return {
      valid: false,
      error: `Valor não pode exceder o restante da nota: R$ ${(effectiveRemaining / 100).toFixed(2)}`
    }
  }

  return { valid: true }
}

// Função para determinar tipo de arquivo pelo MIME type
export function getReceiptType(file: File): 'pdf' | 'jpg' | 'png' {
  if (file.type === 'application/pdf') return 'pdf'
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') return 'jpg'
  if (file.type === 'image/png') return 'png'
  return 'pdf' // fallback
}