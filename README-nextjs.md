# 📊 Sistema de Gestão de Notas Fiscais

Sistema web completo para cadastro e gestão de notas fiscais, desenvolvido para organizar informações financeiras e facilitar a consulta de comprovantes.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Validação**: React Hook Form + Zod
- **Visualização**: PDF.js
- **Deploy**: Vercel + Supabase Cloud

## 📋 Funcionalidades

### 🔐 Autenticação
- Login/registro via Supabase Auth
- Recuperação de senha
- Proteção de rotas privadas
- Persistência de sessão

### 👥 Gestão de Fornecedores
- CRUD completo com validação CNPJ/CPF
- Busca e filtros avançados
- Exclusão lógica
- Validação de duplicatas

### 💳 Formas de Pagamento
- Métodos pré-cadastrados (PIX, Cartão, Boleto, etc.)
- Personalização por usuário
- Status ativo/inativo

### 📄 Notas Fiscais (Principal)
- Upload de PDF da nota fiscal
- Múltiplos pagamentos por nota
- Cálculo automático de status:
  - **Pendente**: Valor pago = 0
  - **Pago Parcial**: 0 < valor pago < valor total
  - **Pago**: Valor pago = valor total
  - **Atrasado**: Vencimento passou e status ≠ Pago

### 💰 Controle de Pagamentos
- Sistema 1:N (uma nota, vários pagamentos)
- Upload de comprovantes
- Validação de valor restante
- Observações por pagamento

### 📊 Dashboard
- Métricas principais (pendentes, em atraso, total pago)
- Próximas notas a vencer
- Gráficos de status
- Indicadores de performance

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Conta Supabase (gratuita)
- Conta Vercel (gratuita)

### Setup Local

```bash
# 1. Clonar o repositório
git clone <url-do-repositório>
cd gestao-notas

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais do Supabase

# 4. Iniciar desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Ambiente
NODE_ENV=development
```

## 📊 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção

# Qualidade de código
npm run lint         # ESLint
npm run lint:fix     # Corrige problemas automaticamente
npm run type-check   # Verificação de tipos TypeScript
npm run format       # Prettier

# Testes
npm run test         # Jest + Testing Library
npm run test:watch   # Modo watch
npm run test:e2e     # Testes E2E com Playwright

# Supabase
npm run supabase:types  # Gera tipos TypeScript
npm run db:migrate      # Aplica migrations
npm run db:seed         # Dados iniciais

# Performance
npm run cache:clear     # Limpa cache
npm run analyze         # Analisa bundle size
```

## 🗄️ Estrutura do Banco de Dados

```sql
-- Fornecedores
suppliers (id, user_id, name, document, email, phone, status)

-- Formas de pagamento
payment_methods (id, user_id, name, description, status, is_system_default)

-- Notas fiscais
invoices (id, user_id, supplier_id, total_amount_cents, series, number, due_date, pdf_path)

-- Pagamentos
payments (id, user_id, invoice_id, payment_method_id, amount_cents, payment_date, receipt_path)
```

## 🔒 Segurança

- **Row Level Security (RLS)** em todas as tabelas
- **Isolamento por usuário** via auth.uid()
- **Validação cruzada** entre tabelas relacionadas
- **Storage seguro** com políticas por usuário
- **Validação de tipos** com Zod

## 📱 Responsividade

- Design mobile-first
- Componentes responsivos com Tailwind CSS
- Navegação otimizada para dispositivos móveis
- Interface adaptável para tablets e desktops

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# 1. Conectar ao GitHub
# 2. Importar projeto no Vercel
# 3. Configurar variáveis de ambiente
# 4. Deploy automático
```

### Configuração no Vercel
- Adicionar variáveis de ambiente do Supabase
- Configurar domínio personalizado (opcional)
- Habilitar preview deployments

## 📈 Performance

- **Cache em múltiplas camadas** (Browser + Next.js + PostgreSQL)
- **Índices otimizados** para consultas frequentes
- **Lazy loading** de componentes
- **Bundle splitting** automático
- **Compression** de assets

## 🔧 Desenvolvimento

### Estrutura de Pastas
```
├── app/              # App Router (Next.js 14)
├── components/       # Componentes reutilizáveis
├── lib/             # Utilitários e configurações
├── types/           # Definições TypeScript
├── docs/            # Documentação técnica
└── public/          # Assets estáticos
```

### Convenções de Código
- **TypeScript** para type safety
- **ESLint + Prettier** para formatação
- **Conventional Commits** para mensagens
- **Componentes funcionais** com hooks
- **shadcn/ui** para componentes de UI

## 📚 Documentação

- **[CLAUDE.md](CLAUDE.md)**: Documentação técnica completa
- **[docs/](docs/)**: Especificações e planos de implementação
- **[CHANGELOG.md](CHANGELOG.md)**: Histórico de versões

## 📞 Suporte

Para dúvidas ou suporte:
- 📖 Documentação: [docs/](docs/)
- 🔧 Documentação técnica: [CLAUDE.md](CLAUDE.md)

---

<div align="center">

**🚀 Desenvolvido com Next.js + Supabase + TypeScript**

</div>