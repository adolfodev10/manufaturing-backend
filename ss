diff --git a/prisma/schema.prisma b/prisma/schema.prisma
index 3ba4fd9..43b460a 100644
--- a/prisma/schema.prisma
+++ b/prisma/schema.prisma
@@ -2,11 +2,6 @@ generator client {
   provider = "prisma-client-js"
 }
 
-// datasource db {
-//   provider = "mysql"
-//   url      = env("DATABASE_URL")
-// }
-
 datasource db {
   provider = "postgresql"
   url      = env("DATABASE_URL")
@@ -22,14 +17,16 @@ model Users {
   born                 DateTime
   created_at           DateTime       @default(now())
   updated_at           DateTime       @updatedAt
-  user_status          UserStatus     @default(PENDENTE)
+  user_status          UserStatus     @default(ACTIVO)
   role                 Role           @default(OPERADOR)
-  perfis               UserPerfil[]
+  password_changed_at  DateTime       @default(now())
+  must_change_password Boolean        @default(false)
+  password_expires_at  DateTime?      @db.Timestamp(6)
   notifications        Notification[]
-  venda                venda[]
   Producoes            Producoes[]
-  must_change_password Boolean        @default(false)
-  password_expires_at  DateTime?
+  sessoes              sessoes[]
+  perfis               UserPerfil[]
+  venda                venda[]
 
   @@map("users")
 }
@@ -40,20 +37,19 @@ model Notification {
   message    String
   created_at DateTime @default(now())
   updated_at DateTime @updatedAt
-  user       Users    @relation(fields: [user_id], references: [id_user], onDelete: Cascade)
   read       Boolean  @default(false)
+  user       Users    @relation(fields: [user_id], references: [id_user], onDelete: Cascade)
 }
 
 model Categoria {
-  id         String   @id @default(uuid())
-  nome       String   @unique
+  id         String     @id @default(uuid())
+  nome       String     @unique
   descricao  String?
-  ativo      Boolean  @default(true)
-  created_at DateTime @default(now())
-  updated_at DateTime @updatedAt
-
-  produtos products[]
-  estoque  estoque[]
+  ativo      Boolean    @default(true)
+  created_at DateTime   @default(now())
+  updated_at DateTime   @updatedAt
+  estoque    estoque[]
+  produtos   products[]
 
   @@map("categorias")
 }
@@ -65,18 +61,16 @@ model Caixa {
   status         CaixaStatus @default(ABERTA)
   valorInicial   Float?      @default(0)
   valorFinal     Float?
-  totalVendas    Float       @default(0)
   totalDinheiro  Float       @default(0)
   totalTPA       Float       @default(0)
   totalFaturas   Int         @default(0)
   data_abertura  DateTime    @default(now())
   data_fechadura DateTime?
-  observacoes    String?     @db.Text
-
-  faturas faturas[]
-
-  created_at DateTime @default(now())
-  updated_at DateTime @updatedAt
+  observacoes    String?
+  created_at     DateTime    @default(now())
+  updated_at     DateTime    @updatedAt
+  faturas        faturas[]
+  venda          venda[]
 
   @@index([operador_id])
   @@index([status])
@@ -90,12 +84,12 @@ model Logs {
   action      String
   user        String
   user_id     String?
-  details     String   @db.Text
+  details     String
   ip          String?
   resource    String
   resource_id String?
-  old_value   String?  @db.Text
-  new_value   String?  @db.Text
+  old_value   String?
+  new_value   String?
   duration    Int?
   created_at  DateTime @default(now())
   updated_at  DateTime @updatedAt
@@ -112,7 +106,7 @@ model Backups {
   status            String
   created_at        DateTime  @default(now())
   completed_at      DateTime?
-  tables            String    @db.Text
+  tables            String
   records_count     Int       @default(0)
   location          String
   checksum          String?
@@ -130,7 +124,7 @@ model Perfil {
   nome           String       @unique
   descricao      String
   nivel          Int          @default(1)
-  permissoes     String       @db.Text
+  permissoes     String
   usuarios_count Int          @default(0)
   is_default     Boolean      @default(false)
   is_system      Boolean      @default(false)
@@ -176,7 +170,7 @@ model BackupConfig {
   dayOfWeek          Int?
   dayOfMonth         Int?
   retention_days     Int       @default(30)
-  tables             String    @db.Text
+  tables             String
   compression        Boolean   @default(true)
   encryption         Boolean   @default(false)
   notification_email String?
@@ -196,6 +190,7 @@ model clients {
   created_at DateTime  @default(now())
   updated_at DateTime
   dividas    dividas[]
+  venda      venda[]
 }
 
 model estoque {
@@ -203,10 +198,9 @@ model estoque {
   name          String
   created_at    DateTime       @default(now())
   updated_at    DateTime
-  date_validate DateTime?
-  price         String
-  preco_compra  String?
-  quantity      String
+  date_validate String
+  price         Decimal        @db.Decimal(15, 2)
+  quantity      Int
   estado        estoque_estado @default(NAO_VENDIDO)
   category      String?
   categoriaId   String?        @map("categoria_id")
@@ -224,25 +218,11 @@ model system_config {
   @@map("system_config")
 }
 
-model configuracoes {
-  id             String   @id @default(uuid())
-  chave          String   @unique
-  valor          Json
-  categoria      String
-  descricao      String?
-  atualizado_por String?
-  created_at     DateTime @default(now())
-  updated_at     DateTime @updatedAt
-
-  @@index([categoria])
-  @@map("configuracoes")
-}
-
 model dividas {
   id_divida  String           @id
   client_id  String
   product_id String
-  price      String
+  price      Decimal          @db.Decimal(15, 2)
   date       DateTime
   created_at DateTime         @default(now())
   updated_at DateTime
@@ -255,49 +235,40 @@ model dividas {
 }
 
 model faturas {
-  id_fatura      String    @id @default(uuid())
-  numero         String    @unique
-  dataEmissao    DateTime
-  dataVencimento DateTime?
-
+  id_fatura       String       @id @default(uuid())
+  numero          String       @unique
+  dataEmissao     DateTime
+  dataVencimento  DateTime?
   clienteNome     String
   clienteNIF      String?
   clienteEndereco String?
   clienteTelefone String?
   clienteEmail    String?
   clienteCodigo   String?
-
   empresaNome     String?
   empresaNIF      String?
   empresaEndereco String?
   empresaTelefone String?
   empresaEmail    String?
-
-  subtotal   Float
-  impostos   Float
-  descontos  Float? @default(0)
-  totalPagar Float
-
-  operador   String
-  operadorId String?
-
-  formaPagamento String? @default("CACHE")
-  observacoes    String? @db.Text
-
-  status    String  @default("EMITIDA")
-  statusAGT String? @default("PENDENTE")
-
+  subtotal        Float
+  impostos        Float
+  descontos       Float?       @default(0)
+  totalPagar      Float
+  operador        String
+  operadorId      String?
+  formaPagamento  String?      @default("CACHE")
+  observacoes     String?
+  status          String       @default("EMITIDA")
+  statusAGT       String?      @default("PENDENTE")
   hashFiscal      String?
-  qrCodeData      String? @db.Text
+  qrCodeData      String?
   codigoValidacao String?
-
-  caixaId String? @map("caixa_id")
-  caixa   Caixa?  @relation(fields: [caixaId], references: [id], onDelete: SetNull)
-
-  itens faturaItem[]
-
-  created_at DateTime @default(now())
-  updated_at DateTime @updatedAt
+  caixaId         String?      @map("caixa_id")
+  created_at      DateTime     @default(now())
+  updated_at      DateTime     @updatedAt
+  itens           faturaItem[]
+  caixa           Caixa?       @relation(fields: [caixaId], references: [id])
+  venda           venda[]
 
   @@index([operadorId])
   @@index([dataEmissao])
@@ -316,50 +287,46 @@ model faturaItem {
   impostos      Float
   total         Float
   taxaIVA       Float   @default(14)
-
-  fatura faturas @relation(fields: [faturaId], references: [id_fatura], onDelete: Cascade)
+  fatura        faturas @relation(fields: [faturaId], references: [id_fatura], onDelete: Cascade)
 
   @@map("fatura_items")
 }
 
 model products {
-  id_product    String                 @id
-  name_product  String
-  logo          String?
-  created_at    DateTime               @default(now())
-  updated_at    DateTime
-  date_validate DateTime?
-  price         String
-  preco_compra  String?
-  quantity      String
-  methodPayment products_methodPayment @default(CACHE)
-  totalLucro    String?
-  estado        products_estado        @default(NAO_VENDIDO)
-
-  category    String?
-  categoriaId String?    @map("categoria_id")
-  categoria   Categoria? @relation(fields: [categoriaId], references: [id], onDelete: Restrict)
-
-  dividas    dividas[]
-  Producoes  Producoes[]
-  Formulas   Formulas[]
-  movimentos movimentos_estoque[]
+  id_product     String                 @id
+  name_product   String
+  logo           String?
+  created_at     DateTime               @default(now())
+  updated_at     DateTime
+  date_validate  String?
+  price          Decimal                @db.Decimal(15, 2)
+  quantity       Int
+  methodPayment  products_methodPayment @default(CACHE)
+  totalLucro     String?
+  estado         products_estado        @default(NAO_VENDIDO)
+  category       String?
+  categoriaId    String?                @map("categoria_id")
+  preco_compra   String?
+  dividas        dividas[]
+  Formulas       Formulas[]
+  Producoes      Producoes[]
+  categoria      Categoria?             @relation(fields: [categoriaId], references: [id], onDelete: Restrict)
+  stock_armarzem stock_armarzem[]
 
   @@index([categoriaId])
 }
 
 model fornecedores {
-  id              String   @id @default(uuid())
+  id              String    @id @default(uuid())
   nome            String
-  email           String   @unique
+  email           String    @unique
   telefone        String
   endereco        String?
-  nif             String?  @unique
-  prazo_pagamento Int?     @default(30)
-  created_at      DateTime @default(now())
-  updated_at      DateTime @updatedAt
-
-  compras compras[]
+  nif             String?   @unique
+  prazo_pagamento Int?      @default(30)
+  created_at      DateTime  @default(now())
+  updated_at      DateTime  @updatedAt
+  compras         compras[]
 
   @@map("fornecedores")
 }
@@ -370,9 +337,9 @@ model compras {
   data_pedido   DateTime     @default(now())
   data_entrega  DateTime?
   valor_total   Decimal      @db.Decimal(15, 2)
-  fornecedor    fornecedores @relation(fields: [fornecedor_id], references: [id], onDelete: Restrict)
   created_at    DateTime     @default(now())
   updated_at    DateTime     @updatedAt
+  fornecedor    fornecedores @relation(fields: [fornecedor_id], references: [id])
 
   @@index([fornecedor_id], map: "compras_fornecedor_idx")
   @@map("compras")
@@ -384,13 +351,21 @@ model venda {
   name_product  String?
   methodPayment venda_methodPayment @default(CACHE)
   date_validate DateTime
-  price         String
-  quantity      String
+  price         Decimal             @db.Decimal(15, 2)
+  quantity      Int
   estado        venda_estado        @default(NAO_VENDIDO)
   created_at    DateTime            @default(now())
   updated_at    DateTime
   date_venda    DateTime?           @default(now())
   category      String?
+  fatura_id     String?
+  cliente_id    String
+  caixa_id      String
+  armazem_id    String
+  armazens      armazens            @relation(fields: [armazem_id], references: [id], onUpdate: NoAction)
+  caixa         Caixa               @relation(fields: [caixa_id], references: [id], onUpdate: NoAction)
+  clients       clients             @relation(fields: [cliente_id], references: [id_client], onUpdate: NoAction)
+  faturas       faturas?            @relation(fields: [fatura_id], references: [id_fatura], onUpdate: NoAction)
   user          Users               @relation(fields: [user_id], references: [id_user], onDelete: Cascade)
 }
 
@@ -399,8 +374,8 @@ model produtosExpirados {
   id_product    String
   name_product  String
   category      String?
-  price         String
-  quantity      String
+  price         Decimal  @db.Decimal(15, 2)
+  quantity      Int
   date_validate DateTime
   date_expired  DateTime @default(now())
   motivo        String   @default("Expirado automaticamente")
@@ -411,179 +386,141 @@ model produtosExpirados {
   @@map("produtosExpirados")
 }
 
-model Series {
-  id      String @id @default(uuid())
-  tipo    String
-  ano     Int
-  mes     Int
-  ultimo  Int    @default(0)
-  prefixo String
-
-  @@unique([tipo, ano, mes])
-}
-
 model Producoes {
-  id             String   @id @default(uuid())
-  data_producao  DateTime @default(now())
+  id             String              @id @default(uuid())
+  data_producao  DateTime            @default(now())
   produto_id     String
   quantidade     Float
-  unidade        String   @default("LITROS")
+  unidade        String              @default("LITROS")
   responsavel_id String
-  observacoes    String?  @db.Text
-  created_at     DateTime @default(now())
-  updated_at     DateTime @updatedAt
-
-  produto     products            @relation(fields: [produto_id], references: [id_product], onDelete: Cascade)
-  responsavel Users               @relation(fields: [responsavel_id], references: [id_user], onDelete: Cascade)
-  materiais   ProducaoMateriais[]
+  observacoes    String?
+  created_at     DateTime            @default(now())
+  updated_at     DateTime            @updatedAt
+  materiais      ProducaoMateriais[]
+  produto        products            @relation(fields: [produto_id], references: [id_product], onDelete: Cascade)
+  responsavel    Users               @relation(fields: [responsavel_id], references: [id_user], onDelete: Cascade)
 
   @@map("producoes")
 }
 
 model ProducaoMateriais {
-  id               String   @id @default(uuid())
+  id               String         @id @default(uuid())
   producao_id      String
   materia_prima_id String
   quantidade       Float
-  unidade          String   @default("KG")
-  created_at       DateTime @default(now())
-
-  producao      Producoes      @relation(fields: [producao_id], references: [id], onDelete: Cascade)
-  materia_prima MateriasPrimas @relation(fields: [materia_prima_id], references: [id], onDelete: Cascade)
+  unidade          String         @default("KG")
+  created_at       DateTime       @default(now())
+  materia_prima    MateriasPrimas @relation(fields: [materia_prima_id], references: [id], onDelete: Cascade)
+  producao         Producoes      @relation(fields: [producao_id], references: [id], onDelete: Cascade)
 
   @@map("producao_materiais")
 }
 
 model MateriasPrimas {
-  id                String   @id @default(uuid())
-  nome              String   @unique
-  descricao         String?
-  codigo            String?
-  unidade           String   @default("KG")
-  categoria         String?
-  quantidade_atual  Float    @default(0)
-  quantidade_minima Float    @default(10)
-  preco_medio       Float?
-  fornecedor_id     String?
-  status            Boolean  @default(true)
-  created_at        DateTime @default(now())
-  updated_at        DateTime @updatedAt
-
-  producao_materiais ProducaoMateriais[]
+  id                 String              @id @default(uuid())
+  nome               String              @unique
+  descricao          String?
+  codigo             String?
+  unidade            String              @default("KG")
+  categoria          String?
+  quantidade_atual   Float               @default(0)
+  quantidade_minima  Float               @default(10)
+  preco_medio        Float?
+  fornecedor_id      String?
+  status             Boolean             @default(true)
+  created_at         DateTime            @default(now())
+  updated_at         DateTime            @updatedAt
   formula_itens      FormulaItens[]
+  producao_materiais ProducaoMateriais[]
 
   @@map("materias_primas")
 }
 
 model Formulas {
-  id             String   @id @default(uuid())
-  nome           String   @unique
+  id             String         @id @default(uuid())
+  nome           String         @unique
   produto_id     String
-  descricao      String?  @db.Text
-  rendimento     Float    @default(0)
+  descricao      String?
+  rendimento     Float          @default(0)
   tempo_producao Int?
-  instrucoes     String?  @db.Text
-  status         Boolean  @default(true)
-  created_at     DateTime @default(now())
-  updated_at     DateTime @updatedAt
-
-  produto products       @relation(fields: [produto_id], references: [id_product], onDelete: Cascade)
-  itens   FormulaItens[]
+  instrucoes     String?
+  status         Boolean        @default(true)
+  created_at     DateTime       @default(now())
+  updated_at     DateTime       @updatedAt
+  itens          FormulaItens[]
+  produto        products       @relation(fields: [produto_id], references: [id_product], onDelete: Cascade)
 
   @@map("formulas")
 }
 
 model FormulaItens {
-  id               String   @id @default(uuid())
+  id               String         @id @default(uuid())
   formula_id       String
   materia_prima_id String
   quantidade       Float
-  unidade          String   @default("KG")
+  unidade          String         @default("KG")
   percentual       Float?
   etapa            String?
-  created_at       DateTime @default(now())
-
-  formula       Formulas       @relation(fields: [formula_id], references: [id], onDelete: Cascade)
-  materia_prima MateriasPrimas @relation(fields: [materia_prima_id], references: [id], onDelete: Cascade)
+  created_at       DateTime       @default(now())
+  formula          Formulas       @relation(fields: [formula_id], references: [id], onDelete: Cascade)
+  materia_prima    MateriasPrimas @relation(fields: [materia_prima_id], references: [id], onDelete: Cascade)
 
   @@map("formula_itens")
 }
 
-model movimentos_estoque {
-  id                String         @id @default(uuid())
-  produto_id        String
-  tipo              tipo_movimento
-  quantidade        Int
-  quantidade_antes  Int
-  quantidade_depois Int
-  motivo            String?
-  referencia_id     String?
-  referencia_tipo   String?
-  usuario_id        String
-  created_at        DateTime       @default(now())
-
-  produto products @relation(fields: [produto_id], references: [id_product], onDelete: Cascade)
-
-  @@index([produto_id, created_at])
-  @@index([tipo, created_at])
-  @@map("movimentos_estoque")
-}
-
-model inventarios {
-  id                String            @id @default(uuid())
-  numero            String            @unique
-  data_inicio       DateTime          @default(now())
-  data_fim          DateTime?
-  status            status_inventario @default(ABERTO)
-  responsavel_id    String
-  responsavel_nome  String
-  observacoes       String?           @db.Text
-  total_itens       Int               @default(0)
-  itens_corretos    Int               @default(0)
-  itens_divergentes Int               @default(0)
-  valor_divergencia Decimal           @default(0) @db.Decimal(15, 2)
-  created_at        DateTime          @default(now())
-  updated_at        DateTime          @updatedAt
-
-  itens inventario_itens[]
-
-  @@map("inventarios")
-}
-
-model inventario_itens {
-  id                 String   @id @default(uuid())
-  inventario_id      String
-  produto_id         String
-  produto_nome       String
-  produto_categoria  String?
-  quantidade_sistema Int
-  quantidade_contada Int
-  divergencia        Int
-  valor_divergencia  Decimal  @db.Decimal(15, 2)
-  observacao         String?
-  created_at         DateTime @default(now())
-
-  inventario inventarios @relation(fields: [inventario_id], references: [id], onDelete: Cascade)
-
-  @@unique([inventario_id, produto_id])
-  @@map("inventario_itens")
-}
-
-enum tipo_movimento {
-  ENTRADA_COMPRA
-  ENTRADA_AJUSTE
-  ENTRADA_DEVOLUCAO
-  SAIDA_VENDA
-  SAIDA_QUEBRA
-  SAIDA_VENCIMENTO
-  SAIDA_AJUSTE
-}
-
-enum status_inventario {
-  ABERTO
-  EM_CONTAGEM
-  FINALIZADO
-  CANCELADO
+model armazens {
+  id             String           @id
+  nome           String
+  tipo           String
+  created_at     DateTime         @default(now())
+  updated_at     DateTime
+  stock_armarzem stock_armarzem[]
+  venda          venda[]
+}
+
+model sessoes {
+  id         String   @id
+  user_id    String
+  ip         String?
+  user_agent String?
+  token      String
+  expires_at DateTime
+  created_at DateTime @default(now())
+  updated_at DateTime
+  users      Users    @relation(fields: [user_id], references: [id_user], onDelete: Cascade)
+
+  @@index([token])
+  @@index([user_id])
+}
+
+model stock_armarzem {
+  id            String   @id
+  produto_id    String
+  armazem_id    String
+  quantidade    Int
+  atualizado_em DateTime @default(now())
+  armazens      armazens @relation(fields: [armazem_id], references: [id], onUpdate: NoAction)
+  products      products @relation(fields: [produto_id], references: [id_product], onUpdate: NoAction)
+
+  @@index([armazem_id])
+  @@index([produto_id])
+}
+
+model tentativas_login {
+  id            String    @id
+  user_id       String?
+  email         String?
+  ip            String?
+  user_agent    String?
+  sucesso       Boolean
+  tentativas    Int       @default(1)
+  bloqueado_ate DateTime?
+  created_at    DateTime  @default(now())
+
+  @@index([created_at])
+  @@index([email])
+  @@index([ip])
+  @@index([user_id])
 }
 
 enum Role {
