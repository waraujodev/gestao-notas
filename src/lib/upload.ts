import { createClient } from '@/lib/supabase/client'
import { FileUploadOptions, FileValidationResult, UPLOAD_CONFIG } from '@/types/upload'

export function validateFile(
  file: File,
  options: FileUploadOptions
): FileValidationResult {
  const maxSize = options.maxSize || UPLOAD_CONFIG.maxSize
  const allowedTypes = options.allowedTypes || UPLOAD_CONFIG.allowedTypes[options.bucket]

  // Validar tamanho
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo ${formatFileSize(maxSize)} permitido.`,
    }
  }

  // Validar tipo
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`,
    }
  }

  return { isValid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function generateFilePath(
  userId: string,
  bucket: string,
  originalFileName: string,
  folder?: string
): string {
  const timestamp = Date.now()
  const cleanFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileExtension = cleanFileName.split('.').pop()
  const baseName = cleanFileName.replace(`.${fileExtension}`, '')
  
  let path = `${userId}`
  
  if (folder) {
    path += `/${folder}`
  }
  
  path += `/${baseName}_${timestamp}.${fileExtension}`
  
  return path
}

export async function uploadFile(
  file: File,
  options: FileUploadOptions,
  onProgress?: (progress: number) => void
): Promise<string> {
  const supabase = createClient()

  // Validar arquivo
  const validation = validateFile(file, options)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  // Obter usuário atual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Gerar caminho do arquivo
  const filePath = generateFilePath(user.id, options.bucket, file.name, options.folder)

  // Upload do arquivo
  const { data, error } = await supabase.storage
    .from(options.bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false, // Não sobrescrever arquivos existentes
    })

  if (error) {
    throw new Error(`Erro no upload: ${error.message}`)
  }

  return data.path
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Erro ao excluir arquivo: ${error.message}`)
  }
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600 // 1 hora
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Erro ao gerar URL: ${error.message}`)
  }

  return data.signedUrl
}

export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return '📄'
    case 'jpg':
    case 'jpeg':
    case 'png':
      return '🖼️'
    default:
      return '📁'
  }
}

export function isImageFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')
}

export function isPdfFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension === 'pdf'
}