# 📚 Documentação do Gestão Notas

## 📋 Sobre esta pasta

Esta pasta contém toda a documentação técnica do projeto Gestão Nota, organizada de forma sistemática para facilitar a navegação e manutenção.

## 🏗️ Estrutura de Nomenclatura

Os arquivos seguem o padrão: **`TIPO_AAAAMMDD_HHMMSS_DESCRICAO.md`**

**IMPORTANTE:** 
- A descrição deve sempre ser em português
- Use horário no formato 24h (HHMMSS)
- A data e hora devem refletir o momento de criação do arquivo

### Tipos de Documentos:
- **FIX** - Correções e soluções de bugs
- **GUIDE** - Guias e tutoriais
- **HIST** - Históricos e registros
- **IMPL** - Implementações de funcionalidades
- **MIGR** - Migrações e atualizações
- **PLAN** - Planos e roadmaps
- **SPEC** - Especificações técnicas e arquiteturas

## 📁 Estrutura de Pastas

```
docs/
├── README.md  # Este arquivo
├── PLAN_20250813_145528_sistema_gestao_notas_fiscais.md
└── IMPL_20250813_145823_sistema_gestao_notas_fiscais.md
```

## 🤖 Integração com Assistentes IA

Para instruções específicas sobre como assistentes IA devem trabalhar com este projeto, consulte o arquivo [`CLAUDE.md`](../CLAUDE.md) na raiz do projeto.

## 📝 Documentos Principais

### Documentação Disponível:

1. **[CLAUDE.md](../CLAUDE.md)** (Raiz do projeto)
   - Documentação técnica completa
   - Instruções para assistentes IA
   - Estrutura do projeto e convenções

2. **[PLAN_20250813_145528_sistema_gestao_notas_fiscais.md](PLAN_20250813_145528_sistema_gestao_notas_fiscais.md)**
   - Especificação completa do sistema
   - Stack tecnológica e arquitetura
   - Funcionalidades e requisitos técnicos
   - Schema do banco de dados
   - Interface do usuário e fluxos

3. **[IMPL_20250813_145823_sistema_gestao_notas_fiscais.md](IMPL_20250813_145823_sistema_gestao_notas_fiscais.md)**
   - Roadmap detalhado de implementação
   - 14 fases com 77 etapas específicas
   - Checkboxes para acompanhar progresso
   - Instruções para commits por etapa
   - Ordem de desenvolvimento estruturada

4. **[SPEC_20250814_200456_padrao_interface_tabelas.md](SPEC_20250814_200456_padrao_interface_tabelas.md)**
   - Padrão consistente para páginas com tabelas
   - Estrutura de componentes e layout
   - Guia completo para implementação
   - Estilos e comportamentos padronizados
   - Checklist para novas implementações

## 📌 Convenções para Criar Documentação

### Regras Obrigatórias:

1. **Padrão de nomenclatura**: `TIPO_AAAAMMDD_HHMMSS_DESCRICAO.md`
2. **Descrições em português** sem acentos ou caracteres especiais
3. **Use underscore** para separar palavras (não use espaços)
4. **Atualize este README** ao adicionar novos tipos de documentos
5. **Documentos concisos** - um tópico por arquivo
6. **Markdown padrão** para formatação

## ⚠️ Importante sobre Datas

**SEMPRE** use o comando `date` para obter a data e hora atuais do sistema ao criar ou atualizar documentação:

```bash
# Para obter a data no formato AAAAMMDD
date +"%Y%m%d"

# Para obter a hora no formato HHMMSS
date +"%H%M%S"

# Para obter data e hora completa
date +"%Y%m%d_%H%M%S"

# Exemplo de uso em documentação:
echo "**Última atualização:** $(date +'%d/%m/%Y')"
```

**NUNCA** use datas baseadas em knowledge cutoff ou assumidas. O sistema pode estar em qualquer mês/ano, sempre verifique com `date`.

## 🔗 Links Úteis

- [Projeto Principal](../)
- [Instruções para IA (CLAUDE.md)](../CLAUDE.md) - Documentação técnica completa
- [CHANGELOG](../CHANGELOG.md) - Histórico de versões

---

> **Nota**: Este README é apenas um índice da documentação. Para informações técnicas do projeto, consulte os documentos listados acima ou o [CLAUDE.md](../CLAUDE.md) na raiz do projeto.