'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimpleFileUploadProps {
  onFilesSelect: (files: File[]) => void
  accept?: string
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  className?: string
}

export function FileUpload({
  onFilesSelect,
  accept = '',
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  disabled = false,
  className
}: SimpleFileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelect(acceptedFiles)
  }, [onFilesSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    maxFiles,
    disabled,
    multiple: maxFiles > 1
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <Upload className="h-10 w-10 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          {isDragActive ? (
            <p>Solte o arquivo aqui...</p>
          ) : (
            <div>
              <p>Arraste e solte um arquivo aqui, ou clique para selecionar</p>
              {accept && (
                <p className="text-xs mt-1">Formatos aceitos: {accept}</p>
              )}
              {maxSize && (
                <p className="text-xs">Tamanho máximo: {(maxSize / (1024 * 1024)).toFixed(0)}MB</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}