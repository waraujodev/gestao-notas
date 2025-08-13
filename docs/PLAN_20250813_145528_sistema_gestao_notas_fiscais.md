# PROMPT: Sistema de Gestão de Notas Fiscais

Desenvolva um sistema web completo para cadastro e gestão de notas fiscais utilizando a seguinte stack tecnológica:

## Stack Tecnológica

**Frontend:**
- Next.js 15+ com App Router
- TypeScript 5+
- React 19+ + React DOM 19+
- Tailwind CSS 4+ + shadcn/ui para componentes UI
- React Hook Form 7+ + Zod 4+ para formulários e validação
- PDF.js para visualização de PDFs (substituindo react-pdf)
- React Context + useState para gerenciamento de estado (removido Zustand)

**Backend:**
- Supabase como BaaS (PostgreSQL + Auth + Storage)
- @supabase/supabase-js 2+ + @supabase/ssr 0.6+
- Next.js 15+ API routes para validações e lógicas específicas
- Row Level Security (RLS) configurado

**Deploy:**
- Vercel para o frontend
- Supabase Cloud para backend

## Objetivo do Sistema

Criar uma ferramenta eficiente para organizar informações financeiras e facilitar a consulta de comprovantes de notas fiscais, com interface simples e intuitiva.

## Funcionalidades Principais

### 1. Sistema de Autenticação
- Login/registro com email e senha via Supabase Auth
- Recuperação de senha
- Proteção de rotas privadas
- Persistência de sessão

### 2. Gestão de Fornecedores (CRUD)
**Campos obrigatórios:**
- Nome/Razão Social
- CNPJ/CPF (com validação)
- Email
- Telefone
- Status (Ativo/Inativo)

**Funcionalidades:**
- Listagem com busca e filtros
- Formulário de cadastro/edição
- Exclusão lógica
- Validação de duplicatas

### 3. Gestão de Formas de Pagamento (CRUD)
**Formas pré-cadastradas no sistema:**
- Dinheiro
- PIX  
- Cartão de Débito
- Cartão de Crédito
- Boleto Bancário
- Transferência Bancária
- Cheque

**Campos:**
- Nome da forma de pagamento
- Descrição (opcional)
- Status (Ativo/Inativo)

### 4. Gestão de Notas Fiscais (Funcionalidade Principal)

#### Campos da Nota Fiscal:
- **Data de Vencimento** (obrigatório, date picker)
- **Valor Total** (obrigatório, formato monetário R$)
- **Série da Nota** (obrigatório, texto)
- **Número da Nota** (obrigatório, texto)
- **Fornecedor** (obrigatório, select com busca)
- **Arquivo da Nota Fiscal** (obrigatório, upload PDF)
- **Status do Pagamento** (calculado automaticamente):
  - "Pendente" - quando valor pago = 0
  - "Pago Parcial" - quando 0 < valor pago < valor total  
  - "Pago" - quando valor pago = valor total
  - "Atrasado" - quando data vencimento passou e status ≠ "Pago"

#### Sistema de Múltiplos Pagamentos (1:N):
Cada nota fiscal pode ter vários pagamentos associados.

**Campos de cada Pagamento:**
- **Valor do Pagamento** (obrigatório, não pode exceder valor restante)
- **Data do Pagamento** (obrigatório, date picker)
- **Forma de Pagamento** (obrigatório, select)
- **Comprovante** (obrigatório, upload PDF ou imagem)
- **Observações** (opcional, textarea)

**Lógica de Cálculo:**
- Valor Total Pago = soma de todos os pagamentos da nota
- Valor Restante = valor total - valor pago
- Status atualizado automaticamente após cada pagamento
- Validação: impedir pagamentos que ultrapassem o valor restante

## Estrutura do Banco de Dados (Supabase)

### Tabelas necessárias:

```sql
-- ============================================================================
-- SCHEMA CORRIGIDO COM TIPOS ADEQUADOS E OTIMIZAÇÕES
-- ============================================================================

-- Fornecedores
CREATE TABLE suppliers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  document text CHECK (length(regexp_replace(document, '[^0-9]', '', 'g')) BETWEEN 11 AND 14), -- CNPJ/CPF apenas números
  email text CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone text CHECK (length(regexp_replace(phone, '[^0-9]', '', 'g')) BETWEEN 10 AND 11),
  status boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints para integridade
  UNIQUE(user_id, document),  -- Evita CNPJ/CPF duplicado por usuário
  UNIQUE(user_id, name)       -- Evita nome duplicado por usuário
);

-- Formas de pagamento (otimizada)
CREATE TABLE payment_methods (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL para métodos do sistema
  name text NOT NULL CHECK (length(trim(name)) > 0),
  description text,
  status boolean DEFAULT true NOT NULL,
  is_system_default boolean DEFAULT false NOT NULL,
  display_order integer DEFAULT 0 NOT NULL,  -- Para ordenação customizada
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints
  UNIQUE(user_id, name),  -- Nome único por usuário (NULL para sistema)
  CHECK ((user_id IS NULL AND is_system_default = true) OR (user_id IS NOT NULL AND is_system_default = false))
);

-- Notas fiscais (tipos corrigidos)
CREATE TABLE invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE RESTRICT NOT NULL,
  
  -- Dados da nota fiscal
  series text NOT NULL CHECK (length(trim(series)) > 0),
  number text NOT NULL CHECK (length(trim(number)) > 0),
  due_date date NOT NULL CHECK (due_date >= '2020-01-01' AND due_date <= CURRENT_DATE + INTERVAL '10 years'),
  
  -- VALOR EM CENTAVOS (bigint) - Corrige problema de precisão decimal
  total_amount_cents bigint NOT NULL CHECK (total_amount_cents > 0),
  
  -- Metadados
  pdf_path text NOT NULL CHECK (pdf_path ~ '^[a-f0-9-]+/invoices/'),  -- Valida formato do path
  pdf_size_bytes bigint CHECK (pdf_size_bytes > 0 AND pdf_size_bytes <= 10485760), -- Max 10MB
  
  -- Auditoria
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints para integridade
  UNIQUE(user_id, supplier_id, series, number),  -- Evita nota duplicada
  
  -- Índices inline para performance
  INDEX (user_id, due_date),
  INDEX (user_id, created_at),
  INDEX (supplier_id)
);

-- Pagamentos (tipos corrigidos)
CREATE TABLE payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  payment_method_id uuid REFERENCES payment_methods(id) ON DELETE RESTRICT NOT NULL,
  
  -- VALOR EM CENTAVOS (bigint) - Corrige problema de precisão decimal
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  
  payment_date date NOT NULL CHECK (payment_date >= '2020-01-01' AND payment_date <= CURRENT_DATE + INTERVAL '30 days'),
  
  -- Comprovante
  receipt_path text NOT NULL CHECK (receipt_path ~ '^[a-f0-9-]+/receipts/'),  -- Valida formato do path
  receipt_size_bytes bigint CHECK (receipt_size_bytes > 0 AND receipt_size_bytes <= 10485760), -- Max 10MB
  receipt_type text CHECK (receipt_type IN ('pdf', 'jpg', 'png')) DEFAULT 'pdf',
  
  -- Observações e metadados
  notes text,
  
  -- Auditoria
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Índices inline para performance
  INDEX (invoice_id),
  INDEX (user_id, payment_date),
  INDEX (user_id, created_at)
);

-- ============================================================================
-- TRIGGERS PARA MANUTENÇÃO AUTOMÁTICA
-- ============================================================================

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em tabelas que precisam
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNÇÃO PARA CÁLCULOS DE STATUS (Substituindo a View problemática)
-- ============================================================================

-- Função otimizada para calcular status e valores da nota fiscal
CREATE OR REPLACE FUNCTION calculate_invoice_summary(p_invoice_id uuid, p_user_id uuid)
RETURNS TABLE (
  invoice_id uuid,
  total_amount_cents bigint,
  paid_amount_cents bigint,
  remaining_amount_cents bigint,
  payment_status text,
  is_overdue boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER  -- Executa com privilégios da função
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id as invoice_id,
    i.total_amount_cents,
    COALESCE(p.total_paid_cents, 0) as paid_amount_cents,
    (i.total_amount_cents - COALESCE(p.total_paid_cents, 0)) as remaining_amount_cents,
    CASE 
      WHEN COALESCE(p.total_paid_cents, 0) = 0 AND i.due_date < CURRENT_DATE THEN 'Atrasado'
      WHEN COALESCE(p.total_paid_cents, 0) = 0 THEN 'Pendente'  
      WHEN COALESCE(p.total_paid_cents, 0) >= i.total_amount_cents THEN 'Pago'
      ELSE 'Pago Parcial'
    END as payment_status,
    (i.due_date < CURRENT_DATE AND COALESCE(p.total_paid_cents, 0) < i.total_amount_cents) as is_overdue
  FROM invoices i
  LEFT JOIN (
    SELECT 
      invoice_id, 
      SUM(amount_cents) as total_paid_cents
    FROM payments 
    WHERE user_id = p_user_id  -- Filtro de segurança
    GROUP BY invoice_id
  ) p ON i.id = p.invoice_id
  WHERE i.id = p_invoice_id 
    AND i.user_id = p_user_id;  -- Segurança RLS
END;
$$;

-- ============================================================================
-- INSERÇÃO DAS FORMAS DE PAGAMENTO PRÉ-CADASTRADAS
-- ============================================================================

-- Formas de pagamento do sistema (is_system_default = true, user_id = NULL)
INSERT INTO payment_methods (user_id, name, description, is_system_default, display_order) VALUES
(NULL, 'Dinheiro', 'Pagamento em espécie', true, 1),
(NULL, 'PIX', 'Transferência instantânea via PIX', true, 2),
(NULL, 'Cartão de Débito', 'Pagamento com cartão de débito', true, 3),
(NULL, 'Cartão de Crédito', 'Pagamento com cartão de crédito', true, 4),
(NULL, 'Boleto Bancário', 'Boleto para pagamento em bancos', true, 5),
(NULL, 'Transferência Bancária', 'TED/DOC bancário', true, 6),
(NULL, 'Cheque', 'Pagamento via cheque', true, 7)
ON CONFLICT DO NOTHING;  -- Evita erro se já existirem

-- ============================================================================
-- ÍNDICES CRÍTICOS PARA PERFORMANCE
-- ============================================================================

-- Índices para suppliers (otimiza listagem e busca)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_user_status 
ON suppliers (user_id, status) 
WHERE status = true;  -- Índice parcial para fornecedores ativos

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_user_name 
ON suppliers (user_id, name);  -- Para busca por nome

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_document 
ON suppliers USING gin (document gin_trgm_ops);  -- Para busca fuzzy em documentos

-- Índices para payment_methods (otimiza seleção em formulários)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_methods_system_active 
ON payment_methods (is_system_default, status, display_order) 
WHERE status = true;  -- Para métodos do sistema ativos

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_methods_user_active 
ON payment_methods (user_id, status, display_order) 
WHERE user_id IS NOT NULL AND status = true;  -- Para métodos do usuário

-- Índices para invoices (CRÍTICOS para performance do dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_due_date 
ON invoices (user_id, due_date DESC);  -- Dashboard: próximas a vencer

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_created 
ON invoices (user_id, created_at DESC);  -- Listagem por data de criação

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_supplier_date 
ON invoices (supplier_id, created_at DESC);  -- Notas por fornecedor

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_search 
ON invoices (user_id, series, number);  -- Busca por série/número

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_overdue 
ON invoices (user_id, due_date) 
WHERE due_date < CURRENT_DATE;  -- Índice parcial para notas em atraso

-- Índices para payments (CRÍTICOS para cálculos de status)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_invoice_amount 
ON payments (invoice_id, amount_cents);  -- Para SUM() otimizada

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_user_date 
ON payments (user_id, payment_date DESC);  -- Histórico de pagamentos

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_user_month 
ON payments (user_id, date_trunc('month', payment_date));  -- Relatórios mensais

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_method_stats 
ON payments (payment_method_id, user_id, payment_date);  -- Estatísticas por método

-- ============================================================================
-- ÍNDICES COMPOSTOS PARA CONSULTAS COMPLEXAS DO DASHBOARD
-- ============================================================================

-- Para consulta "notas pendentes por fornecedor"
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_pending_by_supplier 
ON invoices (user_id, supplier_id, due_date) 
INCLUDE (total_amount_cents, series, number);

-- Para consulta "valor total pago no mês por usuário" 
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_monthly_totals 
ON payments (user_id, date_trunc('month', payment_date)) 
INCLUDE (amount_cents);

-- Para consulta "notas por status" (precisa de função calculada)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_status_calc 
ON invoices (user_id, due_date, total_amount_cents);

-- ============================================================================
-- ESTATÍSTICAS AUTOMÁTICAS PARA O POSTGRESQL
-- ============================================================================

-- Força atualização de estatísticas para otimização do query planner
ANALYZE suppliers;
ANALYZE payment_methods; 
ANALYZE invoices;
ANALYZE payments;
```

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS COMPLETAS
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;  
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS PARA SUPPLIERS
-- ============================================================================

-- SELECT: Usuários veem apenas seus fornecedores
CREATE POLICY "suppliers_select_own" ON suppliers
FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Usuários podem criar fornecedores para si mesmos
CREATE POLICY "suppliers_insert_own" ON suppliers  
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuários podem atualizar apenas seus fornecedores
CREATE POLICY "suppliers_update_own" ON suppliers
FOR UPDATE USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários podem deletar apenas seus fornecedores (soft delete preferido)
CREATE POLICY "suppliers_delete_own" ON suppliers
FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- POLÍTICAS PARA PAYMENT_METHODS
-- ============================================================================

-- SELECT: Usuários veem métodos do sistema + seus próprios métodos
CREATE POLICY "payment_methods_select" ON payment_methods
FOR SELECT USING (
  user_id IS NULL OR  -- Métodos do sistema (disponíveis para todos)
  auth.uid() = user_id  -- Métodos próprios do usuário
);

-- INSERT: Usuários podem criar métodos apenas para si mesmos
CREATE POLICY "payment_methods_insert_own" ON payment_methods
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND  -- Apenas para si mesmo
  is_system_default = false  -- Não pode criar métodos do sistema
);

-- UPDATE: Usuários podem atualizar apenas seus métodos (não os do sistema)
CREATE POLICY "payment_methods_update_own" ON payment_methods  
FOR UPDATE USING (
  auth.uid() = user_id AND 
  user_id IS NOT NULL  -- Não pode editar métodos do sistema
) WITH CHECK (
  auth.uid() = user_id AND
  is_system_default = false  -- Não pode tornar método próprio em sistema
);

-- DELETE: Usuários podem deletar apenas seus métodos
CREATE POLICY "payment_methods_delete_own" ON payment_methods
FOR DELETE USING (
  auth.uid() = user_id AND 
  user_id IS NOT NULL  -- Não pode deletar métodos do sistema
);

-- ============================================================================
-- POLÍTICAS PARA INVOICES  
-- ============================================================================

-- SELECT: Usuários veem apenas suas notas fiscais
CREATE POLICY "invoices_select_own" ON invoices
FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Usuários podem criar notas apenas para si mesmos
CREATE POLICY "invoices_insert_own" ON invoices
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  -- Validar que o supplier pertence ao usuário
  EXISTS (
    SELECT 1 FROM suppliers s 
    WHERE s.id = supplier_id AND s.user_id = auth.uid()
  )
);

-- UPDATE: Usuários podem atualizar apenas suas notas
CREATE POLICY "invoices_update_own" ON invoices
FOR UPDATE USING (auth.uid() = user_id) 
WITH CHECK (
  auth.uid() = user_id AND
  -- Validar que o supplier ainda pertence ao usuário
  EXISTS (
    SELECT 1 FROM suppliers s 
    WHERE s.id = supplier_id AND s.user_id = auth.uid()
  )
);

-- DELETE: Usuários podem deletar apenas suas notas
CREATE POLICY "invoices_delete_own" ON invoices
FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- POLÍTICAS PARA PAYMENTS
-- ============================================================================

-- SELECT: Usuários veem apenas seus pagamentos
CREATE POLICY "payments_select_own" ON payments
FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Usuários podem criar pagamentos apenas para suas notas
CREATE POLICY "payments_insert_own" ON payments
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  -- Validar que a invoice pertence ao usuário
  EXISTS (
    SELECT 1 FROM invoices i 
    WHERE i.id = invoice_id AND i.user_id = auth.uid()
  ) AND
  -- Validar que o payment_method é acessível ao usuário
  EXISTS (
    SELECT 1 FROM payment_methods pm 
    WHERE pm.id = payment_method_id AND 
    (pm.user_id = auth.uid() OR pm.user_id IS NULL)
  )
);

-- UPDATE: Usuários podem atualizar apenas seus pagamentos
CREATE POLICY "payments_update_own" ON payments
FOR UPDATE USING (auth.uid() = user_id) 
WITH CHECK (
  auth.uid() = user_id AND
  -- Validar que ainda pertence à invoice do usuário
  EXISTS (
    SELECT 1 FROM invoices i 
    WHERE i.id = invoice_id AND i.user_id = auth.uid()
  )
);

-- DELETE: Usuários podem deletar apenas seus pagamentos
CREATE POLICY "payments_delete_own" ON payments
FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- POLÍTICAS ESPECIAIS PARA STORAGE
-- ============================================================================

-- Política para uploads de invoices
CREATE POLICY "invoices_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'invoices' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]  -- Primeira parte do path é user_id
);

-- Política para acessar invoices
CREATE POLICY "invoices_select_storage" ON storage.objects  
FOR SELECT USING (
  bucket_id = 'invoices' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Política para deletar invoices
CREATE POLICY "invoices_delete_storage" ON storage.objects
FOR DELETE USING (
  bucket_id = 'invoices' AND  
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Política para uploads de receipts  
CREATE POLICY "receipts_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Política para acessar receipts
CREATE POLICY "receipts_select_storage" ON storage.objects
FOR SELECT USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]  
);

-- Política para deletar receipts
CREATE POLICY "receipts_delete_storage" ON storage.objects
FOR DELETE USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- ============================================================================
-- FUNÇÃO DE SEGURANÇA PARA VALIDAÇÃO CRUZADA
-- ============================================================================

-- Função para validar se pagamento não excede valor restante da nota
CREATE OR REPLACE FUNCTION validate_payment_amount()
RETURNS TRIGGER AS $$
DECLARE
  invoice_total_cents bigint;
  payments_total_cents bigint;
  remaining_cents bigint;
BEGIN
  -- Buscar valor total da nota
  SELECT total_amount_cents INTO invoice_total_cents
  FROM invoices 
  WHERE id = NEW.invoice_id AND user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice not found or access denied';
  END IF;
  
  -- Calcular total já pago (excluindo o pagamento atual se for UPDATE)
  SELECT COALESCE(SUM(amount_cents), 0) INTO payments_total_cents
  FROM payments 
  WHERE invoice_id = NEW.invoice_id 
    AND id != COALESCE(OLD.id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- Calcular valor restante
  remaining_cents := invoice_total_cents - payments_total_cents;
  
  -- Validar se o novo pagamento não excede o restante
  IF NEW.amount_cents > remaining_cents THEN
    RAISE EXCEPTION 'Payment amount (%) exceeds remaining amount (%)', 
      NEW.amount_cents, remaining_cents;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger de validação
CREATE TRIGGER validate_payment_amount_trigger
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION validate_payment_amount();

-- ============================================================================
-- POLÍTICAS DE BACKUP E AUDITORIA
-- ============================================================================

-- Habilitar replicação para backup (se necessário)
-- ALTER TABLE suppliers REPLICA IDENTITY FULL;
-- ALTER TABLE invoices REPLICA IDENTITY FULL;  
-- ALTER TABLE payments REPLICA IDENTITY FULL;

## Interface do Usuário

### Layout Principal
- Sidebar com navegação: Dashboard, Notas Fiscais, Fornecedores, Formas de Pagamento
- Header com informações do usuário e logout
- Breadcrumb navigation
- Design responsivo para mobile e desktop

### Dashboard
- Cards com métricas:
  - Total de notas pendentes
  - Valor total em aberto
  - Notas em atraso
  - Total pago no mês
- Lista das próximas notas a vencer
- Gráfico simples de status das notas

### Lista de Notas Fiscais
- Tabela responsiva com colunas:
  - Número/Série
  - Fornecedor
  - Valor Total
  - Valor Pago
  - Valor Restante
  - Vencimento
  - Status (com badges coloridos)
  - Ações
- Filtros: fornecedor, status, período
- Busca por número/série
- Paginação
- Botão "Nova Nota Fiscal"

### Formulário de Nota Fiscal
- Formulário em modal ou página separada
- Upload drag-and-drop para PDF da nota
- Validação em tempo real com Zod
- Preview do arquivo selecionado
- Campos organizados logicamente
- Botões: Salvar, Cancelar

### Gestão de Pagamentos
- Modal "Adicionar Pagamento" com:
  - Informações da nota (readonly)
  - Valor restante em destaque
  - Formulário de pagamento
  - Upload de comprovante
- Lista de pagamentos existentes
- Total pago e restante sempre visíveis

### Páginas de Cadastro (Fornecedores e Formas de Pagamento)
- Listas com ações CRUD
- Formulários simples
- Validações apropriadas
- Confirmação para exclusões

## Requisitos Técnicos

### Validações com Zod
- Valores monetários (positivos, formato correto)
- Datas válidas (não muito antigas ou futuras)
- CNPJ/CPF com validação de dígitos
- Campos obrigatórios
- Tipos e tamanhos de arquivo

### Upload de Arquivos
- Supabase Storage configurado
- Tipos permitidos: PDF, JPG, PNG
- Limite: 10MB por arquivo
- Organização: `/user_id/invoices/` e `/user_id/receipts/`
- URLs assinadas para acesso seguro
- Preview de documentos

### Funcionalidades shadcn/ui
- Form components
- Data tables
- Date picker
- Select with search
- File upload
- Toast notifications
- Modals/Dialogs
- Loading states
- Badge components para status

### Performance e UX
- Loading skeletons durante carregamentos
- Estados de erro bem tratados
- Confirmações para ações destrutivas
- Auto-save em rascunhos (opcional)
- Busca com debounce
- Paginação eficiente

## Fluxo de Uso Típico

1. **Usuário faz login**
2. **Cadastra fornecedores** (se necessário)
3. **Cria nova nota fiscal**:
   - Preenche dados básicos
   - Faz upload do PDF
   - Salva a nota
4. **Adiciona pagamentos** conforme realiza:
   - Acessa a nota
   - Clica "Adicionar Pagamento"
   - Preenche valor, data, forma
   - Faz upload do comprovante
   - Sistema recalcula status automaticamente
5. **Consulta informações**:
   - Dashboard para visão geral
   - Lista filtrada de notas
   - Histórico de pagamentos

## Entregáveis

1. **Projeto Next.js 14 completo** estruturado e funcional
2. **Schema Supabase** com migrations e RLS
3. **Componentes reutilizáveis** bem documentados
4. **Formulários com validação** completa
5. **Sistema de upload** funcionando
6. **Interface responsiva** e acessível
7. **Tratamento de erros** consistente
8. **README** com instruções de setup
9. **Deploy funcional** no Vercel

## Considerações Importantes

- **Segurança**: Todos os dados isolados por usuário via RLS
- **Usabilidade**: Interface intuitiva para usuários não técnicos
- **Confiabilidade**: Validações rigorosas para dados financeiros
- **Performance**: Carregamento rápido e responsivo
- **Manutenibilidade**: Código limpo e bem estruturado

O sistema deve priorizar a simplicidade de uso mantendo a robustez necessária para gestão financeira confiável.