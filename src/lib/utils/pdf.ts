import * as pdfjsLib from 'pdfjs-dist'

// Configurar worker do PDF.js para Next.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
}

/**
 * Configuração do PDF.js otimizada para Next.js 15+
 */
export const pdfConfig = {
  // Caminho do worker (será copiado para public/)
  workerSrc: '/pdf.worker.min.mjs',
  
  // Configurações de performance
  maxImageSize: 1024 * 1024, // 1MB por imagem
  disableFontFace: false,
  disableRange: false,
  disableStream: false,
  
  // Configurações de segurança
  isEvalSupported: false,
  
  // Configurações de cache
  useOnlyCssZoom: true,
  verbosity: 0, // Reduzir logs em produção
}

/**
 * Inicializar PDF.js com configurações otimizadas
 */
export function initializePdfJs() {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfConfig.workerSrc
  }
}

/**
 * Carregar documento PDF a partir de URL ou ArrayBuffer
 */
export async function loadPdfDocument(
  source: string | ArrayBuffer | Uint8Array,
  options?: {
    password?: string
    httpHeaders?: Record<string, string>
  }
) {
  const loadingTask = pdfjsLib.getDocument({
    url: typeof source === 'string' ? source : undefined,
    data: typeof source !== 'string' ? source : undefined,
    password: options?.password,
    httpHeaders: options?.httpHeaders,
    ...pdfConfig,
  })

  return await loadingTask.promise
}

/**
 * Obter informações básicas do PDF
 */
export async function getPdfInfo(
  source: string | ArrayBuffer | Uint8Array
): Promise<{
  numPages: number
  title?: string
  author?: string
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
  keywords?: string
  subject?: string
}> {
  try {
    const pdf = await loadPdfDocument(source)
    const metadata = await pdf.getMetadata()
    
    return {
      numPages: pdf.numPages,
      title: (metadata.info as any)?.Title,
      author: (metadata.info as any)?.Author,
      creator: (metadata.info as any)?.Creator,
      producer: (metadata.info as any)?.Producer,
      creationDate: (metadata.info as any)?.CreationDate,
      modificationDate: (metadata.info as any)?.ModDate,
      keywords: (metadata.info as any)?.Keywords,
      subject: (metadata.info as any)?.Subject,
    }
  } catch (error) {
    console.error('Erro ao obter informações do PDF:', error)
    throw new Error('Não foi possível carregar o PDF')
  }
}

/**
 * Renderizar página específica do PDF como Canvas
 */
export async function renderPdfPage(
  source: string | ArrayBuffer | Uint8Array,
  pageNumber: number = 1,
  options?: {
    scale?: number
    rotation?: number
    outputScale?: number
  }
): Promise<HTMLCanvasElement> {
  try {
    const pdf = await loadPdfDocument(source)
    const page = await pdf.getPage(pageNumber)
    
    const viewport = page.getViewport({
      scale: options?.scale || 1.0,
      rotation: options?.rotation || 0,
    })
    
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) {
      throw new Error('Não foi possível criar contexto do canvas')
    }
    
    const outputScale = options?.outputScale || window.devicePixelRatio || 1
    
    canvas.width = Math.floor(viewport.width * outputScale)
    canvas.height = Math.floor(viewport.height * outputScale)
    canvas.style.width = Math.floor(viewport.width) + 'px'
    canvas.style.height = Math.floor(viewport.height) + 'px'
    
    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined
    
    const renderContext = {
      canvasContext: context,
      transform,
      viewport,
      canvas,
    }
    
    await page.render(renderContext).promise
    
    return canvas
  } catch (error) {
    console.error('Erro ao renderizar página do PDF:', error)
    throw new Error('Não foi possível renderizar a página do PDF')
  }
}

/**
 * Validar se o arquivo é um PDF válido
 */
export async function validatePdfFile(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await loadPdfDocument(arrayBuffer)
    await pdf.getPage(1) // Tenta carregar primeira página
    return true
  } catch (error) {
    console.error('Arquivo PDF inválido:', error)
    return false
  }
}

/**
 * Extrair texto de uma página específica do PDF
 */
export async function extractTextFromPdf(
  source: string | ArrayBuffer | Uint8Array,
  pageNumber: number = 1
): Promise<string> {
  try {
    const pdf = await loadPdfDocument(source)
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    
    return textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .trim()
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error)
    throw new Error('Não foi possível extrair texto do PDF')
  }
}

/**
 * Gerar thumbnail do PDF (primeira página em baixa resolução)
 */
export async function generatePdfThumbnail(
  source: string | ArrayBuffer | Uint8Array,
  maxWidth: number = 200
): Promise<string> {
  try {
    const canvas = await renderPdfPage(source, 1, { scale: 0.5 })
    
    // Redimensionar se necessário
    if (canvas.width > maxWidth) {
      const scale = maxWidth / canvas.width
      const resizedCanvas = document.createElement('canvas')
      const ctx = resizedCanvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Erro ao criar contexto do canvas')
      }
      
      resizedCanvas.width = maxWidth
      resizedCanvas.height = canvas.height * scale
      
      ctx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height)
      
      return resizedCanvas.toDataURL('image/jpeg', 0.8)
    }
    
    return canvas.toDataURL('image/jpeg', 0.8)
  } catch (error) {
    console.error('Erro ao gerar thumbnail:', error)
    throw new Error('Não foi possível gerar thumbnail do PDF')
  }
}

/**
 * Tipos TypeScript para PDF.js
 */
export interface PdfDocumentInfo {
  numPages: number
  title?: string
  author?: string
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
  keywords?: string
  subject?: string
}

export interface PdfRenderOptions {
  scale?: number
  rotation?: number
  outputScale?: number
}

export interface PdfLoadOptions {
  password?: string
  httpHeaders?: Record<string, string>
}