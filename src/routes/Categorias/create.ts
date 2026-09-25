import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { createCategoriaSchema } from "../../modules/validations/categoria/categoria.schema";

export const CreateCategoria = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/categorias/create",
    { schema: { body: createCategoriaSchema } },
    async (request, reply) => {
      const startTime = Date.now();
      const ip = request.ip || request.socket.remoteAddress || "unknown";
      const userEmail = (request as any).user?.email || "sistema";
      const userId = (request as any).user?.id;
      const userRole = ((request as any).user?.role || "").toUpperCase();

      if (!["ADMINISTRADOR", "GERENTE"].includes(userRole)) {
        return reply.status(403).send({ error: "Sem permissão para criar categorias" });
      }

      try {
        const { nome, descricao } = request.body;

        const existente = await prisma.categoria.findFirst({
          where: {
            nome: { equals: nome, 
            },
          },
        });

        if (existente) {
          return reply.status(409).send({
            error: `Já existe uma categoria com o nome "${nome}".`,
          });
        }

        const categoria = await prisma.categoria.create({
          data: { nome, descricao },
        });

        await logger.success({
          action: "Criar Categoria",
          user: userEmail,
          user_id: userId,
          details: `Categoria criada: "${nome}" (ID: ${categoria.id})`,
          ip,
          resource: "categorias",
          resource_id: categoria.id,
          duration: Date.now() - startTime,
        });

        return reply.status(201).send({ success: true, data: categoria });
      } catch (error: any) {
        await logger.error({
          action: "Criar Categoria",
          user: userEmail,
          user_id: userId,
          details: `Erro ao criar categoria: ${error.message}`,
          ip,
          resource: "categorias",
          duration: Date.now() - startTime,
        });

        return reply.status(500).send({
          error: "Erro ao criar categoria",
          message: error.message,
        });
      }
    }
  );
};