import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { categoriaIdParamsSchema } from "../../modules/validations/categoria/categoria.schema";

export const DeleteCategoria = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/categorias/delete/:id",
    { schema: { params: categoriaIdParamsSchema } },
    async (request, reply) => {
      const startTime = Date.now();
      const ip = request.ip || request.socket.remoteAddress || "unknown";
      const userEmail = (request as any).user?.email || "sistema";
      const userId = (request as any).user?.id;
      const userRole = ((request as any).user?.role || "").toUpperCase();

      if (!["ADMINISTRADOR", "GERENTE"].includes(userRole)) {
        return reply.status(403).send({ error: "Sem permissão para eliminar categorias" });
      }

      try {
        const { id } = request.params;

        const categoria = await prisma.categoria.findUnique({
          where: { id },
          include: {
            _count: {
              select: { produtos: true, estoque: true },
            },
          },
        });

        if (!categoria) {
          return reply.status(404).send({ error: "Categoria não encontrada" });
        }

        const totalAssociados =
          categoria._count.produtos + categoria._count.estoque;

        if (totalAssociados > 0) {
          return reply.status(409).send({
            error: `Não podes eliminar "${categoria.nome}" porque tem ${totalAssociados} produto(s) associado(s). Desative-a em vez de eliminar.`,
          });
        }

        await prisma.categoria.delete({ where: { id } });

        await logger.success({
          action: "Eliminar Categoria",
          user: userEmail,
          user_id: userId,
          details: `Categoria eliminada: "${categoria.nome}" (ID: ${id})`,
          ip,
          resource: "categorias",
          resource_id: id,
          duration: Date.now() - startTime,
        });

        return reply.send({
          success: true,
          message: "Categoria eliminada com sucesso",
        });
      } catch (error: any) {
        return reply.status(500).send({
          error: "Erro ao eliminar categoria",
          message: error.message,
        });
      }
    }
  );
};