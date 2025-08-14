'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { FileUploadOptions } from '@/types/upload'
import { validateFile, formatFileSize, getFileIcon } from '@/lib/upload'
import { useUpload } from '@/hooks/useUpload'

interface FileUploadProps {
  options: FileUploadOptions
  onUploadComplete?: (path: string, file: File) => void
  onUploadError?: (error: string) => void
  accept?: Record<string, string[]>
  multiple?: boolean
  disabled?: boolean
  className?: string
}

interface FileWithPreview extends File {
  preview?: string
  key: string
  path?: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export function FileUpload({
  options,
  onUploadComplete,
  onUploadError,
  accept,
  multiple = false,
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const { upload, getUploadProgress, isUploading } = useUpload()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileWithPreview[] = acceptedFiles.map(file => ({
      ...file,
      key: file.name + Date.now() + Math.random(),
      status: 'pending' as const,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))

    setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles)

    // Validar e fazer upload de cada arquivo
    newFiles.forEach(async (file) => {
      const validation = validateFile(file, options)
      
      if (!validation.isValid) {
        setFiles(prev => prev.map(f => 
          f.key === file.key 
            ? { ...f, status: 'error', error: validation.error }
            : f
        ))
        onUploadError?.(validation.error || 'Arquivo inválido')
        return
      }

      // Atualizar status para uploading
      setFiles(prev => prev.map(f => 
        f.key === file.key ? { ...f, status: 'uploading' } : f
      ))

      try {
        const path = await upload(file, options, file.key)
        
        if (path) {
          setFiles(prev => prev.map(f => 
            f.key === file.key 
              ? { ...f, status: 'success', path }
              : f
          ))
          onUploadComplete?.(path, file)
        } else {
          throw new Error('Upload falhou')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro no upload'
        setFiles(prev => prev.map(f => 
          f.key === file.key 
            ? { ...f, status: 'error', error: errorMessage }
            : f
        ))
        onUploadError?.(errorMessage)
      }
    })
  }, [options, multiple, upload, onUploadComplete, onUploadError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    disabled: disabled || isUploading(),
  })

  const removeFile = (fileKey: string) => {
    setFiles(prev => prev.filter(f => f.key !== fileKey))
  }

  const getFileProgress = (fileKey: string): number => {
    const progress = getUploadProgress(fileKey)
    return progress?.progress || 0
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Área de Drop */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <Upload className={cn(
            "h-12 w-12",
            isDragActive ? "text-primary" : "text-muted-foreground"
          )} />
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragActive 
                ? "Solte os arquivos aqui..." 
                : "Arraste arquivos aqui ou clique para selecionar"
              }
            </p>
            <p className="text-sm text-muted-foreground">
              Tamanho máximo: {formatFileSize(options.maxSize || 10485760)}
            </p>
            <p className="text-xs text-muted-foreground">
              Tipos aceitos: {
                (options.allowedTypes || ['application/pdf'])
                  .map(type => type.split('/')[1].toUpperCase())
                  .join(', ')
              }
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Arquivos selecionados:</h4>
          
          {files.map((file) => (
            <div
              key={file.key}
              className="flex items-center space-x-3 p-3 border rounded-lg"
            >
              {/* Ícone do arquivo */}
              <div className="text-2xl">
                {getFileIcon(file.name)}
              </div>

              {/* Informações do arquivo */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
                
                {/* Progresso */}
                {file.status === 'uploading' && (
                  <div className="mt-2">
                    <Progress value={getFileProgress(file.key)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enviando... {getFileProgress(file.key)}%
                    </p>
                  </div>
                )}
                
                {/* Erro */}
                {file.status === 'error' && file.error && (
                  <p className="text-xs text-red-600 mt-1">{file.error}</p>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                {file.status === 'success' && (
                  <Check className="h-5 w-5 text-green-600" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                {file.status === 'uploading' && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
                
                {/* Botão de remover */}
                {file.status !== 'uploading' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}