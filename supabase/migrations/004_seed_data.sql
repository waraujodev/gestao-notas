-- Script para popular o banco com dados de exemplo
-- Execute este SQL no Supabase SQL Editor

-- Usuário já existe: ca271014-685f-4dbc-bede-0cf0cbe9f071 (wsa.jpb@gmail.com)
SET session_replication_role = replica;

-- 1. FORNECEDORES (15 fornecedores variados)
INSERT INTO suppliers (id, user_id, name, document, email, phone, created_at, updated_at) VALUES
-- Tecnologia
('550e8400-e29b-41d4-a716-446655440001', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'TechSoft Soluções LTDA', '12345678000195', 'contato@techsoft.com.br', '11987654321', '2024-01-15 10:30:00', '2024-01-15 10:30:00'),
('550e8400-e29b-41d4-a716-446655440002', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'CodeLab Desenvolvimento', '23456789000186', 'vendas@codelab.com.br', '11876543210', '2024-02-01 14:20:00', '2024-02-01 14:20:00'),
('550e8400-e29b-41d4-a716-446655440003', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Digital Solutions Corp', '34567890000177', 'comercial@digitalsolutions.com', '11765432109', '2024-02-10 09:45:00', '2024-02-10 09:45:00'),

-- Serviços/Consultoria
('550e8400-e29b-41d4-a716-446655440004', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Consultoria Empresarial Silva & Associados', '45678901000168', 'contato@silvaassociados.com.br', '11654321098', '2024-01-20 16:10:00', '2024-01-20 16:10:00'),
('550e8400-e29b-41d4-a716-446655440005', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Marketing Digital Pro', '56789012000159', 'hello@marketingpro.com.br', '11543210987', '2024-03-05 11:30:00', '2024-03-05 11:30:00'),

-- Fornecedores de Material/Produtos
('550e8400-e29b-41d4-a716-446655440006', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Papelaria Central LTDA', '67890123000140', 'vendas@papelaricentral.com.br', '11432109876', '2024-01-25 13:45:00', '2024-01-25 13:45:00'),
('550e8400-e29b-41d4-a716-446655440007', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Móveis Office Corporativo', '78901234000131', 'comercial@moveisoffice.com.br', '11321098765', '2024-02-15 08:20:00', '2024-02-15 08:20:00'),
('550e8400-e29b-41d4-a716-446655440008', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'TechEquip Equipamentos', '89012345000122', 'vendas@techequip.com.br', '11210987654', '2024-03-01 15:15:00', '2024-03-01 15:15:00'),

-- Prestadores de Serviço (CPF)
('550e8400-e29b-41d4-a716-446655440009', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Ana Costa - Design Gráfico', '12345678901', 'ana.costa.design@gmail.com', '11109876543', '2024-02-20 10:00:00', '2024-02-20 10:00:00'),
('550e8400-e29b-41d4-a716-446655440010', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'João Silva - Fotografia', '23456789012', 'joao.foto@outlook.com', '11098765432', '2024-03-10 12:30:00', '2024-03-10 12:30:00'),
('550e8400-e29b-41d4-a716-446655440011', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Maria Santos - Consultoria RH', '34567890123', 'maria.rh.consultoria@gmail.com', '11987654321', '2024-01-30 14:45:00', '2024-01-30 14:45:00'),

-- Fornecedores Diversos
('550e8400-e29b-41d4-a716-446655440012', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'CleanTech Limpeza Empresarial', '90123456000113', 'contato@cleantech.com.br', '11876543210', '2024-02-25 09:30:00', '2024-02-25 09:30:00'),
('550e8400-e29b-41d4-a716-446655440013', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Segurança Total LTDA', '01234567000104', 'comercial@segurancatotal.com.br', '11765432109', '2024-03-15 16:00:00', '2024-03-15 16:00:00'),
('550e8400-e29b-41d4-a716-446655440014', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Transport Express Logística', '12340567000195', 'logistica@transportexpress.com.br', '11654321098', '2024-01-10 11:20:00', '2024-01-10 11:20:00'),
('550e8400-e29b-41d4-a716-446655440015', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', 'Energy Solutions Elétrica', '23450678000186', 'orcamento@energysolutions.com.br', '11543210987', '2024-03-20 13:10:00', '2024-03-20 13:10:00');

-- 2. NOTAS FISCAIS (25 notas com diferentes status e valores)
INSERT INTO invoices (id, user_id, supplier_id, series, number, due_date, total_amount_cents, pdf_path, pdf_size_bytes, created_at, updated_at) VALUES
-- Notas de Janeiro (já vencidas - algumas pagas, algumas em atraso)
('660e8400-e29b-41d4-a716-446655440001', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440001', '001', '000001', '2024-01-30', 250000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/01/nf_001_001.pdf', 1024000, '2024-01-05 09:00:00', '2024-01-05 09:00:00'),
('660e8400-e29b-41d4-a716-446655440002', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440009', '002', '000012', '2024-01-25', 85000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/01/nf_002_012.pdf', 856000, '2024-01-03 14:30:00', '2024-01-03 14:30:00'),
('660e8400-e29b-41d4-a716-446655440003', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440006', '001', '000045', '2024-01-20', 32500, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/01/nf_001_045.pdf', 654000, '2024-01-02 10:15:00', '2024-01-02 10:15:00'),

-- Notas de Fevereiro (mix de status)
('660e8400-e29b-41d4-a716-446655440004', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440002', '003', '000078', '2024-02-28', 450000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/02/nf_003_078.pdf', 1245000, '2024-02-01 11:45:00', '2024-02-01 11:45:00'),
('660e8400-e29b-41d4-a716-446655440005', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440012', '001', '000156', '2024-02-15', 125000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/02/nf_001_156.pdf', 789000, '2024-02-03 16:20:00', '2024-02-03 16:20:00'),
('660e8400-e29b-41d4-a716-446655440006', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440007', '002', '000234', '2024-02-25', 675000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/02/nf_002_234.pdf', 1456000, '2024-02-05 08:30:00', '2024-02-05 08:30:00'),
('660e8400-e29b-41d4-a716-446655440007', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440010', '001', '000098', '2024-02-20', 155000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/02/nf_001_098.pdf', 923000, '2024-02-07 13:10:00', '2024-02-07 13:10:00'),

-- Notas de Março (recentes, algumas ainda pendentes)
('660e8400-e29b-41d4-a716-446655440008', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440003', '001', '000312', '2024-03-30', 380000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/03/nf_001_312.pdf', 1124000, '2024-03-01 09:45:00', '2024-03-01 09:45:00'),
('660e8400-e29b-41d4-a716-446655440009', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440008', '004', '000445', '2024-03-25', 725000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/03/nf_004_445.pdf', 1689000, '2024-03-03 15:20:00', '2024-03-03 15:20:00'),
('660e8400-e29b-41d4-a716-446655440010', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440011', '001', '000567', '2024-03-15', 95000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/03/nf_001_567.pdf', 734000, '2024-03-05 10:00:00', '2024-03-05 10:00:00'),

-- Notas de Abril (futuras, algumas já pagas antecipadamente)
('660e8400-e29b-41d4-a716-446655440011', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440004', '002', '000789', '2024-04-15', 520000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/04/nf_002_789.pdf', 1367000, '2024-03-10 12:30:00', '2024-03-10 12:30:00'),
('660e8400-e29b-41d4-a716-446655440012', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440013', '001', '000890', '2024-04-30', 285000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/04/nf_001_890.pdf', 1089000, '2024-03-12 14:15:00', '2024-03-12 14:15:00'),

-- Notas de Maio (futuras)
('660e8400-e29b-41d4-a716-446655440013', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440005', '003', '000991', '2024-05-10', 165000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/05/nf_003_991.pdf', 892000, '2024-03-15 16:45:00', '2024-03-15 16:45:00'),
('660e8400-e29b-41d4-a716-446655440014', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440014', '001', '001123', '2024-05-20', 340000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/05/nf_001_1123.pdf', 1203000, '2024-03-18 11:20:00', '2024-03-18 11:20:00'),
('660e8400-e29b-41d4-a716-446655440015', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440015', '002', '001245', '2024-05-31', 475000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/05/nf_002_1245.pdf', 1534000, '2024-03-20 09:10:00', '2024-03-20 09:10:00'),

-- Notas adicionais para variedade
('660e8400-e29b-41d4-a716-446655440016', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440001', '002', '001367', '2024-04-10', 128000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/04/nf_002_1367.pdf', 765000, '2024-03-22 13:30:00', '2024-03-22 13:30:00'),
('660e8400-e29b-41d4-a716-446655440017', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440002', '004', '001489', '2024-06-05', 890000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/06/nf_004_1489.pdf', 1876000, '2024-03-25 15:45:00', '2024-03-25 15:45:00'),
('660e8400-e29b-41d4-a716-446655440018', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440012', '002', '001567', '2024-04-25', 75000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/04/nf_002_1567.pdf', 623000, '2024-03-28 10:20:00', '2024-03-28 10:20:00'),

-- Notas de valores altos para teste
('660e8400-e29b-41d4-a716-446655440019', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440008', '005', '001789', '2024-07-15', 1250000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/07/nf_005_1789.pdf', 2134000, '2024-03-30 12:00:00', '2024-03-30 12:00:00'),
('660e8400-e29b-41d4-a716-446655440020', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440007', '003', '001890', '2024-08-20', 2100000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/08/nf_003_1890.pdf', 2987000, '2024-04-01 14:30:00', '2024-04-01 14:30:00'),

-- Notas de valores baixos
('660e8400-e29b-41d4-a716-446655440021', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440009', '003', '001991', '2024-04-05', 25000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/04/nf_003_1991.pdf', 456000, '2024-04-02 16:15:00', '2024-04-02 16:15:00'),
('660e8400-e29b-41d4-a716-446655440022', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440010', '002', '002123', '2024-04-12', 45000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/04/nf_002_2123.pdf', 587000, '2024-04-03 08:45:00', '2024-04-03 08:45:00'),

-- Mais algumas notas recentes
('660e8400-e29b-41d4-a716-446655440023', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440006', '002', '002245', '2024-08-25', 185000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/08/nf_002_2245.pdf', 923000, '2024-08-01 11:30:00', '2024-08-01 11:30:00'),
('660e8400-e29b-41d4-a716-446655440024', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440011', '002', '002367', '2024-09-10', 275000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/09/nf_002_2367.pdf', 1145000, '2024-08-10 13:20:00', '2024-08-10 13:20:00'),
('660e8400-e29b-41d4-a716-446655440025', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '550e8400-e29b-41d4-a716-446655440015', '003', '002489', '2024-09-30', 395000, 'ca271014-685f-4dbc-bede-0cf0cbe9f071/2024/09/nf_003_2489.pdf', 1367000, '2024-08-12 15:10:00', '2024-08-12 15:10:00');

-- 3. PAGAMENTOS (diversos cenários: pagos, parciais, pendentes)
-- Primeiro, vamos buscar os IDs das formas de pagamento para usar no seed
DO $$ 
DECLARE
    pix_id uuid;
    ted_id uuid;
    cartao_credito_id uuid;
    dinheiro_id uuid;
    cartao_debito_id uuid;
BEGIN
    -- Buscar IDs das formas de pagamento existentes
    SELECT id INTO pix_id FROM payment_methods WHERE name = 'PIX' AND is_system_default = true;
    SELECT id INTO ted_id FROM payment_methods WHERE name = 'Transferência Bancária' AND is_system_default = true;
    SELECT id INTO cartao_credito_id FROM payment_methods WHERE name = 'Cartão de Crédito' AND is_system_default = true;
    SELECT id INTO dinheiro_id FROM payment_methods WHERE name = 'Dinheiro' AND is_system_default = true;
    SELECT id INTO cartao_debito_id FROM payment_methods WHERE name = 'Cartão de Débito' AND is_system_default = true;

    -- Inserir pagamentos usando os IDs corretos
    INSERT INTO payments (id, user_id, invoice_id, payment_method_id, amount_cents, payment_date, receipt_path, receipt_size_bytes, receipt_type, notes, created_at, updated_at) VALUES
    -- Pagamentos completos
    ('770e8400-e29b-41d4-a716-446655440001', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440001', pix_id, 250000, '2024-01-28', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/01/pix_250000.pdf', 234567, 'pdf', 'Pagamento via PIX - TechSoft', '2024-01-28 14:30:00', '2024-01-28 14:30:00'),

    ('770e8400-e29b-41d4-a716-446655440002', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440002', ted_id, 85000, '2024-01-22', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/01/ted_85000.jpg', 123456, 'jpg', 'TED Itaú - Design Ana Costa', '2024-01-22 10:15:00', '2024-01-22 10:15:00'),

    ('770e8400-e29b-41d4-a716-446655440003', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440004', pix_id, 450000, '2024-02-25', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/02/pix_450000.pdf', 345678, 'pdf', 'Pagamento CodeLab - PIX', '2024-02-25 16:45:00', '2024-02-25 16:45:00'),

    -- Pagamentos parciais (primeira parcela)
    ('770e8400-e29b-41d4-a716-446655440004', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440006', cartao_credito_id, 350000, '2024-02-20', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/02/cartao_350000.pdf', 189234, 'pdf', 'Primeira parcela - Cartão Crédito', '2024-02-20 11:30:00', '2024-02-20 11:30:00'),

    ('770e8400-e29b-41d4-a716-446655440005', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440009', ted_id, 400000, '2024-03-15', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/03/ted_400000.png', 87654, 'png', 'Pagamento parcial TechEquip', '2024-03-15 09:20:00', '2024-03-15 09:20:00'),

    -- Segunda parcela para completar pagamento
    ('770e8400-e29b-41d4-a716-446655440006', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440006', pix_id, 325000, '2024-03-05', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/03/pix_325000.pdf', 156789, 'pdf', 'Segunda parcela - Móveis Office', '2024-03-05 15:10:00', '2024-03-05 15:10:00'),

    -- Pagamentos de notas pequenas
    ('770e8400-e29b-41d4-a716-446655440007', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440021', pix_id, 25000, '2024-04-03', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/04/pix_25000.jpg', 45678, 'jpg', 'Pagamento design gráfico', '2024-04-03 12:45:00', '2024-04-03 12:45:00'),

    ('770e8400-e29b-41d4-a716-446655440008', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440022', dinheiro_id, 45000, '2024-04-08', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/04/dinheiro_45000.pdf', 67890, 'pdf', 'Pagamento em dinheiro', '2024-04-08 14:20:00', '2024-04-08 14:20:00'),

    -- Pagamento antecipado
    ('770e8400-e29b-41d4-a716-446655440009', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440011', ted_id, 520000, '2024-03-25', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/03/ted_520000.pdf', 234567, 'pdf', 'Pagamento antecipado com desconto', '2024-03-25 10:00:00', '2024-03-25 10:00:00'),

    -- Pagamento de limpeza (valor baixo, recorrente)
    ('770e8400-e29b-41d4-a716-446655440010', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440005', pix_id, 125000, '2024-02-10', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/02/pix_125000.png', 98765, 'png', 'CleanTech - Fevereiro', '2024-02-10 16:30:00', '2024-02-10 16:30:00'),

    -- Pagamento consultor RH (pessoa física)
    ('770e8400-e29b-41d4-a716-446655440011', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440010', pix_id, 95000, '2024-03-10', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/03/pix_95000.pdf', 76543, 'pdf', 'Consultoria RH Maria Santos', '2024-03-10 13:15:00', '2024-03-10 13:15:00'),

    -- Pagamento transporte 
    ('770e8400-e29b-41d4-a716-446655440012', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440014', cartao_credito_id, 340000, '2024-05-15', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/05/cartao_340000.pdf', 187654, 'pdf', 'Transport Express - Cartão', '2024-05-15 11:45:00', '2024-05-15 11:45:00'),

    -- Pagamentos parciais em aberto (nota que ainda tem saldo)
    ('770e8400-e29b-41d4-a716-446655440013', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440009', pix_id, 225000, '2024-03-20', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/03/pix_225000.jpg', 65432, 'jpg', 'Primeira parcela TechEquip', '2024-03-20 09:30:00', '2024-03-20 09:30:00'),

    -- Pagamento recente (agosto)
    ('770e8400-e29b-41d4-a716-446655440014', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440023', ted_id, 185000, '2024-08-20', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/08/ted_185000.pdf', 134567, 'pdf', 'Pagamento papelaria - TED', '2024-08-20 14:10:00', '2024-08-20 14:10:00'),

    -- Pagamento parcial recente 
    ('770e8400-e29b-41d4-a716-446655440015', 'ca271014-685f-4dbc-bede-0cf0cbe9f071', '660e8400-e29b-41d4-a716-446655440024', pix_id, 150000, '2024-08-15', 'ca271014-685f-4dbc-bede-0cf0cbe9f071/receipts/2024/08/pix_150000.png', 87654, 'png', 'Primeira parcela Maria RH', '2024-08-15 10:25:00', '2024-08-15 10:25:00');
END $$;

SET session_replication_role = DEFAULT;

-- Mostrar resumo dos dados inseridos
SELECT 'FORNECEDORES' as tabela, COUNT(*) as total FROM suppliers WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071'
UNION ALL
SELECT 'NOTAS FISCAIS' as tabela, COUNT(*) as total FROM invoices WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071'  
UNION ALL
SELECT 'PAGAMENTOS' as tabela, COUNT(*) as total FROM payments WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071'
UNION ALL
SELECT 'VALOR TOTAL NOTAS (R$)' as tabela, ROUND(SUM(total_amount_cents)::numeric / 100, 2) as total FROM invoices WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071'
UNION ALL  
SELECT 'VALOR TOTAL PAGAMENTOS (R$)' as tabela, ROUND(SUM(amount_cents)::numeric / 100, 2) as total FROM payments WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071';

-- Mostrar status das notas (calculado via função)
SELECT 
    'STATUS DAS NOTAS' as info,
    COUNT(CASE WHEN payment_status = 'Pago' THEN 1 END) as pagas,
    COUNT(CASE WHEN payment_status = 'Pago Parcial' THEN 1 END) as parciais,  
    COUNT(CASE WHEN payment_status = 'Pendente' THEN 1 END) as pendentes,
    COUNT(CASE WHEN payment_status = 'Atrasado' THEN 1 END) as atrasadas
FROM (
    SELECT *, calculate_invoice_summary(id) as payment_status 
    FROM invoices 
    WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071'
) as invoice_stats;