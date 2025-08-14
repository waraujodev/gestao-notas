-- ============================================================================
-- SCHEMA INICIAL - Sistema de Gestão de Notas Fiscais (VERSÃO CORRIGIDA)
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- TABELA: suppliers (Fornecedores)
-- ============================================================================

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

-- ============================================================================
-- TABELA: payment_methods (Formas de Pagamento)
-- ============================================================================

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

-- ============================================================================
-- TABELA: invoices (Notas Fiscais)
-- ============================================================================

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
  
  -- Metadados do arquivo PDF
  pdf_path text NOT NULL CHECK (pdf_path ~ '^[a-f0-9-]+/invoices/'),  -- Valida formato do path
  pdf_size_bytes bigint CHECK (pdf_size_bytes > 0 AND pdf_size_bytes <= 10485760), -- Max 10MB
  
  -- Auditoria
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints para integridade
  UNIQUE(user_id, supplier_id, series, number)  -- Evita nota duplicada
);

-- ============================================================================
-- TABELA: payments (Pagamentos)
-- ============================================================================

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
  created_at timestamptz DEFAULT now() NOT NULL
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
-- FUNÇÃO PARA CÁLCULOS DE STATUS
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
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id as invoice_id,
    i.total_amount_cents,
    COALESCE(p.total_paid_cents, 0::bigint) as paid_amount_cents,
    (i.total_amount_cents - COALESCE(p.total_paid_cents, 0::bigint)) as remaining_amount_cents,
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
      pay.invoice_id as inv_id,
      SUM(pay.amount_cents)::bigint as total_paid_cents
    FROM payments pay
    WHERE pay.user_id = p_user_id
    GROUP BY pay.invoice_id
  ) p ON i.id = p.inv_id
  WHERE i.id = p_invoice_id 
    AND i.user_id = p_user_id;
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
-- ÍNDICES BÁSICOS PARA PERFORMANCE (SEM FUNÇÕES PROBLEMÁTICAS)
-- ============================================================================

-- Índices para suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_user_status 
ON suppliers (user_id, status) 
WHERE status = true;

CREATE INDEX IF NOT EXISTS idx_suppliers_user_name 
ON suppliers (user_id, name);

-- Índices para payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_system_active 
ON payment_methods (is_system_default, status, display_order) 
WHERE status = true;

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_active 
ON payment_methods (user_id, status, display_order) 
WHERE user_id IS NOT NULL AND status = true;

-- Índices para invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_due_date 
ON invoices (user_id, due_date DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_user_created 
ON invoices (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_supplier_date 
ON invoices (supplier_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_search 
ON invoices (user_id, series, number);

-- Índices para payments
CREATE INDEX IF NOT EXISTS idx_payments_invoice_amount 
ON payments (invoice_id, amount_cents);

CREATE INDEX IF NOT EXISTS idx_payments_user_date 
ON payments (user_id, payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_payments_method_stats 
ON payments (payment_method_id, user_id, payment_date);

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
-- FORÇA ATUALIZAÇÃO DE ESTATÍSTICAS PARA O POSTGRESQL
-- ============================================================================

-- Força atualização de estatísticas para otimização do query planner
ANALYZE suppliers;
ANALYZE payment_methods; 
ANALYZE invoices;
ANALYZE payments;