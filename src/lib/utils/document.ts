/**
 * Format CNPJ/CPF for display
 */
export function formatDocument(document: string): string {
  const numbers = document.replace(/\D/g, '')

  if (numbers.length === 11) {
    // CPF: 000.000.000-00
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else if (numbers.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return numbers.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    )
  }

  return document
}

/**
 * Basic CPF validation (will be enhanced with @brazilian-utils)
 */
export function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '')
  return numbers.length === 11
}

/**
 * Basic CNPJ validation (will be enhanced with @brazilian-utils)
 */
export function validateCNPJ(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, '')
  return numbers.length === 14
}
