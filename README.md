# Backend - Sistema de Cotações JR Drogaria

API REST para gerenciamento de cotações, fornecedores, produtos e pedidos de compra para farmácias.

## 📋 Sobre o Sistema

O sistema oferece **duas abordagens** para gerenciar cotações de preços com fornecedores:

### V1 - Importação via Excel (Fluxo Manual)
1. **Criar Lista de Compras**: Usuário cria lista com produtos e quantidades por loja (JR, GS, BARÃO, LB)
2. **Exportar CSV**: Sistema gera arquivo CSV com a lista de produtos
3. **Enviar para Fornecedores**: Usuário envia manualmente o CSV via WhatsApp/Email
4. **Fornecedor Preenche**: Fornecedor preenche preços no Excel e devolve
5. **Importar Respostas**: Usuário importa cada Excel de resposta no sistema
6. **Comparar Preços**: Sistema compara preços e identifica melhores ofertas

### V2 - Links de Cotação (Fluxo Automatizado) ⭐
1. **Criar Cotação**: Usuário cria cotação com produtos selecionados
2. **Gerar Links**: Sistema gera links únicos por fornecedor (token seguro)
3. **Link Genérico**: Opção de link aberto para fornecedores não cadastrados
4. **Fornecedor Preenche Online**: Fornecedor acessa link público e preenche preços
5. **Acompanhamento em Tempo Real**: Sistema mostra status de cada fornecedor
6. **Comparação Automática**: Preços são comparados automaticamente
7. **Gerar Pedidos**: Sistema gera pedidos de compra com melhores preços

## 🛠️ Tecnologias

- **Node.js** + **Express 5**
- **TypeScript**
- **TypeORM** + **MySQL**
- **JWT** para autenticação
- **Swagger** para documentação da API

## 📁 Estrutura de Rotas

| Rota | Descrição |
|------|-----------|
| `/health` | Health check do servidor |
| `/api/v1/auth` | Autenticação (login, registro) |
| `/api/v1/products` | CRUD de produtos |
| `/api/v1/suppliers` | CRUD de fornecedores |
| `/api/v1/shopping` | Listas de compras (V1) |
| `/api/v1/quotations` | Cotações (V2) |
| `/api/v1/orders` | Pedidos de compra |
| `/api/v1/public` | Rotas públicas para fornecedores |
| `/api/docs` | Documentação Swagger |

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm run start:prod

# Health check
npm run health-check
```

## ⚙️ Variáveis de Ambiente

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=shoppinglist
JWT_SECRET=your-secret-key
```

## 🔄 Deploy Automático

O projeto está configurado para deploy automático via GitHub Actions.

### GitHub Secrets Necessários

| Secret | Descrição |
|--------|-----------|
| `VPS_HOST` | IP ou hostname do VPS |
| `VPS_USERNAME` | Usuário SSH |
| `VPS_SSH_KEY` | Chave privada SSH |
| `VPS_SSH_PORT` | Porta SSH (padrão: 22) |

### Requisitos do VPS

1. Node.js e npm instalados
2. PM2 instalado globalmente: `npm install -g pm2`
3. MySQL configurado
4. Arquivo `.env` configurado no servidor

## 📊 Health Check

O script de health check valida todos os endpoints da API:

```bash
npm run health-check
```

Endpoints verificados:
- ✅ `/health` - Status do servidor
- ✅ `/api/v1/auth/login` - Autenticação
- ✅ `/api/v1/products` - Produtos
- ✅ `/api/v1/suppliers` - Fornecedores
- ✅ `/api/v1/shopping` - Listas de compras
- ✅ `/api/v1/quotations` - Cotações
- ✅ `/api/v1/orders` - Pedidos
- ✅ `/api/docs` - Swagger

## 👤 Autor

**Carlos Moreira**
