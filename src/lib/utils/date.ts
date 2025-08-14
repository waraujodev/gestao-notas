/**
 * Format date to Brazilian format (DD/MM/YYYY)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Format date to relative time (e.g., "há 2 dias", "em 3 dias")
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return 'Hoje'
  } else if (diffInDays === 1) {
    return 'Amanhã'
  } else if (diffInDays === -1) {
    return 'Ontem'
  } else if (diffInDays > 0) {
    return `Em ${diffInDays} dias`
  } else {
    return `Há ${Math.abs(diffInDays)} dias`
  }
}

/**
 * Check if date is overdue (past today)
 */
export function isOverdue(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  
  return date < today
}

/**
 * Format datetime to Brazilian format with time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get date input value (YYYY-MM-DD format)
 */
export function getDateInputValue(dateString?: string): string {
  const date = dateString ? new Date(dateString) : new Date()
  return date.toISOString().split('T')[0]
}

/**
 * Convert date input value to ISO string
 */
export function dateInputToISO(dateInput: string): string {
  return new Date(dateInput + 'T00:00:00.000Z').toISOString()
}