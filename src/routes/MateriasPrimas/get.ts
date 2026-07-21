import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prismaclient";

export const GetMateriasPrimas = async (app: FastifyInstance) => {
  app.get('/materias-primas/getAll', async (request, reply) => {
    try {
      const materias = await prisma.materiasPrimas.findMany({
        orderBy: {
          nome: 'asc',
        },
      });

      return { materias };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
};