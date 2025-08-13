import {
  formatToCPF,
  formatToCNPJ,
  isCPF,
  isCNPJ,
  isCPFOrCNPJ,
} from 'brazilian-values'

/**
 * Remove mask from CNPJ/CPF - keep only numbers
 */
export function sanitizeDocument(document: string): string {
  return document.replace(/\D/g, '')
}

/**
 * Format CNPJ/CPF for display using brazilian-values
 */
export function formatDocument(document: string): string {
  const numbers = sanitizeDocument(document)

  if (numbers.length === 11) {
    return formatToCPF(numbers)
  } else if (numbers.length === 14) {
    return formatToCNPJ(numbers)
  }

  return document
}

/**
 * Validate CPF using brazilian-values library
 */
export function validateCPF(document: string): boolean {
  return isCPF(document)
}

/**
 * Validate CNPJ using brazilian-values library
 */
export function validateCNPJ(document: string): boolean {
  return isCNPJ(document)
}

/**
 * Validate CNPJ or CPF automatically using brazilian-values
 */
export function validateDocument(document: string): boolean {
  return isCPFOrCNPJ(document)
}

/**
 * Get document type based on length and validation
 */
export function getDocumentType(document: string): 'cpf' | 'cnpj' | 'invalid' {
  if (isCPF(document)) {
    return 'cpf'
  } else if (isCNPJ(document)) {
    return 'cnpj'
  }

  return 'invalid'
}

/**
 * Generate random CPF for testing (manual implementation)
 * Only for development - creates valid CPF structure
 */
export function generateCPF(): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('generateCPF should not be used in production')
  }
  
  // Gera 9 dígitos aleatórios
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
  
  // Calcula primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i)
  }
  const firstDigit = 11 - (sum % 11)
  digits.push(firstDigit >= 10 ? 0 : firstDigit)
  
  // Calcula segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i)
  }
  const secondDigit = 11 - (sum % 11)
  digits.push(secondDigit >= 10 ? 0 : secondDigit)
  
  return digits.join('')
}

/**
 * Generate random CNPJ for testing (manual implementation)
 * Only for development - creates valid CNPJ structure
 */
export function generateCNPJ(): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('generateCNPJ should not be used in production')
  }
  
  // Gera 12 dígitos aleatórios
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10))
  
  // Calcula primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights1[i]
  }
  const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  digits.push(firstDigit)
  
  // Calcula segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * weights2[i]
  }
  const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  digits.push(secondDigit)
  
  return digits.join('')
}
