'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { useToast } from '@/hooks/useToast'

// Schema de validação
const paymentMethodSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  description: z
    .string()
    .optional(),
  status: z.boolean().default(true),
  display_order: z
    .number()
    .int('Ordem deve ser um número inteiro')
    .min(0, 'Ordem deve ser um número positivo')
    .default(0),
})

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>

interface PaymentMethodFormProps {
  paymentMethodId?: string | null
  onClose: () => void
}

export function PaymentMethodForm({ paymentMethodId, onClose }: PaymentMethodFormProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(!!paymentMethodId)
  
  const { createPaymentMethod, updatePaymentMethod, getPaymentMethod } = usePaymentMethods()
  const toast = useToast()

  const form = useForm({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: '',
      description: '',
      status: true,
      display_order: 0,
    },
  })

  // Carregar dados da forma de pagamento se editando
  useEffect(() => {
    if (paymentMethodId) {
      const loadPaymentMethod = async () => {
        try {
          setLoadingData(true)
          const paymentMethod = await getPaymentMethod(paymentMethodId)
          
          if (paymentMethod) {
            // Verificar se é um método do sistema
            if (paymentMethod.is_system_default || paymentMethod.user_id === null) {
              toast.error('Não é possível editar formas de pagamento do sistema')
              onClose()
              return
            }

            form.reset({
              name: paymentMethod.name,
              description: paymentMethod.description || '',
              status: paymentMethod.status,
              display_order: paymentMethod.display_order,
            })
          }
        } catch (error) {
          toast.error('Erro ao carregar dados da forma de pagamento')
          onClose()
        } finally {
          setLoadingData(false)
        }
      }

      loadPaymentMethod()
    }
  }, [paymentMethodId, getPaymentMethod, form, toast, onClose])

  const onSubmit = async (data: PaymentMethodFormData) => {
    try {
      setLoading(true)
      
      // Limpar campos vazios
      const cleanData = {
        ...data,
        description: data.description?.trim() || undefined,
      }

      let success = false
      if (paymentMethodId) {
        success = await updatePaymentMethod(paymentMethodId, cleanData)
      } else {
        success = await createPaymentMethod(cleanData)
      }

      if (success) {
        onClose()
      }
    } catch (error) {
      toast.error('Erro ao salvar forma de pagamento')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>
              {paymentMethodId ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
            </CardTitle>
            <CardDescription>
              {paymentMethodId 
                ? 'Atualize as informações da forma de pagamento'
                : 'Adicione uma nova forma de pagamento personalizada'
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome da forma de pagamento"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ordem de Exibição */}
              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem de Exibição</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição opcional da forma de pagamento"
                      rows={3}
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status - apenas para edição */}
            {paymentMethodId && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={loading}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Forma de pagamento ativa</FormLabel>
                  </FormItem>
                )}
              />
            )}

            {/* Ações */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {paymentMethodId ? 'Atualizar' : 'Criar'} Forma de Pagamento
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}