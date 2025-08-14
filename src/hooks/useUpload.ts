'use client'

import { useState } from 'react'
import { UploadProgress, FileUploadOptions } from '@/types/upload'
import { uploadFile, deleteFile, getSignedUrl } from '@/lib/upload'
import { useToast } from './useToast'

export function useUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map())
  const toast = useToast()

  const upload = async (
    file: File,
    options: FileUploadOptions,
    fileKey?: string
  ): Promise<string | null> => {
    const key = fileKey || file.name + Date.now()
    
    try {
      // Inicializar progress
      setUploads(prev => new Map(prev).set(key, {
        progress: 0,
        status: 'uploading',
      }))

      // Simular progresso (já que o Supabase não fornece progresso real)
      const progressInterval = setInterval(() => {
        setUploads(prev => {
          const current = prev.get(key)
          if (current && current.progress < 90) {
            return new Map(prev).set(key, {
              ...current,
              progress: current.progress + 10,
            })
          }
          return prev
        })
      }, 200)

      // Upload do arquivo
      const path = await uploadFile(file, options)

      // Finalizar progresso
      clearInterval(progressInterval)
      setUploads(prev => new Map(prev).set(key, {
        progress: 100,
        status: 'success',
      }))

      toast.success('Arquivo enviado com sucesso!')
      
      // Remover do estado após alguns segundos
      setTimeout(() => {
        setUploads(prev => {
          const newMap = new Map(prev)
          newMap.delete(key)
          return newMap
        })
      }, 3000)

      return path
    } catch (error) {
      // Erro no upload
      setUploads(prev => new Map(prev).set(key, {
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }))

      toast.error('Erro no upload', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      })

      // Remover do estado após alguns segundos
      setTimeout(() => {
        setUploads(prev => {
          const newMap = new Map(prev)
          newMap.delete(key)
          return newMap
        })
      }, 5000)

      return null
    }
  }

  const remove = async (bucket: string, path: string): Promise<boolean> => {
    try {
      await deleteFile(bucket, path)
      toast.success('Arquivo removido com sucesso!')
      return true
    } catch (error) {
      toast.error('Erro ao remover arquivo', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      })
      return false
    }
  }

  const getUrl = async (
    bucket: string,
    path: string,
    expiresIn?: number
  ): Promise<string | null> => {
    try {
      return await getSignedUrl(bucket, path, expiresIn)
    } catch (error) {
      toast.error('Erro ao gerar URL do arquivo', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      })
      return null
    }
  }

  const getUploadProgress = (fileKey: string): UploadProgress | null => {
    return uploads.get(fileKey) || null
  }

  const isUploading = (fileKey?: string): boolean => {
    if (fileKey) {
      const progress = uploads.get(fileKey)
      return progress?.status === 'uploading'
    }
    
    // Verificar se qualquer upload está em andamento
    return Array.from(uploads.values()).some(progress => progress.status === 'uploading')
  }

  return {
    upload,
    remove,
    getUrl,
    getUploadProgress,
    isUploading,
    uploads: Array.from(uploads.entries()),
  }
}