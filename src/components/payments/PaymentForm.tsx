'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X, FileText, Image, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CurrencyInput } from '@/components/common/CurrencyInput'
import { FileUpload } from '@/components/upload/FileUpload'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { 
  paymentFormSchema,
  getPaymentDefaultValues,
  preparePaymentData,
  validatePaymentAmount,
  getReceiptType,
  type PaymentFormData 
} from '@/lib/validations/payment'
import { formatCurrency } from '@/lib/utils/currency'
import { getDateInputValue } from '@/lib/utils/date'
import type { InvoiceSummary } from '@/types/invoice'

interface PaymentFormProps {
  invoice: InvoiceSummary
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<PaymentFormData>
  isEditing?: boolean
  loading?: boolean
}

export function PaymentForm({
  invoice,
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  loading = false
}: PaymentFormProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [customAmountError, setCustomAmountError] = useState<string | null>(null)

  const { paymentMethods, loading: loadingMethods } = usePaymentMethods({
    limit: 50
  })

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      ...getPaymentDefaultValues(),
      ...initialData
    },
    mode: 'onBlur'
  })

  const { handleSubmit, control, formState: { errors, isSubmitting }, watch, setValue, clearErrors } = form

  const watchAmount = watch('amount')

  // Validar valor do pagamento em tempo real
  useEffect(() => {
    if (watchAmount && watchAmount.trim()) {
      try {
        const numericValue = parseFloat(watchAmount.replace(/[R$\s.]/g, '').replace(',', '.'))
        const amountCents = Math.round(numericValue * 100)
        
        const validation = validatePaymentAmount(
          amountCents,
          invoice.remaining_amount_cents,
          isEditing
        )

        if (!validation.valid) {
          setCustomAmountError(validation.error || 'Valor inválido')
        } else {
          setCustomAmountError(null)
          clearErrors('amount')
        }
      } catch {
        // Ignore parsing errors, let Zod handle them
      }
    } else {
      setCustomAmountError(null)
    }
  }, [watchAmount, invoice.remaining_amount_cents, isEditing, clearErrors])

  const handleFormSubmit = async (data: PaymentFormData) => {
    // Validação final do valor
    try {
      const numericValue = parseFloat(data.amount.replace(/[R$\s.]/g, '').replace(',', '.'))
      const amountCents = Math.round(numericValue * 100)
      
      const validation = validatePaymentAmount(
        amountCents,
        invoice.remaining_amount_cents,
        isEditing
      )

      if (!validation.valid) {
        form.setError('amount', { message: validation.error || 'Valor inválido' })
        return
      }

      const formData = preparePaymentData(data, invoice.id)
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submit error:', error)
    }
  }

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0]
      setUploadedFile(file)
      form.setValue('receipt_file', file)
      
      // Create preview URL
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
    form.setValue('receipt_file', undefined as any)
  }

  const handleQuickAmount = (percentage: number) => {
    const amount = invoice.remaining_amount_cents * (percentage / 100)
    const formattedAmount = formatCurrency(Math.round(amount))
    setValue('amount', formattedAmount)
  }

  const getFileIcon = (file: File) => {
    const type = getReceiptType(file)
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />
      case 'jpg':
      case 'png':
        return <Image className="h-5 w-5 text-blue-600" />
      default:
        return <Receipt className="h-5 w-5 text-gray-600" />
    }
  }

  const isFormLoading = loading || isSubmitting || loadingMethods

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Header with Invoice Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">
              Nota Fiscal {invoice.series}/{invoice.number}
            </h4>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Valor Total</div>
              <div className="font-semibold">{formatCurrency(invoice.total_amount_cents)}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Fornecedor:</span>
              <div className="font-medium">{invoice.supplier?.name}</div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground">Valor Restante</div>
              <div className="font-semibold text-orange-600">
                {formatCurrency(invoice.remaining_amount_cents)}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <FormField
          control={control}
          name="payment_method_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Forma de Pagamento <span className="text-red-500">*</span>
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isFormLoading}
              >
                <FormControl>
                  <SelectTrigger className={errors.payment_method_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount with Quick Options */}
        <FormField
          control={control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Valor do Pagamento <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <CurrencyInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="R$ 0,00"
                    disabled={isFormLoading}
                    error={!!errors.amount || !!customAmountError}
                  />
                  
                  {/* Quick Amount Buttons */}
                  {!isEditing && invoice.remaining_amount_cents > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAmount(25)}
                        disabled={isFormLoading}
                      >
                        25%
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAmount(50)}
                        disabled={isFormLoading}
                      >
                        50%
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAmount(75)}
                        disabled={isFormLoading}
                      >
                        75%
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAmount(100)}
                        disabled={isFormLoading}
                      >
                        Total
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              {customAmountError ? (
                <div className="text-sm text-red-500">{customAmountError}</div>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />

        {/* Payment Date */}
        <FormField
          control={control}
          name="payment_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Data do Pagamento <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  disabled={isFormLoading}
                  className={errors.payment_date ? 'border-red-500' : ''}
                  min={getDateInputValue('2020-01-01')}
                  max={getDateInputValue(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Receipt Upload */}
        <FormField
          control={control}
          name="receipt_file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Comprovante de Pagamento <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {!uploadedFile ? (
                    <FileUpload
                      onFilesSelect={handleFileSelect}
                      accept={['.pdf', '.jpg', '.jpeg', '.png']}
                      maxSize={10 * 1024 * 1024} // 10MB
                      maxFiles={1}
                      disabled={isFormLoading}
                      className={errors.receipt_file ? 'border-red-500' : ''}
                    />
                  ) : (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded">
                            {getFileIcon(uploadedFile)}
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
                  placeholder="Observações sobre este pagamento..."
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
            disabled={isFormLoading || !!customAmountError}
            className="flex-1"
          >
            {isFormLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Salvando...' : 'Registrando...'}
              </>
            ) : (
              <>
                <Receipt className="mr-2 h-4 w-4" />
                {isEditing ? 'Salvar Alterações' : 'Registrar Pagamento'}
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