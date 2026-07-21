import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const UpdateMateriaPrima = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().put('/materias-primas/update/:id', {
    schema: {
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        nome: z.string().optional(),
        descricao: z.string().optional(),
        codigo: z.string().optional(),
        unidade: z.string().optional(),
        categoria: z.string().optional(),
        quantidade_atual: z.number().optional(),
        quantidade_minima: z.number().optional(),
        preco_medio: z.number().optional(),
        fornecedor_id: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const data = request.body;

    try {
      const materia = await prisma.materiasPrimas.update({
        where: { id },
        data,
      });

      return reply.send(materia);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
};