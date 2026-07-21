import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prismaclient";

export const GetFormulas = async (app: FastifyInstance) => {
  app.get('/formulas/getAll', async (request, reply) => {
    try {
      const formulas = await prisma.formulas.findMany({
        include: {
          produto: true,
          itens: {
            include: {
              materia_prima: true,
            },
          },
        },
        orderBy: {
          nome: 'asc',
        },
      });

      return { formulas };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
};