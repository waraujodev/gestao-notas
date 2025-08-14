'use client'

import { useState, useEffect } from 'react'
import { Eye, Download, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUpload } from '@/hooks/useUpload'
import { isImageFile, isPdfFile, formatFileSize } from '@/lib/upload'

interface FilePreviewProps {
  fileName: string
  filePath: string
  bucket: string
  fileSize?: number
  isOpen: boolean
  onClose: () => void
}

export function FilePreview({
  fileName,
  filePath,
  bucket,
  fileSize,
  isOpen,
  onClose,
}: FilePreviewProps) {
  const [loading, setLoading] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { getUrl } = useUpload()

  useEffect(() => {
    if (isOpen && filePath) {
      loadFile()
    }
    
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [isOpen, filePath])

  const loadFile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = await getUrl(bucket, filePath, 3600) // 1 hora
      if (url) {
        setFileUrl(url)
      } else {
        throw new Error('Não foi possível carregar o arquivo')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar arquivo')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={loadFile} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </div>
        </div>
      )
    }

    if (!fileUrl) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhum arquivo carregado</p>
        </div>
      )
    }

    if (isImageFile(fileName)) {
      return (
        <div className="flex items-center justify-center">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-96 object-contain rounded-lg"
          />
        </div>
      )
    }

    if (isPdfFile(fileName)) {
      return (
        <div className="w-full h-96">
          <iframe
            src={fileUrl}
            className="w-full h-full border rounded-lg"
            title={fileName}
          />
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Visualização não disponível para este tipo de arquivo
          </p>
          <Button onClick={handleDownload} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Baixar Arquivo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{fileName}</DialogTitle>
              <DialogDescription>
                {fileSize && `Tamanho: ${formatFileSize(fileSize)}`}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              {fileUrl && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  )
}