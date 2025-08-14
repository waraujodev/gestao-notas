-- ============================================================================
-- SEED DATA - Dados de exemplo para teste e desenvolvimento
-- ============================================================================
-- Usuário já cadastrado: ca271014-685f-4dbc-bede-0cf0cbe9f071 (wsa.jpb@gmail.com)

SET session_replication_role = replica;

-- ============================================================================
-- 1. FORNECEDORES (15 fornecedores diversos)
-- ============================================================================

INSERT INTO suppliers (id, user_id, name, document, email, phone, created_at, updated_at) VALUES
-- Tecnologia
('550e8400-e29b-41d4-a716-446655440001', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'TechSoft Soluções LTDA', '12345678000195', 'contato@techsoft.com.br', '11987654321', '2024-01-15 10:30:00', '2024-01-15 10:30:00'),
('550e8400-e29b-41d4-a716-446655440002', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'CodeLab Desenvolvimento', '23456789000186', 'vendas@codelab.com.br', '11876543210', '2024-02-01 14:20:00', '2024-02-01 14:20:00'),
('550e8400-e29b-41d4-a716-446655440003', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Digital Solutions Corp', '34567890000177', 'comercial@digitalsolutions.com', '11765432109', '2024-02-10 09:45:00', '2024-02-10 09:45:00'),

-- Serviços/Consultoria
('550e8400-e29b-41d4-a716-446655440004', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Consultoria Silva & Associados', '45678901000168', 'contato@silvaassociados.com.br', '11654321098', '2024-01-20 16:10:00', '2024-01-20 16:10:00'),
('550e8400-e29b-41d4-a716-446655440005', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Marketing Digital Pro', '56789012000159', 'hello@marketingpro.com.br', '11543210987', '2024-03-05 11:30:00', '2024-03-05 11:30:00'),

-- Fornecedores de Material/Produtos
('550e8400-e29b-41d4-a716-446655440006', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Papelaria Central LTDA', '67890123000140', 'vendas@papelaricentral.com.br', '11432109876', '2024-01-25 13:45:00', '2024-01-25 13:45:00'),
('550e8400-e29b-41d4-a716-446655440007', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Móveis Office Corporativo', '78901234000131', 'comercial@moveisoffice.com.br', '11321098765', '2024-02-15 08:20:00', '2024-02-15 08:20:00'),
('550e8400-e29b-41d4-a716-446655440008', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'TechEquip Equipamentos', '89012345000122', 'vendas@techequip.com.br', '11210987654', '2024-03-01 15:15:00', '2024-03-01 15:15:00'),

-- Prestadores de Serviço (CPF)
('550e8400-e29b-41d4-a716-446655440009', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Ana Costa - Design Gráfico', '12345678901', 'ana.costa.design@gmail.com', '11109876543', '2024-02-20 10:00:00', '2024-02-20 10:00:00'),
('550e8400-e29b-41d4-a716-446655440010', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'João Silva - Fotografia', '23456789012', 'joao.foto@outlook.com', '11098765432', '2024-03-10 12:30:00', '2024-03-10 12:30:00'),
('550e8400-e29b-41d4-a716-446655440011', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Maria Santos - Consultoria RH', '34567890123', 'maria.rh@gmail.com', '11987654321', '2024-01-30 14:45:00', '2024-01-30 14:45:00'),

-- Fornecedores Diversos
('550e8400-e29b-41d4-a716-446655440012', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'CleanTech Limpeza', '90123456000113', 'contato@cleantech.com.br', '11876543210', '2024-02-25 09:30:00', '2024-02-25 09:30:00'),
('550e8400-e29b-41d4-a716-446655440013', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Segurança Total LTDA', '01234567000104', 'comercial@segurancatotal.com.br', '11765432109', '2024-03-15 16:00:00', '2024-03-15 16:00:00'),
('550e8400-e29b-41d4-a716-446655440014', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Transport Express', '12340567000195', 'logistica@transportexpress.com.br', '11654321098', '2024-01-10 11:20:00', '2024-01-10 11:20:00'),
('550e8400-e29b-41d4-a716-446655440015', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Energy Solutions', '23450678000186', 'orcamento@energysolutions.com.br', '11543210987', '2024-03-20 13:10:00', '2024-03-20 13:10:00');

-- ============================================================================
-- 2. NOTAS FISCAIS (20 notas com valores e status variados)
-- ============================================================================

INSERT INTO invoices (id, user_id, supplier_id, series, number, due_date, total_amount_cents, pdf_path, pdf_size_bytes, created_at, updated_at) VALUES
-- Notas pagas (vencidas e quitadas)
('660e8400-e29b-41d4-a716-446655440001', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440001', '001', '000001', '2024-01-30', 250000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_001_000001.pdf', 1024000, '2024-01-05 09:00:00', '2024-01-05 09:00:00'),
('660e8400-e29b-41d4-a716-446655440002', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440009', '002', '000012', '2024-01-25', 85000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_002_000012.pdf', 856000, '2024-01-03 14:30:00', '2024-01-03 14:30:00'),
('660e8400-e29b-41d4-a716-446655440003', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440006', '001', '000045', '2024-02-15', 125000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_001_000045.pdf', 654000, '2024-01-02 10:15:00', '2024-01-02 10:15:00'),

-- Notas com pagamento parcial
('660e8400-e29b-41d4-a716-446655440004', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440007', '002', '000234', '2024-02-28', 675000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_002_000234.pdf', 1456000, '2024-02-05 08:30:00', '2024-02-05 08:30:00'),
('660e8400-e29b-41d4-a716-446655440005', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440008', '004', '000445', '2024-03-25', 725000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_004_000445.pdf', 1689000, '2024-03-03 15:20:00', '2024-03-03 15:20:00'),

-- Notas atrasadas (vencidas sem pagamento)
('660e8400-e29b-41d4-a716-446655440006', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440002', '003', '000078', '2024-02-10', 450000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_003_000078.pdf', 1245000, '2024-02-01 11:45:00', '2024-02-01 11:45:00'),
('660e8400-e29b-41d4-a716-446655440007', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440011', '001', '000567', '2024-03-15', 95000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_001_000567.pdf', 734000, '2024-03-05 10:00:00', '2024-03-05 10:00:00'),

-- Notas pendentes (futuras)
('660e8400-e29b-41d4-a716-446655440008', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440004', '002', '000789', '2024-12-15', 520000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_002_000789.pdf', 1367000, '2024-08-10 12:30:00', '2024-08-10 12:30:00'),
('660e8400-e29b-41d4-a716-446655440009', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440013', '001', '000890', '2024-12-30', 285000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_001_000890.pdf', 1089000, '2024-08-12 14:15:00', '2024-08-12 14:15:00'),
('660e8400-e29b-41d4-a716-446655440010', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440005', '003', '000991', '2024-12-10', 165000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_003_000991.pdf', 892000, '2024-08-15 16:45:00', '2024-08-15 16:45:00'),

-- Notas pagas antecipadamente
('660e8400-e29b-41d4-a716-446655440011', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440014', '001', '001123', '2024-10-20', 340000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_001_001123.pdf', 1203000, '2024-08-18 11:20:00', '2024-08-18 11:20:00'),
('660e8400-e29b-41d4-a716-446655440012', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440015', '002', '001245', '2024-11-30', 475000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_002_001245.pdf', 1534000, '2024-08-20 09:10:00', '2024-08-20 09:10:00'),

-- Notas pequenas (testagem de valores baixos)
('660e8400-e29b-41d4-a716-446655440013', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440009', '003', '001991', '2024-09-05', 25000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_003_001991.pdf', 456000, '2024-08-02 16:15:00', '2024-08-02 16:15:00'),
('660e8400-e29b-41d4-a716-446655440014', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440010', '002', '002123', '2024-09-12', 45000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_002_002123.pdf', 587000, '2024-08-03 08:45:00', '2024-08-03 08:45:00'),

-- Notas altas (testagem de valores grandes)
('660e8400-e29b-41d4-a716-446655440015', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440008', '005', '001789', '2024-12-15', 1250000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_005_001789.pdf', 2134000, '2024-08-30 12:00:00', '2024-08-30 12:00:00'),
('660e8400-e29b-41d4-a716-446655440016', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440007', '003', '001890', '2024-12-20', 2100000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_003_001890.pdf', 2987000, '2024-08-01 14:30:00', '2024-08-01 14:30:00'),

-- Notas recentes
('660e8400-e29b-41d4-a716-446655440017', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440006', '002', '002245', '2024-09-25', 185000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_002_002245.pdf', 923000, '2024-08-01 11:30:00', '2024-08-01 11:30:00'),
('660e8400-e29b-41d4-a716-446655440018', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440012', '002', '002367', '2024-10-10', 275000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_002_002367.pdf', 1145000, '2024-08-10 13:20:00', '2024-08-10 13:20:00'),
('660e8400-e29b-41d4-a716-446655440019', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440015', '003', '002489', '2024-10-30', 395000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/invoices/nf_003_002489.pdf', 1367000, '2024-08-12 15:10:00', '2024-08-12 15:10:00');

-- ============================================================================
-- 3. PAGAMENTOS (usando procedure para buscar IDs das formas de pagamento)
-- ============================================================================

DO $$ 
DECLARE
    pix_id uuid;
    ted_id uuid;
    cartao_credito_id uuid;
    dinheiro_id uuid;
    cartao_debito_id uuid;
BEGIN
    -- Buscar IDs das formas de pagamento do sistema
    SELECT id INTO pix_id FROM payment_methods WHERE name = 'PIX' AND is_system_default = true;
    SELECT id INTO ted_id FROM payment_methods WHERE name = 'Transferência Bancária' AND is_system_default = true;
    SELECT id INTO cartao_credito_id FROM payment_methods WHERE name = 'Cartão de Crédito' AND is_system_default = true;
    SELECT id INTO dinheiro_id FROM payment_methods WHERE name = 'Dinheiro' AND is_system_default = true;
    SELECT id INTO cartao_debito_id FROM payment_methods WHERE name = 'Cartão de Débito' AND is_system_default = true;

    -- Inserir pagamentos (SEM coluna updated_at que não existe na tabela payments)
    INSERT INTO payments (id, user_id, invoice_id, payment_method_id, amount_cents, payment_date, receipt_path, receipt_size_bytes, receipt_type, notes, created_at) VALUES
    
    -- Pagamentos completos
    ('770e8400-e29b-41d4-a716-446655440001', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440001', pix_id, 250000, '2024-01-28', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/pix_250000_20240128.pdf', 234567, 'pdf', 'Pagamento via PIX - TechSoft', '2024-01-28 14:30:00'),
    ('770e8400-e29b-41d4-a716-446655440002', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440002', ted_id, 85000, '2024-01-22', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/ted_85000_20240122.jpg', 123456, 'jpg', 'TED Itaú - Design Ana Costa', '2024-01-22 10:15:00'),
    ('770e8400-e29b-41d4-a716-446655440003', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440003', pix_id, 125000, '2024-02-10', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/pix_125000_20240210.pdf', 345678, 'pdf', 'Papelaria Central - PIX', '2024-02-10 16:45:00'),
    
    -- Pagamentos parciais (primeira parcela)
    ('770e8400-e29b-41d4-a716-446655440004', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440004', cartao_credito_id, 350000, '2024-02-20', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/cartao_350000_20240220.pdf', 189234, 'pdf', 'Primeira parcela - Móveis Office', '2024-02-20 11:30:00'),
    ('770e8400-e29b-41d4-a716-446655440005', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440005', ted_id, 400000, '2024-03-15', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/ted_400000_20240315.png', 87654, 'png', 'Pagamento parcial TechEquip', '2024-03-15 09:20:00'),
    
    -- Segunda parcela para completar pagamento da nota 004
    ('770e8400-e29b-41d4-a716-446655440006', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440004', pix_id, 325000, '2024-03-05', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/pix_325000_20240305.pdf', 156789, 'pdf', 'Segunda parcela - Móveis Office', '2024-03-05 15:10:00'),
    
    -- Pagamentos de notas pequenas
    ('770e8400-e29b-41d4-a716-446655440007', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440013', pix_id, 25000, '2024-08-03', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/pix_25000_20240803.jpg', 45678, 'jpg', 'Pagamento design gráfico', '2024-08-03 12:45:00'),
    ('770e8400-e29b-41d4-a716-446655440008', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440014', dinheiro_id, 45000, '2024-08-08', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/dinheiro_45000_20240808.pdf', 67890, 'pdf', 'Pagamento em dinheiro - João Silva', '2024-08-08 14:20:00'),
    
    -- Pagamentos antecipados
    ('770e8400-e29b-41d4-a716-446655440009', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440011', ted_id, 340000, '2024-08-25', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/ted_340000_20240825.pdf', 234567, 'pdf', 'Pagamento antecipado Transport Express', '2024-08-25 10:00:00'),
    ('770e8400-e29b-41d4-a716-446655440010', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440012', pix_id, 475000, '2024-08-30', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/pix_475000_20240830.png', 98765, 'png', 'Energy Solutions - Pagamento antecipado', '2024-08-30 16:30:00'),
    
    -- Pagamentos parciais em aberto (nota que ainda tem saldo)
    ('770e8400-e29b-41d4-a716-446655440011', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440005', pix_id, 300000, '2024-03-20', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/pix_300000_20240320.pdf', 76543, 'pdf', 'Primeira parcela TechEquip (saldo R$ 4.250)', '2024-03-20 13:15:00'),
    
    -- Pagamentos recentes
    ('770e8400-e29b-41d4-a716-446655440012', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440017', ted_id, 185000, '2024-08-20', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/ted_185000_20240820.pdf', 134567, 'pdf', 'Papelaria Central - TED', '2024-08-20 14:10:00'),
    ('770e8400-e29b-41d4-a716-446655440013', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440018', pix_id, 150000, '2024-08-15', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/pix_150000_20240815.png', 87654, 'png', 'Primeira parcela CleanTech', '2024-08-15 10:25:00');
    
END $$;

SET session_replication_role = DEFAULT;

-- ============================================================================
-- RELATÓRIOS DE VERIFICAÇÃO
-- ============================================================================

-- Resumo dos dados inseridos
SELECT 'FORNECEDORES' as tabela, COUNT(*) as total FROM suppliers WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071'
UNION ALL
SELECT 'NOTAS FISCAIS' as tabela, COUNT(*) as total FROM invoices WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071'  
UNION ALL
SELECT 'PAGAMENTOS' as tabela, COUNT(*) as total FROM payments WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071'
UNION ALL
SELECT 'VALOR TOTAL NOTAS (R$)' as tabela, ROUND(SUM(total_amount_cents)::numeric / 100, 2) as total FROM invoices WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071'
UNION ALL  
SELECT 'VALOR TOTAL PAGAMENTOS (R$)' as tabela, ROUND(SUM(amount_cents)::numeric / 100, 2) as total FROM payments WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071';

-- Status das notas (usando a função de cálculo)
SELECT 
    'STATUS DAS NOTAS' as info,
    COUNT(CASE WHEN summary.payment_status = 'Pago' THEN 1 END) as pagas,
    COUNT(CASE WHEN summary.payment_status = 'Pago Parcial' THEN 1 END) as parciais,  
    COUNT(CASE WHEN summary.payment_status = 'Pendente' THEN 1 END) as pendentes,
    COUNT(CASE WHEN summary.payment_status = 'Atrasado' THEN 1 END) as atrasadas
FROM (
    SELECT *, (calculate_invoice_summary(i.id, i.user_id)).payment_status as payment_status
    FROM invoices i 
    WHERE i.user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071'
) as summary;