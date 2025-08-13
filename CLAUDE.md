# Sistema de Gestão de Notas Fiscais - Documentação do Projeto

## 🚀 Quick Reference - Comandos Frequentes

```bash
# Desenvolvimento
npm run dev        # Inicia servidor de desenvolvimento Next.js
npm run build      # Build para produção
npm run start      # Inicia aplicação em produção

# Qualidade de código
npm run lint       # ESLint + Next.js lint rules
npm run lint:fix   # Corrige problemas automaticamente
npm run type-check # Verifica tipos TypeScript (tsc --noEmit)
npm run format     # Prettier para formatação

# Testes (quando implementados)
npm run test       # Jest + Testing Library
npm run test:watch # Modo watch para desenvolvimento
npm run test:e2e   # Playwright para testes E2E

# Supabase 
npm run supabase:types  # Gera tipos TypeScript do banco
npm run db:migrate      # Aplica migrations no banco
npm run db:seed         # Popula banco com dados iniciais

# Cache e Performance
npm run cache:clear     # Limpa cache da aplicação
npm run analyze         # Analisa bundle size
```

**Scripts esperados no package.json:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "supabase:types": "supabase gen types typescript --local > types/supabase.ts",
    "db:migrate": "supabase migration up",
    "db:seed": "supabase seed run",
    "cache:clear": "rm -rf .next/cache && next dev --turbo",
    "analyze": "cross-env ANALYZE=true next build"
  }
}

---

## Visão Geral

Sistema web completo para cadastro e gestão de notas fiscais, desenvolvido para organizar informações financeiras e facilitar a consulta de comprovantes.

## Arquitetura

### Stack Tecnológica

**Frontend:**
- Next.js 15+ com App Router
- TypeScript 5+
- React 19+ + React DOM 19+
- Tailwind CSS 4+ + shadcn/ui
- React Hook Form 7+ + Zod 4+
- PDF.js para visualização de PDFs
- React Context + useState para gerenciamento de estado

**Backend:**
- Supabase como BaaS (PostgreSQL + Auth + Storage)
- @supabase/supabase-js 2+ + @supabase/ssr 0.6+
- Next.js 15+ API routes
- Row Level Security (RLS)

**Deploy:**
- Vercel (frontend)
- Supabase Cloud (backend)

### Funcionalidades Principais

1. **Autenticação**: Sistema completo com Supabase Auth
2. **Gestão de Fornecedores**: CRUD com validação CNPJ/CPF
3. **Formas de Pagamento**: Pré-cadastradas no sistema
4. **Notas Fiscais**: Upload PDF, múltiplos pagamentos, cálculo automático de status
5. **Dashboard**: Métricas e visualização de dados

## Setup Inicial

### Pré-requisitos

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Git** para controle de versão
- **Conta Supabase** (gratuita)
- **Conta Vercel** (gratuita)

### Obter Credenciais do Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Settings > API**
4. Copie as credenciais:
   - **Project URL**: `https://seuprojetoid.supabase.co`
   - **Anon public**: `eyJhbGci...` (chave pública)
   - **Service role**: `eyJhbGci...` (chave privada - CUIDADO!)

### Primeiro Setup

**⚠️ REGRA CRÍTICA: VERIFICAÇÃO DE VERSÕES**

**NUNCA, NUNCA, NUNCA** instalar pacotes usando `@latest` sem verificar compatibilidade!

**SEMPRE**:
1. Verificar versões atuais no package.json
2. Consultar documentação de compatibilidade 
3. Especificar versões exatas quando necessário
4. Testar compatibilidade antes de prosseguir

```bash
# 1. Clonar ou inicializar projeto (verifica versão Next.js antes)
npx create-next-app@15 gestao-notas --typescript --tailwind --app

# 2. Entrar na pasta
cd gestao-notas

# 3. Instalar dependências do Supabase (versões compatíveis testadas)
npm install @supabase/supabase-js@2 @supabase/ssr@0.6

# 4. Instalar shadcn/ui (verificar compatibilidade com React 19+)
npx shadcn@2 init

# 5. Instalar PDF.js e outras dependências essenciais
npm install pdfjs-dist react-hook-form@7 zod@4 @hookform/resolvers@5

# 6. Criar arquivo .env.local (nunca commitar!)
cp .env.example .env.local
```

## Configuração

### ⚠️ Importante: Ambiente de Desenvolvimento

**ATENÇÃO**: Este projeto utiliza **APENAS ambiente de PRODUÇÃO** no Supabase.

- **Não há ambiente de testes/HML** separado no Supabase
- **Todas as integrações** conectam diretamente ao banco de produção
- **Para testes** será utilizado um usuário específico tanto em:
  - Desenvolvimento local (`npm run dev`)
  - Deploy no Vercel (produção)

### Variáveis de Ambiente Necessárias

**Arquivo `.env.local`** (desenvolvimento):
```env
# Supabase - PRODUÇÃO (usado tanto local quanto Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://seuprojetoid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuração do ambiente
NODE_ENV=development
```

**Arquivo `.env.example`** (template para o repositório):
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Environment
NODE_ENV=development
```

**Variáveis no Vercel** (produção):
- Configurar as mesmas variáveis no dashboard do Vercel
- `VERCEL_ENV` é automático (preview/production)

### Banco de Dados (Supabase)

**Estrutura principal:**
- `suppliers` - Fornecedores
- `payment_methods` - Formas de pagamento
- `invoices` - Notas fiscais  
- `payments` - Pagamentos das notas
- `invoice_summary` - View com cálculos

**Isolamento de dados:**
- Row Level Security (RLS) garante que cada usuário vê apenas seus dados
- Usuário de teste terá seus próprios dados isolados
- Dados de produção protegidos por políticas RLS

### Validação CNPJ/CPF

**Biblioteca recomendada (verificar compatibilidade com React 19):**
```bash
# Verificar se @brazilian-utils é compatível com React 19+
npm install @brazilian-utils/cpf @brazilian-utils/cnpj
```

**Implementação com Zod (Schema atualizado):**
```typescript
import { cpf, cnpj } from '@brazilian-utils/cpf-cnpj'

// Schema para valores monetários (em centavos)
const moneySchema = z.number()
  .int("Valor deve ser inteiro")
  .positive("Valor deve ser positivo")
  .max(999999999999, "Valor muito alto"); // ~10 bilhões de centavos

const supplierSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório"),
  document: z.string()
    .transform(doc => doc.replace(/[^0-9]/g, '')) // Remove formatação
    .refine((doc) => cpf.isValid(doc) || cnpj.isValid(doc), {
      message: "CNPJ/CPF inválido"
    }),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string()
    .transform(phone => phone.replace(/[^0-9]/g, ''))
    .refine(phone => phone.length >= 10 && phone.length <= 11, {
      message: "Telefone inválido"
    }).optional().or(z.literal(""))
});

const invoiceSchema = z.object({
  series: z.string().trim().min(1, "Série obrigatória"),
  number: z.string().trim().min(1, "Número obrigatório"), 
  due_date: z.date(),
  total_amount_cents: moneySchema, // Valor em centavos
  supplier_id: z.string().uuid()
});

const paymentSchema = z.object({
  amount_cents: moneySchema, // Valor em centavos
  payment_date: z.date(),
  payment_method_id: z.string().uuid(),
  notes: z.string().optional()
});
```

**Formato de armazenamento corrigido:**
- **Documentos**: Apenas números no banco: `11122233000181`
- **Valores monetários**: Em centavos (bigint): `125099` = R$ 1.250,99
- **Formatação para exibição**: `11.122.233/0001-81` e `R$ 1.250,99`

**Utilitários para conversão:**
```typescript
// Converter centavos para reais
function centsToReal(cents: number): number {
  return cents / 100;
}

// Converter reais para centavos  
function realToCents(reais: number): number {
  return Math.round(reais * 100);
}

// Formatar valor para exibição
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(cents / 100);
}
```

### Configuração de Upload de Arquivos

**Storage Bucket no Supabase:**
```sql
-- Criar bucket para invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false);

-- Criar bucket para receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);
```

**Políticas de Storage:**
```sql
-- Política para invoices
CREATE POLICY "Users can upload invoices" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para receipts  
CREATE POLICY "Users can upload receipts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Estrutura de pastas:**
```
invoices/
  └── user_id/
      ├── 2025/
      │   ├── 01/
      │   └── 02/
      └── arquivo.pdf

receipts/
  └── user_id/
      ├── 2025/
      │   ├── 01/
      │   └── 02/
      └── comprovante.pdf
```

### Exemplos de Políticas RLS

**Fornecedores:**
```sql
-- Usuários veem apenas seus fornecedores
CREATE POLICY "Users can view own suppliers" ON suppliers
FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar fornecedores
CREATE POLICY "Users can create suppliers" ON suppliers
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Notas Fiscais:**
```sql
-- Usuários veem apenas suas notas
CREATE POLICY "Users can view own invoices" ON invoices
FOR SELECT USING (auth.uid() = user_id);

-- View com pagamentos também precisa de RLS
CREATE POLICY "Users can view own invoice summary" ON invoice_summary
FOR SELECT USING (auth.uid() = user_id);
```

### Estratégia de Cache

**Cache em múltiplas camadas para otimizar performance e reduzir custos do Supabase:**

#### 1. **Cache do Navegador (Browser Cache)**
```typescript
// Service Worker para cache de assets estáticos
// Cache de componentes React com SWR/React Query

// Exemplo com SWR para dados do dashboard
import useSWR from 'swr'

const { data: dashboardData, error } = useSWR(
  `/api/dashboard/${user.id}`,
  fetcher,
  {
    refreshInterval: 30000, // 30 segundos
    revalidateOnFocus: true,
    dedupingInterval: 10000 // 10 segundos de deduplicação
  }
)
```

#### 2. **Cache de Aplicação (Next.js)**
```typescript
// app/api/dashboard/[userId]/route.ts
import { unstable_cache } from 'next/cache'

export const getCachedDashboard = unstable_cache(
  async (userId: string) => {
    // Consulta otimizada ao Supabase
    const data = await supabase
      .from('invoice_summary_view')
      .select('*')
      .eq('user_id', userId)
    
    return data
  },
  ['dashboard'], // Cache key
  {
    revalidate: 300, // 5 minutos
    tags: ['dashboard', 'invoices'] // Para invalidação seletiva
  }
)

// Invalidação quando dados mudam
import { revalidateTag } from 'next/cache'

// Após criar/atualizar nota fiscal
revalidateTag('dashboard')
revalidateTag('invoices')
```

#### 3. **Cache do Banco (PostgreSQL)**
```sql
-- Materialized Views para consultas pesadas (dashboard)
CREATE MATERIALIZED VIEW mv_user_dashboard_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE payment_status = 'Pendente') as pending_count,
  COUNT(*) FILTER (WHERE payment_status = 'Atrasado') as overdue_count,
  SUM(total_amount_cents) FILTER (WHERE payment_status != 'Pago') as outstanding_amount_cents,
  SUM(paid_amount_cents) as total_paid_cents,
  COUNT(*) as total_invoices
FROM invoice_summary_function_results -- Via função otimizada
GROUP BY user_id;

-- Índice para acesso rápido
CREATE UNIQUE INDEX idx_mv_dashboard_user ON mv_user_dashboard_stats (user_id);

-- Função para refresh do cache
CREATE OR REPLACE FUNCTION refresh_dashboard_cache(p_user_id uuid DEFAULT NULL)
RETURNS void AS $$
BEGIN
  IF p_user_id IS NULL THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_dashboard_stats;
  ELSE
    -- Refresh seletivo seria via trigger ou job
    PERFORM pg_notify('dashboard_refresh', p_user_id::text);
  END IF;
END;
$$ LANGUAGE plpgsql;
```

#### 4. **Cache Distribuído (Redis/Upstash)**
```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export const cacheService = {
  // Cache de sessão do usuário
  async getUserSession(userId: string) {
    const cached = await redis.get(`user:${userId}:session`)
    if (cached) return cached
    
    // Buscar no Supabase e cachear por 1 hora
    const session = await getUserFromSupabase(userId)
    await redis.setex(`user:${userId}:session`, 3600, session)
    return session
  },

  // Cache de fornecedores (mudanças pouco frequentes)
  async getUserSuppliers(userId: string) {
    const cacheKey = `user:${userId}:suppliers`
    const cached = await redis.get(cacheKey)
    if (cached) return cached

    const suppliers = await getSuppliers(userId)
    await redis.setex(cacheKey, 1800, suppliers) // 30 minutos
    return suppliers
  },

  // Invalidação de cache
  async invalidateUserCache(userId: string) {
    const pattern = `user:${userId}:*`
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}
```

#### 5. **Cache de Assets (CDN)**
```typescript
// next.config.js
module.exports = {
  // Otimizações de build
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@brazilian-utils', 'date-fns']
  },
  
  // Headers para cache de assets
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60' // 5min cache
          }
        ]
      }
    ]
  }
}
```

#### 6. **Cache de Upload de Arquivos**
```typescript
// Otimização de uploads com presigned URLs
export const getPresignedUploadUrl = unstable_cache(
  async (userId: string, fileType: 'invoice' | 'receipt') => {
    const path = `${userId}/${fileType}s/${Date.now()}`
    const { data } = await supabase.storage
      .from(fileType === 'invoice' ? 'invoices' : 'receipts')
      .createSignedUploadUrl(path, {
        upsert: false
      })
    return data
  },
  ['presigned-url'],
  { revalidate: 300 } // URLs válidas por 5 minutos
)
```

#### 7. **Estratégias de Invalidação**
```typescript
// hooks/useCache.ts
export const useInvalidateCache = () => {
  const { mutate } = useSWRConfig()
  
  return {
    // Invalidar dashboard após criar nota
    invalidateDashboard: (userId: string) => {
      mutate(`/api/dashboard/${userId}`)
      mutate(`/api/invoices/${userId}`)
    },
    
    // Invalidar fornecedores após CRUD
    invalidateSuppliers: (userId: string) => {
      mutate(`/api/suppliers/${userId}`)
    },
    
    // Invalidação global
    invalidateAll: () => {
      mutate(() => true, undefined, { revalidate: true })
    }
  }
}

// Uso em componentes
const { invalidateDashboard } = useInvalidateCache()

const createInvoice = async (data) => {
  await createInvoiceAPI(data)
  invalidateDashboard(user.id) // Atualiza dashboard automaticamente
}
```

#### 8. **Monitoramento de Cache**
```typescript
// Métricas de cache para otimização
export const cacheMetrics = {
  hitRate: 0,
  missRate: 0,
  
  logHit(key: string) {
    this.hitRate++
    console.log(`Cache HIT: ${key}`)
  },
  
  logMiss(key: string) {
    this.missRate++
    console.log(`Cache MISS: ${key}`)
  },
  
  getStats() {
    const total = this.hitRate + this.missRate
    return {
      hitRate: total > 0 ? (this.hitRate / total * 100).toFixed(2) : 0,
      total
    }
  }
}
```

### Limites e Monitoramento

**Sistema completo para controlar custos e performance:**

#### 1. **Limites do Supabase (Plano Gratuito)**
```typescript
// config/limits.ts
export const SUPABASE_LIMITS = {
  // Limites mensais do plano gratuito
  storage: {
    maxBytes: 1024 * 1024 * 1024, // 1GB
    costPerGBAfter: 0.021 // $0.021/GB/mês
  },
  database: {
    maxBytes: 500 * 1024 * 1024, // 500MB
    costPerGBAfter: 0.0125 // $0.0125/GB/mês
  },
  bandwidth: {
    maxBytesMonth: 5 * 1024 * 1024 * 1024, // 5GB/mês
    costPerGBAfter: 0.09 // $0.09/GB
  },
  apiCalls: {
    maxCallsMonth: 500000, // 500K chamadas/mês
    costPerMillionAfter: 2.50 // $2.50/milhão
  },
  realtimeConnections: {
    maxConcurrent: 200
  }
}

// Cálculo de custo estimado
export const calculateMonthlyCost = (usage: UsageStats) => {
  let cost = 0
  
  // Storage excedente
  if (usage.storageBytes > SUPABASE_LIMITS.storage.maxBytes) {
    const excessGB = (usage.storageBytes - SUPABASE_LIMITS.storage.maxBytes) / (1024**3)
    cost += excessGB * SUPABASE_LIMITS.storage.costPerGBAfter
  }
  
  // Database excedente
  if (usage.databaseBytes > SUPABASE_LIMITS.database.maxBytes) {
    const excessGB = (usage.databaseBytes - SUPABASE_LIMITS.database.maxBytes) / (1024**3)
    cost += excessGB * SUPABASE_LIMITS.database.costPerGBAfter
  }
  
  return cost
}
```

#### 2. **Monitoramento de Uso em Tempo Real**
```typescript
// lib/monitoring.ts
import { createClient } from '@supabase/supabase-js'

export class UsageMonitor {
  private supabase = createClient(...)
  
  async getCurrentUsage(): Promise<UsageStats> {
    const [storageUsage, dbSize, apiCalls] = await Promise.all([
      this.getStorageUsage(),
      this.getDatabaseSize(),
      this.getAPICallsCount()
    ])
    
    return {
      storageBytes: storageUsage.totalBytes,
      databaseBytes: dbSize,
      apiCallsMonth: apiCalls,
      timestamp: new Date()
    }
  }
  
  async getStorageUsage() {
    // Consultar storage por bucket
    const { data: invoices } = await this.supabase.storage
      .from('invoices')
      .list()
    
    const { data: receipts } = await this.supabase.storage
      .from('receipts')
      .list()
    
    const totalBytes = [...(invoices || []), ...(receipts || [])]
      .reduce((sum, file) => sum + (file.metadata?.size || 0), 0)
    
    return { totalBytes, invoices: invoices?.length || 0, receipts: receipts?.length || 0 }
  }
  
  async getDatabaseSize() {
    const { data } = await this.supabase
      .rpc('get_database_size') // Função customizada
    
    return data || 0
  }
  
  async checkLimits(): Promise<LimitAlert[]> {
    const usage = await this.getCurrentUsage()
    const alerts: LimitAlert[] = []
    
    // Alerta de storage (80% do limite)
    if (usage.storageBytes > SUPABASE_LIMITS.storage.maxBytes * 0.8) {
      alerts.push({
        type: 'storage',
        level: usage.storageBytes > SUPABASE_LIMITS.storage.maxBytes * 0.95 ? 'critical' : 'warning',
        usage: usage.storageBytes,
        limit: SUPABASE_LIMITS.storage.maxBytes,
        message: `Storage em ${(usage.storageBytes / SUPABASE_LIMITS.storage.maxBytes * 100).toFixed(1)}%`
      })
    }
    
    return alerts
  }
}
```

#### 3. **Dashboard de Monitoramento**
```typescript
// components/MonitoringDashboard.tsx
export function MonitoringDashboard() {
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [alerts, setAlerts] = useState<LimitAlert[]>([])
  
  useEffect(() => {
    const monitor = new UsageMonitor()
    
    const checkUsage = async () => {
      const currentUsage = await monitor.getCurrentUsage()
      const currentAlerts = await monitor.checkLimits()
      
      setUsage(currentUsage)
      setAlerts(currentAlerts)
    }
    
    checkUsage()
    const interval = setInterval(checkUsage, 60000) // A cada minuto
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Cards de uso */}
      <UsageCard 
        title="Storage" 
        usage={usage?.storageBytes || 0}
        limit={SUPABASE_LIMITS.storage.maxBytes}
        unit="GB"
      />
      
      <UsageCard 
        title="Database" 
        usage={usage?.databaseBytes || 0}
        limit={SUPABASE_LIMITS.database.maxBytes}
        unit="MB"
      />
      
      {/* Alertas */}
      {alerts.map(alert => (
        <Alert key={alert.type} variant={alert.level}>
          {alert.message}
        </Alert>
      ))}
    </div>
  )
}
```

#### 4. **Controle de Quota por Usuário**
```sql
-- Tabela para controle de quota individual
CREATE TABLE user_quotas (
  user_id uuid REFERENCES auth.users(id) PRIMARY KEY,
  max_storage_bytes bigint DEFAULT 104857600, -- 100MB por usuário
  max_invoices integer DEFAULT 1000,
  max_suppliers integer DEFAULT 100,
  storage_used_bytes bigint DEFAULT 0,
  invoices_count integer DEFAULT 0,
  suppliers_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger para atualizar quotas automaticamente
CREATE OR REPLACE FUNCTION update_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  -- Após inserir arquivo, atualizar storage usado
  IF TG_TABLE_NAME = 'invoices' AND TG_OP = 'INSERT' THEN
    INSERT INTO user_quotas (user_id, storage_used_bytes, invoices_count)
    VALUES (NEW.user_id, NEW.pdf_size_bytes, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      storage_used_bytes = user_quotas.storage_used_bytes + NEW.pdf_size_bytes,
      invoices_count = user_quotas.invoices_count + 1,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quota_invoice_trigger
  AFTER INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_user_quota();
```

#### 5. **Alertas Proativos**
```typescript
// lib/alerting.ts
export class AlertingService {
  async sendQuotaAlert(userId: string, alert: LimitAlert) {
    // Email via Resend/SendGrid
    await this.sendEmail({
      to: await this.getUserEmail(userId),
      subject: `🚨 Alerta de Quota: ${alert.type}`,
      template: 'quota-alert',
      data: { alert }
    })
    
    // Notificação in-app
    await this.createNotification(userId, {
      type: 'quota_alert',
      title: 'Limite de uso atingido',
      message: alert.message,
      severity: alert.level
    })
  }
  
  async checkAndAlert() {
    const monitor = new UsageMonitor()
    const alerts = await monitor.checkLimits()
    
    for (const alert of alerts) {
      // Buscar usuários afetados
      const affectedUsers = await this.getAffectedUsers(alert)
      
      for (const userId of affectedUsers) {
        await this.sendQuotaAlert(userId, alert)
      }
    }
  }
}

// Cron job para verificação periódica
// vercel.json ou similar
{
  "crons": [
    {
      "path": "/api/cron/check-quotas",
      "schedule": "0 */6 * * *"  // A cada 6 horas
    }
  ]
}
```

#### 6. **Performance Monitoring**
```typescript
// lib/performance.ts
export class PerformanceMonitor {
  static trackQuery(queryName: string, duration: number) {
    // Métricas para identificar queries lentas
    if (duration > 1000) { // > 1 segundo
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`)
      
      // Enviar para serviço de monitoring (Sentry, DataDog, etc.)
      this.reportSlowQuery(queryName, duration)
    }
  }
  
  static async measureQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
    const start = Date.now()
    try {
      const result = await queryFn()
      const duration = Date.now() - start
      this.trackQuery(queryName, duration)
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.trackQuery(`${queryName}:error`, duration)
      throw error
    }
  }
}

// Uso nas APIs
export async function GET(request: Request) {
  return PerformanceMonitor.measureQuery('dashboard-data', async () => {
    const data = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
    
    return Response.json(data)
  })
}
```

#### 7. **Health Checks**
```typescript
// app/api/health/route.ts
export async function GET() {
  const healthChecks = await Promise.allSettled([
    // Teste de conexão com Supabase
    supabase.from('suppliers').select('count').limit(1),
    
    // Teste de Storage
    supabase.storage.from('invoices').list('', { limit: 1 }),
    
    // Teste de Auth
    supabase.auth.getSession(),
    
    // Teste de cache (se usando Redis)
    redis?.ping()
  ])
  
  const results = healthChecks.map((check, index) => ({
    service: ['database', 'storage', 'auth', 'cache'][index],
    status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
    error: check.status === 'rejected' ? check.reason.message : null
  }))
  
  const allHealthy = results.every(r => r.status === 'healthy')
  
  return Response.json({
    status: allHealthy ? 'healthy' : 'degraded',
    checks: results,
    timestamp: new Date().toISOString()
  }, {
    status: allHealthy ? 200 : 503
  })
}
```

#### 8. **Backup e Recovery**
```sql
-- Backup automático via função PostgreSQL
CREATE OR REPLACE FUNCTION backup_user_data(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  backup_data jsonb;
BEGIN
  SELECT jsonb_build_object(
    'user_id', p_user_id,
    'backup_date', now(),
    'suppliers', (
      SELECT jsonb_agg(to_jsonb(s)) 
      FROM suppliers s 
      WHERE s.user_id = p_user_id
    ),
    'invoices', (
      SELECT jsonb_agg(to_jsonb(i)) 
      FROM invoices i 
      WHERE i.user_id = p_user_id
    ),
    'payments', (
      SELECT jsonb_agg(to_jsonb(p)) 
      FROM payments p 
      WHERE p.user_id = p_user_id
    )
  ) INTO backup_data;
  
  -- Salvar backup em tabela dedicada
  INSERT INTO user_backups (user_id, backup_data, created_at)
  VALUES (p_user_id, backup_data, now());
  
  RETURN backup_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabela para backups
CREATE TABLE user_backups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  backup_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
```


## Convenções de Commit

### Formato Conventional Commits

Usar o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos de Commit

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat:` | Nova funcionalidade | `feat: adiciona endpoint de consulta de saldo` |
| `fix:` | Correção de bug | `fix: corrige erro de autenticação no token JWT` |
| `docs:` | Apenas documentação | `docs: atualiza README com instruções de deploy` |
| `style:` | Formatação (não afeta lógica) | `style: formata código seguindo padrão do projeto` |
| `refactor:` | Refatoração sem mudança de funcionalidade | `refactor: extrai método de validação para classe utilitária` |
| `test:` | Adição ou correção de testes | `test: adiciona testes unitários para AuthFilter` |
| `chore:` | Tarefas de manutenção | `chore: atualiza dependências do Spring Boot` |
| `perf:` | Melhoria de performance | `perf: otimiza consulta de clientes com cache` |
| `ci:` | Mudanças em CI/CD | `ci: adiciona workflow de deploy automático` |
| `build:` | Mudanças no build ou dependências | `build: adiciona plugin do Maven para relatórios` |
| `revert:` | Reverter commit anterior | `revert: reverte commit abc123` |

### Exemplos de Boas Mensagens

#### ✅ BOAS mensagens de commit:
```bash
# Feature nova
feat: implementa sistema de cache para rotas protegidas

# Correção
fix: corrige vazamento de memória no AuthFilter

# Documentação
docs: adiciona guia de deploy com GitHub Actions

# Refatoração
refactor: simplifica lógica de validação de token

# Manutenção
chore: prepare release v1.5.29

# Com escopo
feat(auth): adiciona suporte a refresh token

# Com breaking change
feat!: remove suporte a versão antiga da API

BREAKING CHANGE: endpoints v1 foram removidos
```

#### ❌ EVITAR:
```bash
# Muito genérico
fix: correção

# Sem contexto
update files

# Com informações de IA
feat: adiciona nova rota

Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>

# Misturando mudanças
fix: corrige bug e adiciona feature

# Muito longo no título
feat: implementa sistema completo de autenticação com JWT incluindo refresh token e blacklist
```

### Regras IMPORTANTES

1. **NUNCA incluir no commit**:
   - `Generated with Claude Code`
   - `Co-Authored-By: Claude`
   - Qualquer referência a IA ou assistentes
   - Emojis (a menos que seja padrão do projeto)

2. **Sempre incluir**:
   - Tipo de mudança (feat, fix, etc.)
   - Descrição clara e concisa
   - Contexto quando necessário

3. **Dicas para boas mensagens**:
   - Use imperativo: "adiciona" não "adicionado"
   - Máximo 50 caracteres no título
   - Linha em branco entre título e corpo
   - Explique o "por quê" no corpo, não o "como"

### Geração de Mensagens de Commit

**IMPORTANTE**: Quando solicitado para gerar uma mensagem de commit, forneça APENAS o texto da mensagem, sem o comando `git commit`. O usuário fará o commit pelo IntelliJ IDEA.

#### Formato da resposta:

```
fix: corrige inconsistência de variáveis de ambiente

- Remove valores padrão de todas as variáveis
- Corrige SPRING_PROFILE vs SPRING_PROFILES_ACTIVE
- Atualiza documentação com valores corretos

Todas as variáveis agora são obrigatórias e devem ser
definidas explicitamente no GitHub Secrets.
```

**NÃO incluir**: `git commit -m`, aspas ou comandos shell. Apenas o texto puro da mensagem.

## Convenções de Documentação

### Estrutura da Pasta docs/

Toda documentação técnica deve ser colocada na pasta `docs/` seguindo o padrão de nomenclatura: `TIPO_AAAAMMDD_HHMMSS_DESCRICAO.md`

#### Tipos de Documentos:
- **FIX** - Correções e soluções de bugs
- **GUIDE** - Guias e tutoriais  
- **HIST** - Históricos e registros
- **IMPL** - Implementações de funcionalidades
- **MIGR** - Migrações e atualizações
- **PLAN** - Planos e roadmaps
- **SPEC** - Especificações técnicas e arquiteturas

#### Regras para Documentação:
1. Descrições sempre em português (sem acentos)
2. Use underscore para separar palavras
3. Use o comando `date` para obter data/hora atuais
4. Atualize o README.md da pasta docs quando necessário
