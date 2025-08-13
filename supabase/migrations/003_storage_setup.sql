-- ============================================================================
-- CONFIGURAÇÃO DO SUPABASE STORAGE
-- ============================================================================

-- Criar buckets para uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('invoices', 'invoices', false, 10485760, ARRAY['application/pdf']),
  ('receipts', 'receipts', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- POLÍTICAS DE STORAGE PARA INVOICES
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

-- Política para atualizar invoices
CREATE POLICY "invoices_update_storage" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'invoices' AND  
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- ============================================================================
-- POLÍTICAS DE STORAGE PARA RECEIPTS
-- ============================================================================

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

-- Política para atualizar receipts
CREATE POLICY "receipts_update_storage" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);