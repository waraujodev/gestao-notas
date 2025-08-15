import { renderHook, waitFor } from '@testing-library/react'
import { useSuppliers } from '../useSuppliers'
import type { Supplier } from '@/types/supplier'

// Mock do Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

// Mock será configurado no jest.setup.js

describe('useSuppliers', () => {
  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'Fornecedor Teste',
      document: '12345678901',
      email: 'teste@teste.com',
      phone: '11999999999',
      status: true,
      user_id: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Outro Fornecedor',
      document: '12345678000195',
      email: 'outro@teste.com',
      phone: '11888888888',
      status: true,
      user_id: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  const mockSupabaseResponse = {
    suppliers: mockSuppliers,
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    },
  }

  beforeEach(() => {
    // Mock fetch global
    global.fetch = jest.fn()
    
    // Reset all mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('deve buscar fornecedores automaticamente ao montar', async () => {
    // Arrange
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSupabaseResponse,
    })

    // Act
    const { result } = renderHook(() => useSuppliers())

    // Assert
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/suppliers?')
    expect(result.current.suppliers).toEqual(mockSuppliers)
    expect(result.current.pagination.total).toBe(2)
    expect(result.current.error).toBeNull()
  })

  it('deve aplicar filtros corretamente', async () => {
    // Arrange
    const filters = {
      search: 'Teste',
      status: true,
      page: 1,
      limit: 10,
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSupabaseResponse,
    })

    // Act
    const { result } = renderHook(() => useSuppliers(filters))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/suppliers?search=Teste&status=true&page=1&limit=10'
    )
  })

  it('deve tratar erros da API', async () => {
    // Arrange
    const errorMessage = 'Erro ao carregar fornecedores'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    })

    // Act
    const { result } = renderHook(() => useSuppliers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Assert
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.suppliers).toEqual([])
  })

  it('não deve fazer fetch se auto_fetch for false', async () => {
    // Arrange & Act
    const { result } = renderHook(() => 
      useSuppliers({ auto_fetch: false })
    )

    // Assert
    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(true) // Estado inicial
  })

  it('deve permitir refetch manual', async () => {
    // Arrange
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSupabaseResponse,
    })

    // Act
    const { result } = renderHook(() => 
      useSuppliers({ auto_fetch: false })
    )

    // Act - refetch manual
    await result.current.refetch()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Assert
    expect(global.fetch).toHaveBeenCalledWith('/api/suppliers?')
    expect(result.current.suppliers).toEqual(mockSuppliers)
  })

  it('deve evitar duplas chamadas com mesmos filtros', async () => {
    // Arrange
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSupabaseResponse,
    })

    const filters = { page: 1, limit: 10 }

    // Act
    const { result, rerender } = renderHook((props) => 
      useSuppliers(props), 
      { initialProps: filters }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Rerender com mesmos filtros
    rerender(filters)

    // Assert
    expect(global.fetch).toHaveBeenCalledTimes(1) // Apenas uma chamada
  })

  it('deve fazer nova chamada quando filtros mudarem', async () => {
    // Arrange
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSupabaseResponse,
    })

    // Act
    const { result, rerender } = renderHook((props) => 
      useSuppliers(props), 
      { initialProps: { page: 1, limit: 10 } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Rerender com filtros diferentes
    rerender({ page: 2, limit: 10 })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    // Assert
    expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/suppliers?page=1&limit=10')
    expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/suppliers?page=2&limit=10')
  })
})