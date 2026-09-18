import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { z } from "zod";

export const GetCategorias = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/categorias/getAll",
    {
      schema: {
        querystring: z.object({
          incluirInativas: z.coerce.boolean().optional().default(false),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { incluirInativas } = request.query;

        const categorias = await prisma.categoria.findMany({
          where: incluirInativas ? {} : { ativo: true },
          orderBy: { nome: "asc" },
          include: {
            _count: {
              select: {
                produtos: true,
                estoque: true,
              },
            },
          },
        });

        return reply.send({ success: true, data: categorias });
      } catch (error: any) {
        return reply.status(500).send({
          error: "Erro ao listar categorias",
          message: error.message,
        });
      }
    }
  );
};