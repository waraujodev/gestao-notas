# Scripts de População do Banco de Dados

## 📊 Migration de Dados de Exemplo (`004_seed_data.sql`)

Esta migration popula o banco com dados realistas para teste e desenvolvimento do sistema.

### 🎯 **Dados que serão criados:**

- **15 Fornecedores** variados (empresas + pessoas físicas)
- **25 Notas Fiscais** com diferentes status, valores e datas
- **15 Pagamentos** cobrindo diversos cenários

### 📈 **Cenários contemplados:**

#### **Fornecedores:**
- **Tecnologia**: TechSoft, CodeLab, Digital Solutions
- **Consultoria**: Silva & Associados, Marketing Digital Pro, Maria Santos (RH)
- **Produtos**: Papelaria Central, Móveis Office, TechEquip
- **Serviços**: CleanTech, Segurança Total, Transport Express
- **Pessoas Físicas**: Ana Costa (Design), João Silva (Fotografia)

#### **Notas Fiscais:**
- **Status variados**: Pagas, Parciais, Pendentes, Atrasadas
- **Valores diversos**: R$ 250,00 a R$ 21.000,00
- **Períodos**: Janeiro a Setembro 2024
- **Vencimentos**: Passados e futuros

#### **Pagamentos:**
- **Formas variadas**: PIX, TED, Cartão, Dinheiro
- **Cenários reais**: Pagamentos completos, parciais, antecipados
- **Comprovantes**: PDF, JPG, PNG

### 🚀 **Como executar:**

#### **1. Via Supabase CLI (recomendado):**
```bash
# Aplicar migration de seed data
supabase migration up

# Ou executar migration específica
supabase db sql --file supabase/migrations/004_seed_data.sql
```

#### **2. Via Supabase Dashboard:**
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `supabase/migrations/004_seed_data.sql`
4. Clique em **Run** para executar

### ✅ **Verificação após execução:**

O script mostra um resumo automático:
```
TABELA                    TOTAL
------------------------  -----
FORNECEDORES             15
NOTAS FISCAIS            25  
PAGAMENTOS               15
VALOR TOTAL NOTAS (R$)   102.250,00
VALOR TOTAL PAGAMENTOS   37.850,00
STATUS DAS NOTAS         8 pagas, 3 parciais, 10 pendentes, 4 atrasadas
```

### 🎨 **Dados específicos criados:**

#### **Fornecedores por categoria:**
- **CNPJ**: 12 empresas de diferentes segmentos
- **CPF**: 3 prestadores pessoa física
- **Contatos**: Emails e telefones realistas
- **Documentos**: Válidos para teste

#### **Notas por mês:**
- **Jan/2024**: 3 notas (R$ 3.675,00) - Já vencidas
- **Fev/2024**: 4 notas (R$ 14.050,00) - Mix de status  
- **Mar/2024**: 3 notas (R$ 12.000,00) - Recentes
- **Abr-Set/2024**: 15 notas (R$ 72.525,00) - Futuras

#### **Pagamentos por forma:**
- **PIX**: 8 pagamentos (mais usada)
- **TED**: 4 pagamentos  
- **Cartão**: 2 pagamentos
- **Dinheiro**: 1 pagamento

### 🔧 **Personalização:**

Para ajustar os dados, modifique as seções no script:

```sql
-- 1. FORNECEDORES - Linha 7
-- Adicione/remova fornecedores conforme necessário

-- 2. NOTAS FISCAIS - Linha 45  
-- Ajuste valores, datas e séries

-- 3. PAGAMENTOS - Linha 85
-- Modifique formas de pagamento e valores
```

### ⚠️ **Importante:**

- **User ID**: Script configurado para `ca271014-685f-4dbc-bede-0cf0cbe9f071`
- **Payment Methods**: Usa IDs padrão das formas de pagamento
- **Arquivos**: PDFs/imagens são apenas referencias (não criados fisicamente)
- **RLS**: Todos os dados respeitam as políticas Row Level Security

### 🧪 **Para desenvolvimento:**

Estes dados permitem testar:
- ✅ Dashboard com métricas reais
- ✅ Filtros e buscas com resultados variados  
- ✅ Diferentes status de pagamento
- ✅ Paginação com volume adequado
- ✅ Relatórios com dados significativos

### 🗑️ **Para limpar os dados:**

```sql
-- ⚠️ CUIDADO: Remove TODOS os dados do usuário
DELETE FROM payments WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071';
DELETE FROM invoices WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071'; 
DELETE FROM suppliers WHERE user_id = 'ca271014-685f-4dbc-bede-0cf0cbe9f071';
```