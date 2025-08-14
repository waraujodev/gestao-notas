// Re-export all utilities
export { cn } from './cn'
export { formatCurrency, centsToReal, realToCents } from './currency'
export { formatDocument, validateCPF, validateCNPJ } from './document'

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileIcon(fileType: string): string {
  if (fileType.includes('pdf')) return '📄'
  if (fileType.includes('image')) return '🖼️'
  return '📁'
}
