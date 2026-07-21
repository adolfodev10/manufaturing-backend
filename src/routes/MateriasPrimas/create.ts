import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const CreateMateriaPrima = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post('/materias-primas/create', {
    schema: {
      body: z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        codigo: z.string().optional(),
        unidade: z.string().default("KG"),
        categoria: z.string().optional(),
        quantidade_atual: z.number().default(0),
        quantidade_minima: z.number().default(10),
        preco_medio: z.number().optional(),
        fornecedor_id: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    try {
      const materia = await prisma.materiasPrimas.create({
        data: request.body,
      });

      return reply.status(201).send(materia);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
};