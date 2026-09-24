import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { z } from "zod";

export const GetInventario = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/inventario/getAll",
    {
      schema: {
        querystring: z.object({
          categoriaId: z.string().uuid().optional(),
          local: z.enum(["todos", "armazem", "loja"]).optional().default("todos"),
          apenasComStock: z.coerce.boolean().optional().default(false),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { categoriaId, local, apenasComStock } = request.query;

        // ============================================================
        // 1. Buscar itens do ARMAZÉM
        // ============================================================
        const whereEstoque: any = {};
        if (categoriaId) whereEstoque.categoriaId = categoriaId;
        if (apenasComStock) {
          // quantity é string — filtro numérico no JS depois
        }

        const estoqueRaw = await prisma.estoque.findMany({
          where: whereEstoque,
          include: { categoria: true },
          orderBy: { name: "asc" },
        });

        // ============================================================
        // 2. Buscar itens da LOJA
        // ============================================================
        const whereProducts: any = {};
        if (categoriaId) whereProducts.categoriaId = categoriaId;

        const productsRaw = await prisma.products.findMany({
          where: whereProducts,
          include: { categoria: true },
          orderBy: { name_product: "asc" },
        });

        // ============================================================
        // 3. Normalizar para um formato único
        // ============================================================
        type InventarioItem = {
          id: string;
          tipo: "ARMAZEM" | "LOJA";
          nome: string;
          categoria: string;
          quantidade: number;
          precoCompra: number;
          precoVenda: number;
          valorCusto: number;
          valorVenda: number;
          margem: number;
          dataValidade: string | null;
          estado: string;
          actualizadoEm: string;
        };

        const formatDate = (value: Date | string | null) =>
          value ? new Date(value).toISOString() : null;

        const estoqueItems: InventarioItem[] = estoqueRaw.map((e) => {
          const qtd = Number(e.quantity) || 0;
          const precoCompra = Number(e.preco_compra) || 0;
          const precoVenda = Number(e.price) || 0;
          const valorCusto = qtd * precoCompra;
          const valorVenda = qtd * precoVenda;
          const margem =
            valorVenda > 0 ? ((valorVenda - valorCusto) / valorVenda) * 100 : 0;

          const isExpired = e.date_validate
            ? new Date(e.date_validate) < new Date()
            : false;

          return {
            id: e.id_estoque,
            tipo: "ARMAZEM",
            nome: e.name,
            categoria: e.categoria?.nome ?? e.category ?? "Sem categoria",
            quantidade: qtd,
            precoCompra,
            precoVenda,
            valorCusto,
            valorVenda,
            margem: Number(margem.toFixed(2)),
            dataValidade: formatDate(e.date_validate),
            estado: isExpired ? "EXPIRADO" : String(e.estado),
            actualizadoEm: e.updated_at.toISOString(),
          };
        });

        const lojaItems: InventarioItem[] = productsRaw.map((p) => {
          const qtd = Number(p.quantity) || 0;
          const precoCompra = Number(p.preco_compra) || 0;
          const precoVenda = Number(p.price) || 0;
          const valorCusto = qtd * precoCompra;
          const valorVenda = qtd * precoVenda;
          const margem =
            valorVenda > 0 ? ((valorVenda - valorCusto) / valorVenda) * 100 : 0;

          const isExpired = p.date_validate
            ? new Date(p.date_validate) < new Date()
            : false;

          return {
            id: p.id_product,
            tipo: "LOJA",
            nome: p.name_product,
            categoria: p.categoria?.nome ?? p.category ?? "Sem categoria",
            quantidade: qtd,
            precoCompra,
            precoVenda,
            valorCusto,
            valorVenda,
            margem: Number(margem.toFixed(2)),
            dataValidade: formatDate(p.date_validate),
            estado: isExpired ? "EXPIRADO" : String(p.estado),
            actualizadoEm: p.updated_at.toISOString(),
          };
        });

        // ============================================================
        // 4. Aplicar filtros finais
        // ============================================================
        let items: InventarioItem[] = [];

        if (local === "armazem") {
          items = estoqueItems;
        } else if (local === "loja") {
          items = lojaItems;
        } else {
          items = [...estoqueItems, ...lojaItems];
        }

        if (apenasComStock) {
          items = items.filter((i) => i.quantidade > 0);
        }

        // ============================================================
        // 5. Calcular totais
        // ============================================================
        const totalProdutosArmazem = estoqueItems.reduce(
          (s, i) => s + i.quantidade,
          0
        );
        const totalProdutosLoja = lojaItems.reduce(
          (s, i) => s + i.quantidade,
          0
        );
        const valorCustoTotal = items.reduce((s, i) => s + i.valorCusto, 0);
        const valorVendaTotal = items.reduce((s, i) => s + i.valorVenda, 0);
        const margemMedia =
          valorVendaTotal > 0
            ? ((valorVendaTotal - valorCustoTotal) / valorVendaTotal) * 100
            : 0;
        const produtosComEstoqueBaixo = items.filter(
          (i) => i.quantidade > 0 && i.quantidade < 10
        ).length;
        const produtosExpirados = items.filter(
          (i) => i.estado === "EXPIRADO"
        ).length;
        const produtosEsgotados = items.filter((i) => i.quantidade === 0).length;

        return reply.send({
          success: true,
          data: items,
          totais: {
            totalLinhas: items.length,
            totalProdutosArmazem,
            totalProdutosLoja,
            valorCustoTotal,
            valorVendaTotal,
            margemMedia: Number(margemMedia.toFixed(2)),
            produtosComEstoqueBaixo,
            produtosExpirados,
            produtosEsgotados,
          },
        });
      } catch (error: any) {
        console.error("Erro ao gerar inventário:", error);
        return reply.status(500).send({
          success: false,
          error: "Erro ao gerar inventário",
          message: error.message,
        });
      }
    }
  );
};