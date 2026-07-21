import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prismaclient";

export const GetProducoes = async (app: FastifyInstance) => {
  app.get('/producao/getAll', async (request, reply) => {
    try {
      const producoes = await prisma.producoes.findMany({
        include: {
          produto: true,
          responsavel: {
            select: {
              id_user: true,
              name: true,
              email: true,
            },
          },
          materiais: {
            include: {
              materia_prima: true,
            },
          },
        },
        orderBy: {
          data_producao: 'desc',
        },
      });

      return { producoes };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
};