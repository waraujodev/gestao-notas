'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useSuppliers } from '@/hooks/useSuppliers'
import { useToast } from '@/hooks/useToast'
import { isCNPJ, isCPF } from 'brazilian-values'

// Schema de validação
const supplierSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  document: z
    .string()
    .optional()
    .refine((doc) => {
      if (!doc || doc.trim() === '') return true
      const cleanDoc = doc.replace(/\D/g, '')
      return isCNPJ(cleanDoc) || isCPF(cleanDoc)
    }, 'Documento deve ser um CNPJ ou CPF válido'),
  email: z
    .string()
    .optional()
    .refine((email) => {
      if (!email || email.trim() === '') return true
      return z.string().email().safeParse(email).success
    }, 'Email deve ser válido'),
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true
      const cleanPhone = phone.replace(/\D/g, '')
      return cleanPhone.length >= 10 && cleanPhone.length <= 11
    }, 'Telefone deve ter 10 ou 11 dígitos'),
  status: z.boolean().default(true),
})

type SupplierFormData = z.infer<typeof supplierSchema>

interface SupplierFormProps {
  supplierId?: string | null
  onClose: () => void
}

export function SupplierForm({ supplierId, onClose }: SupplierFormProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(!!supplierId)
  
  const { createSupplier, updateSupplier, getSupplier } = useSuppliers()
  const toast = useToast()

  const form = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      document: '',
      email: '',
      phone: '',
      status: true,
    },
  })

  // Carregar dados do fornecedor se editando
  useEffect(() => {
    if (supplierId) {
      const loadSupplier = async () => {
        try {
          setLoadingData(true)
          const supplier = await getSupplier(supplierId)
          
          if (supplier) {
            form.reset({
              name: supplier.name,
              document: supplier.document || '',
              email: supplier.email || '',
              phone: supplier.phone || '',
              status: supplier.status,
            })
          }
        } catch (error) {
          toast.error('Erro ao carregar dados do fornecedor')
          onClose()
        } finally {
          setLoadingData(false)
        }
      }

      loadSupplier()
    }
  }, [supplierId, getSupplier, form, toast, onClose])

  const onSubmit = async (data: SupplierFormData) => {
    try {
      setLoading(true)
      
      // Limpar campos vazios
      const cleanData = {
        ...data,
        document: data.document?.replace(/\D/g, '') || undefined,
        email: data.email?.trim() || undefined,
        phone: data.phone?.replace(/\D/g, '') || undefined,
      }

      let success = false
      if (supplierId) {
        success = await updateSupplier(supplierId, cleanData)
      } else {
        success = await createSupplier(cleanData)
      }

      if (success) {
        onClose()
      }
    } catch (error) {
      toast.error('Erro ao salvar fornecedor')
    } finally {
      setLoading(false)
    }
  }

  const formatDocument = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    
    if (cleanValue.length <= 11) {
      // Formato CPF: 000.000.000-00
      return cleanValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    } else {
      // Formato CNPJ: 00.000.000/0000-00
      return cleanValue
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    }
  }

  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    
    if (cleanValue.length <= 10) {
      // Formato: (00) 0000-0000
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1')
    } else {
      // Formato: (00) 00000-0000
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1')
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
              {supplierId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </CardTitle>
            <CardDescription>
              {supplierId 
                ? 'Atualize as informações do fornecedor'
                : 'Adicione um novo fornecedor ao sistema'
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
                        placeholder="Nome do fornecedor"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Documento */}
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ/CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00.000.000/0000-00"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatDocument(e.target.value)
                          field.onChange(formatted)
                        }}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Telefone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value)
                          field.onChange(formatted)
                        }}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status - apenas para edição */}
            {supplierId && (
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
                    <FormLabel className="!mt-0">Fornecedor ativo</FormLabel>
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
                {supplierId ? 'Atualizar' : 'Criar'} Fornecedor
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}