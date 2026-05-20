import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { z } from "zod";
import { logger } from "../../modules/services/logs/logger";

export const GetAllFaturas = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/fatura/getAll",
    {
      schema: {
        querystring: z.object({
          page: z.coerce.number().int().min(1).optional().default(1),
          limit: z.coerce.number().int().min(1).max(100).optional().default(20),
          status: z.string().optional(),
          operador: z.string().optional(),
          search: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const startTime = Date.now();
      const { page, limit, status, operador, search } = request.query;
      const ip = request.ip || request.socket.remoteAddress || "unknown";
      const user = (request as any).user?.email || "sistema";
      const userId = (request as any).user?.id;

      try {
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
          where.status = status;
        }

        if (operador) {
          where.operador = operador;
        }

        if (search) {
          where.OR = [
            { numero: { contains: search } },
            { clienteNome: { contains: search } },
            { clienteNIF: { contains: search } },
          ];
        }

        const [faturas, total] = await Promise.all([
          prisma.faturas.findMany({
            where,
            skip,
            take: limit,
            orderBy: { dataEmissao: "desc" },
            include: {
              itens: true,
            },
          }),
          prisma.faturas.count({ where }),
        ]);

        const duration = Date.now() - startTime;

        await logger.success({
          action: "Listar Faturas",
          user,
          user_id: userId,
          details: `Listagem de faturas realizada. Total: ${total}`,
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
          action: "Listar Faturas",
          user,
          user_id: userId,
          details: `Erro ao listar faturas: ${(error as Error).message}`,
          ip,
          resource: "faturas",
          duration,
        });

        return reply.status(500).send({
          success: false,
          message: "Erro ao listar faturas",
        });
      }
    }
  );
};

export const GetFaturaById = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/fatura/:id",
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = (request as any).user?.email || "sistema";

      try {
        const fatura = await prisma.faturas.findUnique({
          where: { id_fatura: id },
          include: {
            itens: true,
          },
        });

        if (!fatura) {
          return reply.status(404).send({
            success: false,
            message: "Fatura não encontrada",
          });
        }

        return reply.status(200).send({
          success: true,
          data: fatura,
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          message: "Erro ao buscar fatura",
        });
      }
    }
  );
};

export const GetFaturaByNumero = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/fatura/numero/:numero",
    {
      schema: {
        params: z.object({
          numero: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { numero } = request.params;

      try {
        const fatura = await prisma.faturas.findUnique({
          where: { numero },
          include: {
            itens: true,
          },
        });

        if (!fatura) {
          return reply.status(404).send({
            success: false,
            message: "Fatura não encontrada",
          });
        }

        return reply.status(200).send({
          success: true,
          data: fatura,
        });
      } catch (error) {
        return reply.status(500).send({
          success: false,
          message: "Erro ao buscar fatura",
        });
      }
    }
  );
};