import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import {
  updateCategoriaSchema,
  categoriaIdParamsSchema,
} from "../../modules/validations/categoria/categoria.schema";

export const UpdateCategoria = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/categorias/update/:id",
    { schema: { params: categoriaIdParamsSchema, body: updateCategoriaSchema } },
    async (request, reply) => {
      const startTime = Date.now();
      const ip = request.ip || request.socket.remoteAddress || "unknown";
      const userEmail = (request as any).user?.email || "sistema";
      const userId = (request as any).user?.id;
      const userRole = ((request as any).user?.role || "").toUpperCase();

      if (!["ADMINISTRADOR", "GERENTE"].includes(userRole)) {
        return reply.status(403).send({ error: "Sem permissão para editar categorias" });
      }

      try {
        const { id } = request.params;
        const { nome, descricao, ativo } = request.body;

        const existente = await prisma.categoria.findUnique({ where: { id } });
        if (!existente) {
          return reply.status(404).send({ error: "Categoria não encontrada" });
        }

        if (nome && nome.toLowerCase() !== existente.nome.toLowerCase()) {
          const duplicado = await prisma.categoria.findFirst({
            where: {
              nome: { equals: nome, 
               },
              NOT: { id },
            },
          });
          if (duplicado) {
            return reply.status(409).send({
              error: `Já existe uma categoria com o nome "${nome}".`,
            });
          }
        }

        const categoria = await prisma.categoria.update({
          where: { id },
          data: {
            ...(nome !== undefined && { nome }),
            ...(descricao !== undefined && { descricao }),
            ...(ativo !== undefined && { ativo }),
          },
        });

        await logger.success({
          action: "Editar Categoria",
          user: userEmail,
          user_id: userId,
          details: `Categoria editada: "${categoria.nome}" (ID: ${id})`,
          ip,
          resource: "categorias",
          resource_id: id,
          duration: Date.now() - startTime,
        });

        return reply.send({ success: true, data: categoria });
      } catch (error: any) {
        return reply.status(500).send({
          error: "Erro ao editar categoria",
          message: error.message,
        });
      }
    }
  );
};