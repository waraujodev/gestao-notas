'use client'

import { forwardRef, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: boolean
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value = '', onChange, placeholder = 'R$ 0,00', error, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('')

    // Formatação de valor para exibição
    const formatCurrency = (value: string): string => {
      // Remove tudo exceto números
      const numbers = value.replace(/\D/g, '')
      
      if (!numbers) return ''
      
      // Converte para número com 2 casas decimais
      const amount = parseInt(numbers, 10) / 100
      
      // Formata como moeda brasileira
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount)
    }

    // Extrai valor numérico para envio (formato: "1250.99")
    const extractValue = (formattedValue: string): string => {
      const numbers = formattedValue.replace(/\D/g, '')
      if (!numbers) return ''
      
      const amount = parseInt(numbers, 10) / 100
      return amount.toFixed(2)
    }

    // Sincronizar valor externo com display
    useEffect(() => {
      if (value !== extractValue(displayValue)) {
        if (!value) {
          setDisplayValue('')
        } else {
          // Converter valor de volta para formato de exibição
          const numericValue = parseFloat(value)
          if (!isNaN(numericValue)) {
            setDisplayValue(new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(numericValue))
          }
        }
      }
    }, [value, displayValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      // Se está apagando tudo
      if (!inputValue) {
        setDisplayValue('')
        onChange?.('')
        return
      }
      
      // Aplicar formatação
      const formatted = formatCurrency(inputValue)
      setDisplayValue(formatted)
      
      // Enviar valor numérico
      const numericValue = extractValue(formatted)
      onChange?.(numericValue)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Garantir formatação completa no blur
      if (displayValue && !displayValue.includes('R$')) {
        const formatted = formatCurrency(displayValue)
        setDisplayValue(formatted)
      }
      
      props.onBlur?.(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Opcional: remover formatação no foco para facilitar edição
      // setDisplayValue(displayValue.replace(/[^0-9,]/g, ''))
      
      props.onFocus?.(e)
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={cn(
          'text-right font-mono',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
      />
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'