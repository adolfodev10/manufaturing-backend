import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const CreateFormula = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post('/formulas/create', {
    schema: {
      body: z.object({
        nome: z.string(),
        produto_id: z.string(),
        descricao: z.string().optional(),
        rendimento: z.number(),
        tempo_producao: z.number().optional(),
        instrucoes: z.string().optional(),
        ingredientes: z.array(z.object({
          materia_prima_id: z.string(),
          quantidade: z.number(),
          unidade: z.string().default("KG"),
          percentual: z.number().optional(),
          etapa: z.string().optional(),
        })),
      }),
    },
  }, async (request, reply) => {
    const { nome, produto_id, descricao, rendimento, tempo_producao, instrucoes, ingredientes } = request.body;

    try {
      const formula = await prisma.formulas.create({
        data: {
          nome,
          produto_id,
          descricao,
          rendimento,
          tempo_producao,
          instrucoes,
          itens: {
            create: ingredientes.map(ing => ({
              materia_prima_id: ing.materia_prima_id,
              quantidade: ing.quantidade,
              unidade: ing.unidade,
              percentual: ing.percentual,
              etapa: ing.etapa,
            })),
          },
        },
        include: {
          produto: true,
          itens: {
            include: {
              materia_prima: true,
            },
          },
        },
      });

      return reply.status(201).send(formula);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
};