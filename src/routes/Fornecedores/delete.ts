import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const DeleteFornecedor = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete("/fornecedor/delete/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid("ID inválido"),
            }),
        },
    },
        async (req, reply) => {
            const startTime = Date.now();
            const { id } = req.params as { id: string };
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                // Verificar se fornecedor existe
                const fornecedor = await prisma.fornecedores.findUnique({
                    where: { id },
                    include: {
                        _count: {
                            select: {
                                compras: true,
                            }
                        }
                    }
                });

                if (!fornecedor) {
                    return reply.status(404).send({
                        success: false,
                        message: "Fornecedor não encontrado"
                    });
                }

                // Verificar se o fornecedor tem compras ou produtos associados
                if (fornecedor._count.compras > 0) {
                    return reply.status(400).send({
                        success: false,
                        message: "Não é possível excluir o fornecedor pois ele possui compras ou produtos associados. Considere inativá-lo em vez de excluir.",
                        hasCompras: fornecedor._count.compras > 0,
                    });
                }

                await prisma.fornecedores.delete({
                    where: { id },
                });

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Deletar Fornecedor",
                    user,
                    user_id: userId,
                    details: `Fornecedor ${fornecedor.nome} deletado com sucesso`,
                    ip,
                    resource: "fornecedores",
                    resource_id: id,
                    duration,
                });

                return reply.status(200).send({
                    success: true,
                    message: "Fornecedor deletado com sucesso",
                });
            } catch (error) {
                const duration = Date.now() - startTime;
                await logger.error({
                    action: "Deletar Fornecedor",
                    user,
                    user_id: userId,
                    details: `Erro ao deletar fornecedor: ${(error as Error).message}`,
                    ip,
                    resource: "fornecedores",
                    resource_id: id,
                    duration,
                });

                return reply.status(500).send({
                    success: false,
                    message: "Erro ao deletar fornecedor"
                });
            }
        }
    );
};