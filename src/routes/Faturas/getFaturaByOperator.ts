import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { z } from "zod";
import { logger } from "../../modules/services/logs/logger";

export const GetFaturaByOperador = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/fatura/operador/:operadorId",
    {
      schema: {
        params: z.object({
          operadorId: z.string(),
        }),
        querystring: z.object({
          status: z.string().optional(),
          search: z.string().optional(),
          page: z.coerce.number().int().min(1).optional().default(1),
          limit: z.coerce.number().int().min(1).max(200).optional().default(100),
        }),
      },
    },
    async (request, reply) => {
      const startTime = Date.now();
      const { operadorId } = request.params;
      const { status, search, page, limit } = request.query;
      const ip = request.ip || request.socket.remoteAddress || "unknown";
      const user = (request as any).user?.email || "sistema";
      const userId = (request as any).user?.id;

      try {
        const skip = (page - 1) * limit;
        const where: any = { operadorId };

        if (status) where.status = status;

        if (search) {
          where.OR = [
            { numero: { contains: search, mode: "insensitive" } },
            { clienteNome: { contains: search, mode: "insensitive" } },
            { clienteNIF: { contains: search } },
          ];
        }

        const [faturas, total] = await Promise.all([
          prisma.faturas.findMany({
            where,
            skip,
            take: limit,
            orderBy: { dataEmissao: "desc" },
            include: { itens: true },
          }),
          prisma.faturas.count({ where }),
        ]);

        const duration = Date.now() - startTime;

        await logger.success({
          action: "Listar Faturas por Operador",
          user,
          user_id: userId,
          details: `Operador ${operadorId} - Total: ${total}`,
          ip,
          resource: "faturas",
          duration,
        });

        return reply.status(200).send({
          success: true,
          data: faturas,
          total,
          page,
          limit,
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        await logger.error({
          action: "Listar Faturas por Operador",
          user,
          user_id: userId,
          details: `Erro: ${(error as Error).message}`,
          ip,
          resource: "faturas",
          duration,
        });

        return reply.status(500).send({
          success: false,
          message: "Erro ao listar faturas do operador",
        });
      }
    }
  );
};