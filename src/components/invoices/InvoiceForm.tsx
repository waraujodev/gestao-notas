'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CurrencyInput } from '@/components/common/CurrencyInput'
import { SupplierSelect } from '@/components/common/SupplierSelect'
import { FileUpload } from '@/components/upload/FileUpload'
import { 
  invoiceFormSchema,
  getInvoiceDefaultValues,
  prepareInvoiceData,
  type InvoiceFormData 
} from '@/lib/validations/invoice'
import { getDateInputValue } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'

interface InvoiceFormProps {
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<InvoiceFormData>
  isEditing?: boolean
  loading?: boolean
}

export function InvoiceForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  loading = false
}: InvoiceFormProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      ...getInvoiceDefaultValues(),
      ...initialData
    },
    mode: 'onBlur'
  })

  const { handleSubmit, control, formState: { errors, isSubmitting } } = form

  const handleFormSubmit = async (data: InvoiceFormData) => {
    try {
      const formData = prepareInvoiceData(data)
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submit error:', error)
      // Error handling is done in the parent component
    }
  }

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0]
      setUploadedFile(file)
      form.setValue('pdf_file', file)
      
      // Create preview URL for PDF
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleFileRemove = () => {
    setUploadedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    form.setValue('pdf_file', undefined as any)
  }

  const handleSupplierCreate = () => {
    // TODO: Implement supplier creation modal in next phase
    console.log('Create new supplier')
  }

  const isFormLoading = loading || isSubmitting

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {isEditing ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isEditing 
                ? 'Atualize os dados da nota fiscal' 
                : 'Preencha os dados para cadastrar uma nova nota fiscal'
              }
            </p>
          </div>
        </div>

        {/* Supplier Selection */}
        <FormField
          control={control}
          name="supplier_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Fornecedor <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <SupplierSelect
                  value={field.value}
                  onChange={field.onChange}
                  onCreateNew={handleSupplierCreate}
                  error={!!errors.supplier_id}
                  disabled={isFormLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Series and Number */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="series"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Série <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex: 001"
                    disabled={isFormLoading}
                    className={errors.series ? 'border-red-500' : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Número <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex: 123456"
                    disabled={isFormLoading}
                    className={errors.number ? 'border-red-500' : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Due Date and Total Amount */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Data de Vencimento <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    disabled={isFormLoading}
                    className={errors.due_date ? 'border-red-500' : ''}
                    min={getDateInputValue('2020-01-01')}
                    max={getDateInputValue(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 10).toISOString())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="total_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Valor Total <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="R$ 0,00"
                    disabled={isFormLoading}
                    error={!!errors.total_amount}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* PDF Upload */}
        <FormField
          control={control}
          name="pdf_file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Arquivo da Nota Fiscal <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {!uploadedFile ? (
                    <FileUpload
                      onFilesSelect={handleFileSelect}
                      accept={['.pdf']}
                      maxSize={10 * 1024 * 1024} // 10MB
                      maxFiles={1}
                      disabled={isFormLoading}
                      className={errors.pdf_file ? 'border-red-500' : ''}
                    />
                  ) : (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded">
                            <FileText className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">{uploadedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleFileRemove}
                          disabled={isFormLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observações adicionais sobre a nota fiscal..."
                  rows={3}
                  disabled={isFormLoading}
                  className={errors.notes ? 'border-red-500' : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isFormLoading}
            className="flex-1"
          >
            {isFormLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Salvando...' : 'Cadastrando...'}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Nota'}
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isFormLoading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}