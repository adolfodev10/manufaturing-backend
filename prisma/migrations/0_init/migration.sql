-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMINISTRADOR', 'OPERADOR', 'GERENTE');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "public"."venda_methodPayment" AS ENUM ('MISTO', 'CACHE', 'TPA');

-- CreateEnum
CREATE TYPE "public"."CaixaStatus" AS ENUM ('ABERTA', 'FECHADA');

-- CreateEnum
CREATE TYPE "public"."venda_estado" AS ENUM ('VENDIDO', 'NAO_VENDIDO', 'EXPIRADO', 'VENDENDO');

-- CreateEnum
CREATE TYPE "public"."estoque_estado" AS ENUM ('NAO_VENDIDO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "public"."dividas_approval" AS ENUM ('PAGAS', 'NAO_PAGAS');

-- CreateEnum
CREATE TYPE "public"."products_methodPayment" AS ENUM ('MISTO', 'CACHE', 'TPA');

-- CreateEnum
CREATE TYPE "public"."products_estado" AS ENUM ('VENDIDO', 'NAO_VENDIDO', 'EXPIRADO', 'VENDENDO');

-- CreateTable
CREATE TABLE "public"."users" (
    "id_user" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "senha" TEXT NOT NULL,
    "avatar" TEXT,
    "born" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVO',
    "role" "public"."Role" NOT NULL DEFAULT 'OPERADOR',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."caixa" (
    "id" TEXT NOT NULL,
    "operador" TEXT NOT NULL,
    "operador_id" TEXT NOT NULL,
    "status" "public"."CaixaStatus" NOT NULL DEFAULT 'ABERTA',
    "valorInicial" DOUBLE PRECISION DEFAULT 0,
    "valorFinal" DOUBLE PRECISION,
    "totalVendas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDinheiro" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTPA" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFaturas" INTEGER NOT NULL DEFAULT 0,
    "data_abertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_fechadura" TIMESTAMP(3),
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "user_id" TEXT,
    "details" TEXT NOT NULL,
    "ip" TEXT,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."backups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "tables" TEXT NOT NULL,
    "records_count" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL,
    "checksum" TEXT,
    "compression_ratio" DOUBLE PRECISION,
    "duration" INTEGER,
    "error" TEXT,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."perfil" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "permissoes" TEXT NOT NULL,
    "usuarios_count" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "recurso" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_perfis" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "perfil_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_perfis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."backup_config" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "retention_days" INTEGER NOT NULL DEFAULT 30,
    "tables" TEXT NOT NULL,
    "compression" BOOLEAN NOT NULL DEFAULT true,
    "encryption" BOOLEAN NOT NULL DEFAULT false,
    "notification_email" TEXT,
    "last_run" TIMESTAMP(3),
    "next_run" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backup_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id_client" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "nif" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id_client")
);

-- CreateTable
CREATE TABLE "public"."estoque" (
    "id_estoque" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "date_validate" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "estado" "public"."estoque_estado" NOT NULL DEFAULT 'NAO_VENDIDO',
    "category" TEXT,

    CONSTRAINT "estoque_pkey" PRIMARY KEY ("id_estoque")
);

-- CreateTable
CREATE TABLE "public"."system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dividas" (
    "id_divida" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approval" "public"."dividas_approval" NOT NULL DEFAULT 'NAO_PAGAS',

    CONSTRAINT "dividas_pkey" PRIMARY KEY ("id_divida")
);

-- CreateTable
CREATE TABLE "public"."faturas" (
    "id_fatura" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3),
    "clienteNome" TEXT NOT NULL,
    "clienteNIF" TEXT,
    "clienteEndereco" TEXT,
    "clienteTelefone" TEXT,
    "clienteEmail" TEXT,
    "clienteCodigo" TEXT,
    "empresaNome" TEXT,
    "empresaNIF" TEXT,
    "empresaEndereco" TEXT,
    "empresaTelefone" TEXT,
    "empresaEmail" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "impostos" DOUBLE PRECISION NOT NULL,
    "descontos" DOUBLE PRECISION DEFAULT 0,
    "totalPagar" DOUBLE PRECISION NOT NULL,
    "operador" TEXT NOT NULL,
    "operadorId" TEXT,
    "formaPagamento" TEXT DEFAULT 'CACHE',
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'EMITIDA',
    "statusAGT" TEXT DEFAULT 'PENDENTE',
    "hashFiscal" TEXT,
    "qrCodeData" TEXT,
    "codigoValidacao" TEXT,
    "caixa_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faturas_pkey" PRIMARY KEY ("id_fatura")
);

-- CreateTable
CREATE TABLE "public"."fatura_items" (
    "id" TEXT NOT NULL,
    "faturaId" TEXT NOT NULL,
    "codigo" TEXT,
    "descricao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DOUBLE PRECISION NOT NULL,
    "desconto" DOUBLE PRECISION DEFAULT 0,
    "impostos" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "taxaIVA" DOUBLE PRECISION NOT NULL DEFAULT 14,

    CONSTRAINT "fatura_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id_product" TEXT NOT NULL,
    "name_product" TEXT NOT NULL,
    "logo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "date_validate" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "methodPayment" "public"."products_methodPayment" NOT NULL DEFAULT 'CACHE',
    "totalLucro" TEXT,
    "estado" "public"."products_estado" NOT NULL DEFAULT 'NAO_VENDIDO',
    "category" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id_product")
);

-- CreateTable
CREATE TABLE "public"."fornecedores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT,
    "nif" TEXT,
    "prazo_pagamento" INTEGER DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."compras" (
    "id" TEXT NOT NULL,
    "fornecedor_id" TEXT NOT NULL,
    "data_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_entrega" TIMESTAMP(3),
    "valor_total" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."venda" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name_product" TEXT,
    "methodPayment" "public"."venda_methodPayment" NOT NULL DEFAULT 'CACHE',
    "date_validate" TIMESTAMP(3) NOT NULL,
    "price" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "estado" "public"."venda_estado" NOT NULL DEFAULT 'NAO_VENDIDO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "date_venda" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT,

    CONSTRAINT "venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."produtosExpirados" (
    "id_expired" TEXT NOT NULL,
    "id_product" TEXT NOT NULL,
    "name_product" TEXT NOT NULL,
    "category" TEXT,
    "price" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "date_validate" TIMESTAMP(3) NOT NULL,
    "date_expired" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT NOT NULL DEFAULT 'Expirado automaticamente',
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtosExpirados_pkey" PRIMARY KEY ("id_expired")
);

-- CreateTable
CREATE TABLE "public"."producoes" (
    "id" TEXT NOT NULL,
    "data_producao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "produto_id" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'LITROS',
    "responsavel_id" TEXT NOT NULL,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."producao_materiais" (
    "id" TEXT NOT NULL,
    "producao_id" TEXT NOT NULL,
    "materia_prima_id" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'KG',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producao_materiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."materias_primas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "codigo" TEXT,
    "unidade" TEXT NOT NULL DEFAULT 'KG',
    "categoria" TEXT,
    "quantidade_atual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantidade_minima" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "preco_medio" DOUBLE PRECISION,
    "fornecedor_id" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materias_primas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."formulas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "descricao" TEXT,
    "rendimento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tempo_producao" INTEGER,
    "instrucoes" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."formula_itens" (
    "id" TEXT NOT NULL,
    "formula_id" TEXT NOT NULL,
    "materia_prima_id" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'KG',
    "percentual" DOUBLE PRECISION,
    "etapa" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formula_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_phone_number_key" ON "public"."users"("phone_number");

-- CreateIndex
CREATE INDEX "caixa_operador_id_idx" ON "public"."caixa"("operador_id");

-- CreateIndex
CREATE INDEX "caixa_status_idx" ON "public"."caixa"("status");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_nome_key" ON "public"."perfil"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "permissoes_modulo_acao_recurso_key" ON "public"."permissoes"("modulo", "acao", "recurso");

-- CreateIndex
CREATE INDEX "user_perfis_perfil_id_idx" ON "public"."user_perfis"("perfil_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_perfis_user_id_perfil_id_key" ON "public"."user_perfis"("user_id", "perfil_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "public"."system_config"("key");

-- CreateIndex
CREATE INDEX "Dividas_client_id_fkey" ON "public"."dividas"("client_id");

-- CreateIndex
CREATE INDEX "Dividas_product_id_fkey" ON "public"."dividas"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "faturas_numero_key" ON "public"."faturas"("numero");

-- CreateIndex
CREATE INDEX "faturas_operadorId_idx" ON "public"."faturas"("operadorId");

-- CreateIndex
CREATE INDEX "faturas_dataEmissao_idx" ON "public"."faturas"("dataEmissao");

-- CreateIndex
CREATE INDEX "faturas_caixa_id_idx" ON "public"."faturas"("caixa_id");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_email_key" ON "public"."fornecedores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_nif_key" ON "public"."fornecedores"("nif");

-- CreateIndex
CREATE INDEX "compras_fornecedor_idx" ON "public"."compras"("fornecedor_id");

-- CreateIndex
CREATE UNIQUE INDEX "materias_primas_nome_key" ON "public"."materias_primas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "formulas_nome_key" ON "public"."formulas"("nome");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_perfis" ADD CONSTRAINT "user_perfis_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_perfis" ADD CONSTRAINT "user_perfis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dividas" ADD CONSTRAINT "dividas_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id_client") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dividas" ADD CONSTRAINT "dividas_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id_product") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."faturas" ADD CONSTRAINT "faturas_caixa_id_fkey" FOREIGN KEY ("caixa_id") REFERENCES "public"."caixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fatura_items" ADD CONSTRAINT "fatura_items_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "public"."faturas"("id_fatura") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."compras" ADD CONSTRAINT "compras_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "public"."fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."venda" ADD CONSTRAINT "venda_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."producoes" ADD CONSTRAINT "producoes_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "public"."products"("id_product") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."producoes" ADD CONSTRAINT "producoes_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."producao_materiais" ADD CONSTRAINT "producao_materiais_producao_id_fkey" FOREIGN KEY ("producao_id") REFERENCES "public"."producoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."producao_materiais" ADD CONSTRAINT "producao_materiais_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "public"."materias_primas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."formulas" ADD CONSTRAINT "formulas_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "public"."products"("id_product") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."formula_itens" ADD CONSTRAINT "formula_itens_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "public"."formulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."formula_itens" ADD CONSTRAINT "formula_itens_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "public"."materias_primas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

