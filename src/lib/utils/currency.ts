/**
 * Convert centavos to reais
 */
export function centsToReal(cents: number): number {
  return cents / 100
}

/**
 * Convert reais to centavos
 */
export function realToCents(reais: number): number {
  return Math.round(reais * 100)
}

/**
 * Format currency value in centavos to BRL display format
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}