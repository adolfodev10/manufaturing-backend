import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const GetFornecedorById = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/fornecedor/:id", {
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
                const fornecedor = await prisma.fornecedores.findUnique({
                    where: { id },
                    include: {
                        compras: {
                            take: 10,
                            orderBy: { data_pedido: "desc" },
                        },
                    },
                });

                if (!fornecedor) {
                    return reply.status(404).send({ 
                        success: false,
                        message: "Fornecedor não encontrado" 
                    });
                }

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Buscar Fornecedor",
                    user,
                    user_id: userId,
                    details: `Fornecedor ${fornecedor.nome} encontrado`,
                    ip,
                    resource: "fornecedores",
                    resource_id: id,
                    duration,
                });

                return reply.status(200).send({
                    success: true,
                    data: fornecedor,
                });
            } catch (error) {
                const duration = Date.now() - startTime;
                await logger.error({
                    action: "Buscar Fornecedor",
                    user,
                    user_id: userId,
                    details: `Erro ao buscar fornecedor: ${(error as Error).message}`,
                    ip,
                    resource: "fornecedores",
                    resource_id: id,
                    duration,
                });
                
                return reply.status(500).send({ 
                    success: false,
                    message: "Erro ao buscar fornecedor"
                });
            }
        }
    );
};