import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const CreateProducao = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post('/producao/create', {
    schema: {
      body: z.object({
        produto_id: z.string(),
        quantidade_litros: z.number(),
        responsavel_id: z.string(),
        materias_primas: z.array(z.object({
          materia_prima_id: z.string(),
          quantidade: z.number(),
          unidade: z.string().default("KG"),
        })),
        observacoes: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    const data = request.body;

    try {
      const producao = await prisma.producoes.create({
        data: {
          produto_id: data.produto_id,
          quantidade: data.quantidade_litros,
          unidade: "LITROS",
          responsavel_id: data.responsavel_id,
          observacoes: data.observacoes,
          materiais: {
            create: data.materias_primas.map(mp => ({
              materia_prima_id: mp.materia_prima_id,
              quantidade: mp.quantidade,
              unidade: mp.unidade,
            })),
          },
        },
        include: {
          produto: true,
          responsavel: true,
          materiais: {
            include: {
              materia_prima: true,
            },
          },
        },
      });

      for (const mp of data.materias_primas) {
        await prisma.materiasPrimas.update({
          where: { id: mp.materia_prima_id },
          data: {
            quantidade_atual: {
              decrement: mp.quantidade,
            },
          },
        });
      }

      return reply.status(201).send(producao);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
};