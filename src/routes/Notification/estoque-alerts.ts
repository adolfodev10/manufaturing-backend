import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prismaclient";

export const GetEstoqueAlerts = async (app: FastifyInstance) => {
  app.get('/notifications/estoque-alerts', async (request, reply) => {
    try {
      const produtosBaixoEstoque = await prisma.products.findMany({
        where: {
          estado: {
            notIn: ["EXPIRADO", "VENDIDO"],
          },
        },
      });

      const produtosFiltrados = produtosBaixoEstoque.filter(
        (p) => Number(p.quantity) <= 5
      );

      const materiasBaixoEstoque = await prisma.materiasPrimas.findMany({
        where: {
          status: true,
        },
      });

      const materiasFiltradas = materiasBaixoEstoque.filter(
        (m) => m.quantidade_atual <= m.quantidade_minima
      );

      return {
        alerts: {
          produtos: produtosFiltrados.map(p => ({
            id: p.id_product,
            nome: p.name_product,
            quantidade: Number(p.quantity),
            tipo: "produto",
          })),
          materiasPrimas: materiasFiltradas.map(m => ({
            id: m.id,
            nome: m.nome,
            quantidade: m.quantidade_atual,
            minimo: m.quantidade_minima,
            unidade: m.unidade,
            tipo: "materia_prima",
          })),
          total: produtosFiltrados.length + materiasFiltradas.length,
        },
      };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
};