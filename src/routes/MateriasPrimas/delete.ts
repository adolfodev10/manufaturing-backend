import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const DeleteMateriaPrima = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete('/materias-primas/delete/:id', {
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
  }, async (request, reply) => {
    const { id } = request.params;

    try {
      await prisma.materiasPrimas.delete({
        where: { id },
      });

      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
};