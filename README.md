# EKO Backend

API REST para gestao integrada de operacoes comerciais. O backend centraliza
autenticacao, usuarios, produtos, estoque, vendas, dividas, clientes,
fornecedores, faturacao, permissoes, logs, backups e configuracoes.

## Funcionalidades

- Autenticacao com JWT e validacao de usuarios ativos.
- Autorizacao por funcao de usuario e protecao global das rotas privadas.
- Gestao de usuarios, perfis e permissoes.
- Gestao de produtos e estoque.
- Registo de vendas e calculo de lucro mensal.
- Gestao de clientes, fornecedores e dividas.
- Criacao, consulta e atualizacao de faturas.
- Registo e consulta de logs do sistema.
- Configuracao e simulacao de backups.
- Gestao das configuracoes gerais do sistema.
- Validacao de payloads com Zod.
- Migrations versionadas com Prisma.

## Tecnologias

- Node.js
- TypeScript
- Fastify
- Prisma ORM
- MySQL / MariaDB
- Zod
- JSON Web Token
- bcrypt
- Socket.IO
- Nodemailer

## Requisitos

- Node.js 18 ou superior
- npm
- MySQL ou MariaDB
- Git

## Instalacao

Clone o repositorio e aceda ao diretorio:

```bash
git clone <URL_DO_REPOSITORIO>
cd manufaturing-backend
```

Instale as dependencias:

```bash
npm install
```

Crie uma base MySQL:

```sql
CREATE DATABASE EKO
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Crie o arquivo `.env` com base no `.env.example`:

```env
DATABASE_URL="mysql://root:PASSWORD@localhost:3306/EKO"
JWT_SECRET="substitua-por-um-segredo-forte"
PORT=3300
NODE_ENV=development
CROSS_ORIGIN="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"

SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

Para uma instalacao local sem senha no utilizador `root`, pode usar:

```env
DATABASE_URL="mysql://root@localhost:3306/EKO"
```

## Base de Dados

Valide o schema Prisma:

```bash
npm run prisma:validate
```

Aplique as migrations existentes:

```bash
npm run prisma:migrate
```

Para criar uma nova migration durante o desenvolvimento:

```bash
npx prisma migrate dev --name nome_da_migration
```

Gere o Prisma Client quando necessario:

```bash
npx prisma generate
```

## Execucao

Inicie o servidor em desenvolvimento:

```bash
npm run dev
```

Ou execute diretamente com TypeScript:

```bash
npm run start:server
```

Para gerar e executar o build de producao:

```bash
npm run build
npm start
```

A API ficara disponivel por padrao em:

```text
http://localhost:3300
```

## Primeiro Utilizador

Quando a base de dados ainda nao possui usuarios, a rota abaixo permite criar
o primeiro administrador sem token:

```http
POST /user/create
```

```json
{
  "name": "Administrador EKO",
  "email": "admin@eko.ao",
  "senha": "Senha123",
  "phone_number": "923000000",
  "born": "1990-01-01",
  "role": "ADMINISTRADOR"
}
```

Depois da criacao do primeiro usuario, essa rota exige um token de
administrador.

## Autenticacao

Realize o login:

```http
POST /auth/login
```

```json
{
  "email": "admin@eko.ao",
  "password": "Senha123"
}
```

Nas rotas protegidas, envie o token retornado no header:

```http
Authorization: Bearer SEU_TOKEN
Content-Type: application/json
```

## Endpoints Principais

### Autenticacao e Usuarios

```text
POST   /auth/login
POST   /auth/validateToken
POST   /user/create
GET    /user/getAll
GET    /user/:userId
GET    /user/getUserByRole?role=ADMINISTRADOR
PUT    /user/edit/:id
DELETE /user/delete/:id_user
```

### Produtos, Estoque e Vendas

```text
POST   /product/create
POST   /product/add
GET    /product/getAll
GET    /product/getAllProductTheVenda
GET    /product/getProfitByMonth
PUT    /product/edit/:id_product
DELETE /product/delete/:id_product

POST   /stock/create
GET    /stock/getAll
PUT    /stock/edit/:id_estoque
DELETE /stock/delete/:id_estoque

POST   /venda/create
GET    /venda/getAll
GET    /venda/getProfitByMonth
```

### Clientes, Dividas e Fornecedores

```text
POST   /client/create
GET    /client/getAll
PUT    /client/update/:id_client
DELETE /client/delete/:id

POST   /divida/create
GET    /divida/getAll
GET    /divida/client/:client_id
PUT    /divida/update/:id
DELETE /divida/delete/:id

POST   /fornecedor/create
GET    /fornecedores
GET    /fornecedor/:id
PUT    /fornecedor/update/:id
DELETE /fornecedor/delete/:id
```

### Faturas

```text
POST /fatura/create
GET  /fatura/getAll
GET  /fatura/:id
GET  /fatura/numero/:numero
PUT  /fatura/:id
```

### Perfis e Permissoes

```text
POST   /permissoes
GET    /permissoes
GET    /permissoes/:id
PUT    /permissoes/:id
DELETE /permissoes/:id

POST   /perfis
GET    /perfis
GET    /perfis/:id
PUT    /perfis/:id
DELETE /perfis/:id
POST   /perfis/atribuir
DELETE /perfis/remover
GET    /perfis/:id/usuarios
```

### Logs, Backups e Configuracoes

```text
GET    /logs
GET    /logs/:id
GET    /logs/stats
DELETE /logs/:id
DELETE /logs/clear

GET    /backups
GET    /backups/stats
GET    /backups/config
POST   /backups/config
POST   /backups/create
GET    /backups/:id/download
DELETE /backups/:id

GET /configuracoes
PUT /configuracoes
```

## Scripts Disponiveis

```text
npm run dev              Inicia o servidor com recarregamento
npm run start:server     Inicia diretamente com TypeScript
npm run build            Limpa dist e compila o projeto
npm start                Executa o build compilado
npm run prisma:validate  Valida o schema Prisma
npm run prisma:migrate   Aplica migrations pendentes
npm run lint             Executa o ESLint
```

## Estrutura Principal

```text
prisma/
  migrations/       Historico de migrations
  schema.prisma     Modelos e configuracao da base de dados

src/
  lib/              Instancias Fastify e Prisma
  modules/          Servicos e validacoes
  plugins/          Plugins do servidor
  routes/           Rotas organizadas por modulo
  server.ts         Configuracao e inicializacao da API
```

## Observacoes

- A base de dados configurada localmente utiliza o nome `EKO`.
- A criacao de backups atualmente regista e simula o backup; ainda nao gera um
  dump MySQL real.
- O envio de emails depende das credenciais SMTP configuradas no `.env`.
- Nunca envie o arquivo `.env` ou segredos reais para o repositorio.

## Licenca

Consulte o arquivo `LICENSE` do projeto.
