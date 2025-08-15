import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('deve renderizar o texto corretamente', () => {
    // Arrange & Act
    render(<Button>Clique aqui</Button>)
    
    // Assert
    expect(screen.getByRole('button', { name: 'Clique aqui' })).toBeInTheDocument()
  })

  it('deve aplicar variant padrão', () => {
    // Arrange & Act
    render(<Button>Botão</Button>)
    
    // Assert
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')
  })

  it('deve aplicar variant destructive', () => {
    // Arrange & Act
    render(<Button variant="destructive">Excluir</Button>)
    
    // Assert
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })

  it('deve aplicar size small', () => {
    // Arrange & Act
    render(<Button size="sm">Pequeno</Button>)
    
    // Assert
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-8')
  })

  it('deve ficar disabled quando disabled prop for true', () => {
    // Arrange & Act
    render(<Button disabled>Desabilitado</Button>)
    
    // Assert
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none')
  })

  it('deve executar onClick quando clicado', () => {
    // Arrange
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Clique</Button>)
    
    // Act
    fireEvent.click(screen.getByRole('button'))
    
    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('não deve executar onClick quando disabled', () => {
    // Arrange
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Clique</Button>)
    
    // Act
    fireEvent.click(screen.getByRole('button'))
    
    // Assert
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('deve renderizar com className customizada', () => {
    // Arrange & Act
    render(<Button className="custom-class">Botão</Button>)
    
    // Assert
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('deve funcionar como link quando asChild for true', () => {
    // Arrange & Act
    render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>
    )
    
    // Assert
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('bg-primary')
  })
})