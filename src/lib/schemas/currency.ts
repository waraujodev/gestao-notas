import { z } from 'zod'
import { realToCents, centsToReal } from '@/lib/utils/currency'

/**
 * Schema para valores monetários em centavos (armazenamento)
 * Aceita números inteiros positivos representando centavos
 */
export const centavosSchema = z
  .number()
  .int('Valor deve ser um número inteiro')
  .positive('Valor deve ser positivo')
  .max(999999999999, 'Valor muito alto') // ~10 bilhões de centavos = 100 milhões de reais

/**
 * Schema para valores monetários em reais (entrada do usuário)
 * Converte automaticamente para centavos
 */
export const reaisSchema = z
  .number()
  .positive('Valor deve ser positivo')
  .max(99999999.99, 'Valor muito alto') // 100 milhões de reais
  .transform(reais => realToCents(reais)) // Converte para centavos automaticamente
  .pipe(centavosSchema) // Valida como centavos

/**
 * Schema para valores monetários a partir de string (input de formulário)
 * Remove formatação e converte para centavos
 */
export const currencyStringSchema = z
  .string()
  .min(1, 'Valor é obrigatório')
  .transform(str => {
    // Remove formatação brasileira: R$ 1.234,56 -> 1234.56
    const cleanStr = str
      .replace(/[R$\s]/g, '') // Remove R$ e espaços
      .replace(/\./g, '') // Remove separadores de milhar
      .replace(',', '.') // Troca vírgula por ponto decimal

    const number = parseFloat(cleanStr)
    if (isNaN(number)) throw new Error('Valor inválido')

    return number
  })
  .pipe(reaisSchema) // Converte para centavos

/**
 * Schema para validação de pagamento
 * Garante que o valor não seja negativo e não exceda um limite
 */
export const paymentAmountSchema = z.object({
  amount_cents: centavosSchema,
  invoice_total_cents: centavosSchema,
  already_paid_cents: centavosSchema.default(0),
}).refine(
  data => {
    const remaining = data.invoice_total_cents - data.already_paid_cents
    return data.amount_cents <= remaining
  },
  {
    message: 'Valor do pagamento excede o valor restante da nota',
    path: ['amount_cents'],
  }
)

/**
 * Schema para nota fiscal - valores monetários
 */
export const invoiceAmountSchema = z.object({
  total_amount_cents: centavosSchema,
})

/**
 * Schema para formulário de pagamento (entrada do usuário)
 */
export const paymentFormSchema = z.object({
  amount: currencyStringSchema, // String do formulário -> centavos
  payment_date: z.date(),
  payment_method_id: z.string().uuid('Forma de pagamento inválida'),
  notes: z.string().optional(),
})

/**
 * Schema para formulário de nota fiscal (entrada do usuário)
 */
export const invoiceFormSchema = z.object({
  series: z.string().min(1, 'Série é obrigatória').trim(),
  number: z.string().min(1, 'Número é obrigatório').trim(),
  due_date: z.date(),
  total_amount: currencyStringSchema, // String -> centavos
  supplier_id: z.string().uuid('Fornecedor inválido'),
})

/**
 * Tipos TypeScript derivados dos schemas
 */
export type PaymentFormInput = z.infer<typeof paymentFormSchema>
export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>
export type PaymentAmountValidation = z.infer<typeof paymentAmountSchema>

/**
 * Utilitários para trabalhar com schemas de moeda
 */
export const currencyUtils = {
  /**
   * Valida e converte string monetária para centavos
   */
  parseTocentavos: (value: string): number => {
    return currencyStringSchema.parse(value)
  },

  /**
   * Valida valor em centavos
   */
  validateCents: (value: number): number => {
    return centavosSchema.parse(value)
  },

  /**
   * Converte centavos para exibição formatada
   */
  formatFromCents: (cents: number): string => {
    const reais = centsToReal(cents)
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(reais)
  },
}