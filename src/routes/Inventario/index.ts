import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { z } from "zod";

export const InventarioRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/inventario/list",
    {
      schema: {
        querystring: z.object({
          status: z.string().optional(),
          page: z.coerce.number().int().min(1).optional().default(1),
          limit: z.coerce.number().int().min(1).max(100).optional().default(20),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { status, page, limit } = request.query;
        const skip = (page - 1) * limit;
        const where: any = {};
        if (status) where.status = status;

        const [inventarios, total] = await Promise.all([
          prisma.inventarios.findMany({
            where,
            skip,
            take: limit,
            orderBy: { created_at: "desc" },
            include: {
              _count: { select: { itens: true } },
            },
          }),
          prisma.inventarios.count({ where }),
        ]);

        return reply.send({ success: true, data: inventarios, total, page, limit });
      } catch (error) {
        return reply.status(500).send({ success: false, message: "Erro ao listar inventários" });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/inventario/:id",
    {
      schema: { params: z.object({ id: z.string() }) },
    },
    async (request, reply) => {
      try {
        const inventario = await prisma.inventarios.findUnique({
          where: { id: request.params.id },
          include: {
            itens: { orderBy: { produto_nome: "asc" } },
          },
        });

        if (!inventario) {
          return reply.status(404).send({ success: false, message: "Inventário não encontrado" });
        }

        return reply.send({ success: true, data: inventario });
      } catch (error) {
        return reply.status(500).send({ success: false, message: "Erro ao buscar inventário" });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/inventario/create",
    {
      schema: {
        body: z.object({
          responsavel_id: z.string(),
          responsavel_nome: z.string(),
          observacoes: z.string().optional(),
          categoria: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { responsavel_id, responsavel_nome, observacoes, categoria } = request.body;

        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const prefixo = `INV-${ano}-${mes}`;
        const ultimo = await prisma.inventarios.findFirst({
          where: { numero: { startsWith: prefixo } },
          orderBy: { numero: "desc" },
          select: { numero: true },
        });

        let sequencial = 1;
        if (ultimo) {
          const match = ultimo.numero.match(/(\d{3})$/);
          if (match) sequencial = parseInt(match[1]) + 1;
        }
        const numero = `${prefixo}-${String(sequencial).padStart(3, "0")}`;

        const where: any = {};
        if (categoria) where.category = categoria;

        const produtos = await prisma.products.findMany({
          where,
          orderBy: { name_product: "asc" },
        });

        const inventario = await prisma.inventarios.create({
          data: {
            numero,
            status: "EM_CONTAGEM",
            responsavel_id,
            responsavel_nome,
            observacoes,
            total_itens: produtos.length,
            itens: {
              create: produtos.map((p) => ({
                produto_id: p.id_product,
                produto_nome: p.name_product,
                produto_categoria: p.category,
                quantidade_sistema: Number(p.quantity) || 0,
                quantidade_contada: 0,
                divergencia: 0,
                valor_divergencia: 0,
              })),
            },
          },
          include: { itens: true },
        });

        return reply.status(201).send({ success: true, data: inventario });
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ success: false, message: "Erro ao criar inventário" });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().put(
    "/inventario/item/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: z.object({
          quantidade_contada: z.number().int().min(0),
          observacao: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { quantidade_contada, observacao } = request.body;
        const item = await prisma.inventario_itens.findUnique({
          where: { id: request.params.id },
        });

        if (!item) {
          return reply.status(404).send({ success: false, message: "Item não encontrado" });
        }

        const produto = await prisma.products.findUnique({
          where: { id_product: item.produto_id },
          select: { price: true },
        });

        const preco = parseFloat(produto?.price || "0");
        const divergencia = quantidade_contada - item.quantidade_sistema;
        const valorDivergencia = Math.abs(divergencia) * preco;

        const atualizado = await prisma.inventario_itens.update({
          where: { id: request.params.id },
          data: {
            quantidade_contada,
            divergencia,
            valor_divergencia: valorDivergencia,
            observacao,
          },
        });

        return reply.send({ success: true, data: atualizado });
      } catch (error) {
        return reply.status(500).send({ success: false, message: "Erro ao atualizar item" });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/inventario/:id/finalize",
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: z.object({
          usuario_id: z.string(),
          observacoes: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { usuario_id, observacoes } = request.body;

        const inventario = await prisma.inventarios.findUnique({
          where: { id },
          include: { itens: true },
        });

        if (!inventario) {
          return reply.status(404).send({ success: false, message: "Inventário não encontrado" });
        }

        if (inventario.status === "FINALIZADO") {
          return reply.status(400).send({ success: false, message: "Inventário já finalizado" });
        }

        let corretos = 0;
        let divergentes = 0;
        let valorTotal = 0;

        for (const item of inventario.itens) {
          if (item.divergencia === 0) {
            corretos++;
          } else {
            divergentes++;
            valorTotal += Number(item.valor_divergencia);
          }
        }

        await prisma.$transaction(async (tx) => {
          for (const item of inventario.itens) {
            if (item.divergencia !== 0) {
              const produto = await tx.products.findUnique({
                where: { id_product: item.produto_id },
              });

              if (!produto) continue;

              const antes = Number(produto.quantity) || 0;
              const depois = item.quantidade_contada;

              await tx.products.update({
                where: { id_product: item.produto_id },
                data: {
                  quantity: String(depois),
                  updated_at: new Date(),
                  estado: depois === 0 ? "VENDIDO" : "NAO_VENDIDO",
                },
              });

              await tx.movimentos_estoque.create({
                data: {
                  produto_id: item.produto_id,
                  tipo: item.divergencia > 0 ? "ENTRADA_AJUSTE" : "SAIDA_AJUSTE",
                  quantidade: Math.abs(item.divergencia),
                  quantidade_antes: antes,
                  quantidade_depois: depois,
                  motivo: `Ajuste de inventário ${inventario.numero}`,
                  referencia_id: inventario.id,
                  referencia_tipo: "INVENTARIO",
                  usuario_id,
                },
              });
            }
          }

          await tx.inventarios.update({
            where: { id },
            data: {
              status: "FINALIZADO",
              data_fim: new Date(),
              itens_corretos: corretos,
              itens_divergentes: divergentes,
              valor_divergencia: valorTotal,
              observacoes: observacoes || inventario.observacoes,
            },
          });
        });

        return reply.send({
          success: true,
          message: "Inventário finalizado com sucesso",
          data: { corretos, divergentes, valorTotal },
        });
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ success: false, message: "Erro ao finalizar inventário" });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().delete(
    "/inventario/:id",
    {
      schema: { params: z.object({ id: z.string() }) },
    },
    async (request, reply) => {
      try {
        const inventario = await prisma.inventarios.findUnique({
          where: { id: request.params.id },
        });

        if (!inventario) {
          return reply.status(404).send({ success: false, message: "Inventário não encontrado" });
        }

        if (inventario.status === "FINALIZADO") {
          return reply.status(400).send({ success: false, message: "Não é possível excluir inventário finalizado" });
        }

        await prisma.inventarios.delete({ where: { id: request.params.id } });

        return reply.send({ success: true, message: "Inventário excluído" });
      } catch (error) {
        return reply.status(500).send({ success: false, message: "Erro ao excluir inventário" });
      }
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/inventario/movimentos/:produtoId",
    {
      schema: {
        params: z.object({ produtoId: z.string() }),
        querystring: z.object({
          limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { produtoId } = request.params;
        const { limit } = request.query;

        const movimentos = await prisma.movimentos_estoque.findMany({
          where: { produto_id: produtoId },
          orderBy: { created_at: "desc" },
          take: limit,
        });

        return reply.send({ success: true, data: movimentos });
      } catch (error) {
        return reply.status(500).send({ success: false, message: "Erro ao buscar movimentos" });
      }
    }
  );
};