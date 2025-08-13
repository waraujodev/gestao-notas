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