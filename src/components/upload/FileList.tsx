'use client'

import { useState } from 'react'
import { Eye, Download, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatFileSize, getFileIcon } from '@/lib/upload'
import { formatDate } from '@/lib/utils'
import { FilePreview } from './FilePreview'
import { useUpload } from '@/hooks/useUpload'

interface FileItem {
  id: string
  name: string
  path: string
  size: number
  type: string
  bucket: string
  uploaded_at: string
  url?: string
}

interface FileListProps {
  files: FileItem[]
  onDelete?: (fileId: string, filePath: string) => void
  showActions?: boolean
  emptyMessage?: string
}

export function FileList({
  files,
  onDelete,
  showActions = true,
  emptyMessage = 'Nenhum arquivo encontrado',
}: FileListProps) {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const { remove, getUrl } = useUpload()

  const handlePreview = (file: FileItem) => {
    setPreviewFile(file)
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const url = await getUrl(file.bucket, file.path)
      if (url) {
        const link = document.createElement('a')
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error)
    }
  }

  const handleDelete = async (file: FileItem) => {
    if (confirm(`Tem certeza que deseja excluir o arquivo "${file.name}"?`)) {
      const success = await remove(file.bucket, file.path)
      if (success && onDelete) {
        onDelete(file.id, file.path)
      }
    }
  }

  const getFileStatusBadge = (file: FileItem) => {
    if (file.size > 10485760) { // 10MB
      return <Badge variant="destructive">Muito grande</Badge>
    }
    
    return <Badge variant="success">OK</Badge>
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Arquivo</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Upload</TableHead>
              <TableHead>Status</TableHead>
              {showActions && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getFileIcon(file.name)}</span>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {file.path}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatFileSize(file.size)}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {file.type.split('/')[1].toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(file.uploaded_at)}</TableCell>
                <TableCell>{getFileStatusBadge(file)}</TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(file)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        title="Baixar"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <FilePreview
          fileName={previewFile.name}
          filePath={previewFile.path}
          bucket={previewFile.bucket}
          fileSize={previewFile.size}
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  )
}