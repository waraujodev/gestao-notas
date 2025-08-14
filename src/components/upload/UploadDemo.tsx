'use client'

import { useState } from 'react'
import { FileUpload } from './FileUpload'
import { FileList } from './FileList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UPLOAD_CONFIG } from '@/types/upload'

// Simulação de arquivos já enviados
const mockFiles = [
  {
    id: '1',
    name: 'nota_fiscal_001.pdf',
    path: 'user123/invoices/nota_fiscal_001_1234567890.pdf',
    size: 1024000,
    type: 'application/pdf',
    bucket: 'invoices',
    uploaded_at: '2025-08-14T10:30:00Z',
  },
  {
    id: '2',
    name: 'comprovante_pagamento.jpg',
    path: 'user123/receipts/comprovante_pagamento_1234567891.jpg',
    size: 512000,
    type: 'image/jpeg',
    bucket: 'receipts',
    uploaded_at: '2025-08-14T09:15:00Z',
  },
]

export function UploadDemo() {
  const [uploadedFiles, setUploadedFiles] = useState(mockFiles)

  const handleUploadComplete = (path: string, file: File) => {
    const newFile = {
      id: Date.now().toString(),
      name: file.name,
      path,
      size: file.size,
      type: file.type,
      bucket: path.includes('invoices') ? 'invoices' : 'receipts',
      uploaded_at: new Date().toISOString(),
    }
    
    setUploadedFiles(prev => [newFile, ...prev])
  }

  const handleFileDelete = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices">Notas Fiscais (PDF)</TabsTrigger>
          <TabsTrigger value="receipts">Comprovantes (PDF/Imagens)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Notas Fiscais</CardTitle>
              <CardDescription>
                Envie arquivos PDF de notas fiscais (máximo 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                options={{
                  bucket: 'invoices',
                  maxSize: UPLOAD_CONFIG.maxSize,
                  allowedTypes: UPLOAD_CONFIG.allowedTypes.invoices,
                  folder: 'invoices',
                }}
                accept={{
                  'application/pdf': ['.pdf'],
                }}
                onUploadComplete={handleUploadComplete}
                onUploadError={(error) => console.error('Upload error:', error)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas Fiscais Enviadas</CardTitle>
              <CardDescription>
                Arquivos PDF de notas fiscais já enviados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileList
                files={uploadedFiles.filter(f => f.bucket === 'invoices')}
                onDelete={handleFileDelete}
                emptyMessage="Nenhuma nota fiscal enviada ainda"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Comprovantes</CardTitle>
              <CardDescription>
                Envie comprovantes em PDF ou imagens (JPG, PNG) - máximo 10MB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                options={{
                  bucket: 'receipts',
                  maxSize: UPLOAD_CONFIG.maxSize,
                  allowedTypes: UPLOAD_CONFIG.allowedTypes.receipts,
                  folder: 'receipts',
                }}
                accept={{
                  'application/pdf': ['.pdf'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/png': ['.png'],
                }}
                multiple
                onUploadComplete={handleUploadComplete}
                onUploadError={(error) => console.error('Upload error:', error)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comprovantes Enviados</CardTitle>
              <CardDescription>
                Comprovantes de pagamento já enviados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileList
                files={uploadedFiles.filter(f => f.bucket === 'receipts')}
                onDelete={handleFileDelete}
                emptyMessage="Nenhum comprovante enviado ainda"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}