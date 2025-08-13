import { z } from 'zod'
import {
  validateCPF,
  validateCNPJ,
  validateDocument,
  sanitizeDocument,
} from '@/lib/utils/document'

/**
 * Schema para validação de CPF
 */
export const cpfSchema = z
  .string()
  .min(1, 'CPF é obrigatório')
  .transform(doc => sanitizeDocument(doc)) // Remove máscara automaticamente
  .refine(doc => doc.length === 11, {
    message: 'CPF deve conter exatamente 11 dígitos',
  })
  .refine(doc => validateCPF(doc), {
    message: 'CPF inválido',
  })

/**
 * Schema para validação de CNPJ
 */
export const cnpjSchema = z
  .string()
  .min(1, 'CNPJ é obrigatório')
  .transform(doc => sanitizeDocument(doc)) // Remove máscara automaticamente
  .refine(doc => doc.length === 14, {
    message: 'CNPJ deve conter exatamente 14 dígitos',
  })
  .refine(doc => validateCNPJ(doc), {
    message: 'CNPJ inválido',
  })

/**
 * Schema para validação de CNPJ ou CPF automaticamente
 */
export const documentSchema = z
  .string()
  .min(1, 'Documento é obrigatório')
  .transform(doc => sanitizeDocument(doc)) // Remove máscara automaticamente
  .refine(
    doc => doc.length === 11 || doc.length === 14,
    {
      message: 'Documento deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos)',
    }
  )
  .refine(doc => validateDocument(doc), {
    message: 'Documento inválido',
  })

/**
 * Schema para fornecedores - validação completa
 */
export const supplierSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome muito longo')
    .trim(),
  document: documentSchema, // Aceita CPF ou CNPJ
  email: z
    .union([z.string().email('Email inválido'), z.literal('')])
    .optional()
    .transform(email => email || undefined), // Converte string vazia em undefined
  phone: z
    .string()
    .optional()
    .transform(phone => {
      if (!phone) return undefined
      const numbers = phone.replace(/\D/g, '')
      return numbers.length >= 10 && numbers.length <= 11 ? numbers : undefined
    })
    .refine(
      phone => {
        if (!phone) return true // Opcional
        return phone.length >= 10 && phone.length <= 11
      },
      {
        message: 'Telefone deve ter 10 ou 11 dígitos',
      }
    ),
  status: z.boolean().default(true),
})

/**
 * Schema para criação de fornecedores (sem ID)
 */
export const createSupplierSchema = supplierSchema

/**
 * Schema para atualização de fornecedores (campos opcionais)
 */
export const updateSupplierSchema = supplierSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
})

/**
 * Tipos TypeScript derivados dos schemas
 */
export type SupplierInput = z.infer<typeof supplierSchema>
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>

/**
 * Schema para validação de documento com formatação automática
 * Útil para inputs com máscara visual
 */
export const documentWithFormatSchema = z
  .string()
  .min(1, 'Documento é obrigatório')
  .refine(doc => {
    const sanitized = sanitizeDocument(doc)
    return sanitized.length === 11 || sanitized.length === 14
  }, 'Documento deve ser um CPF ou CNPJ válido')
  .refine(doc => validateDocument(doc), 'Documento inválido')
  .transform(doc => sanitizeDocument(doc)) // Armazena sem máscara