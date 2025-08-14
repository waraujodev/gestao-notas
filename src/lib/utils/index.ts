// Re-export all utilities
export { cn } from './cn'
export { formatCurrency, centsToReal, realToCents } from './currency'
export { formatDocument, validateCPF, validateCNPJ } from './document'
export { formatDate, formatDateTime, formatRelativeDate, getDateInputValue } from './date'

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileIcon(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop() || ''
  
  if (extension === 'pdf') return '📄'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return '🖼️'
  if (['doc', 'docx'].includes(extension)) return '📝'
  if (['xls', 'xlsx'].includes(extension)) return '📊'
  if (['zip', 'rar', '7z'].includes(extension)) return '🗜️'
  return '📁'
}
