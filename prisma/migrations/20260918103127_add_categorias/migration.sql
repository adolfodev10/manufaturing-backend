-- AlterTable
ALTER TABLE "public"."estoque" ADD COLUMN     "categoria_id" TEXT;

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "categoria_id" TEXT;

-- CreateTable
CREATE TABLE "public"."categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "public"."categorias"("nome");

-- CreateIndex
CREATE INDEX "estoque_categoria_id_idx" ON "public"."estoque"("categoria_id");

-- CreateIndex
CREATE INDEX "products_categoria_id_idx" ON "public"."products"("categoria_id");

-- AddForeignKey
ALTER TABLE "public"."estoque" ADD CONSTRAINT "estoque_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
