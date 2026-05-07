import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export const GetAllFornecedores = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/fornecedores", {
        schema: {
            querystring: z.object({
                page: z.coerce.number().int().min(1).optional().default(1),
                limit: z.coerce.number().int().min(1).max(100).optional().default(10),
                search: z.string().optional(),
            }),
        },
    },
        async (req, reply) => {
            const startTime = Date.now();
            const { page, limit, search, status, tipo } = req.query as any;
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                const skip = (page - 1) * limit;

                // Construir filtros
                const where: any = {};

                if (search) {
                    where.OR = [
                        { nome: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                        { telefone: { contains: search, mode: "insensitive" } },
                        { nif: { contains: search, mode: "insensitive" } },
                    ];
                }

                if (status) {
                    where.status = status;
                }

                if (tipo) {
                    where.tipo = tipo;
                }

                // Buscar fornecedores com paginação
                const [fornecedores, total] = await Promise.all([
                    prisma.fornecedores.findMany({
                        where,
                        skip,
                        take: limit,
                        orderBy: { nome: "asc" },
                        include: {
                            _count: {
                                select: {
                                    compras: true,
                                }
                            }
                        }
                    }),
                    prisma.fornecedores.count({ where })
                ]);

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Listar Fornecedores",
                    user,
                    user_id: userId,
                    details: `Listagem de fornecedores realizada. Total: ${total}`,
                    ip,
                    resource: "fornecedores",
                    duration,
                });

                return reply.status(200).send({
                    success: true,
                    data: fornecedores,
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    },
                });
            } catch (error) {
                const duration = Date.now() - startTime;
                await logger.error({
                    action: "Listar Fornecedores",
                    user,
                    user_id: userId,
                    details: `Erro ao listar fornecedores: ${(error as Error).message}`,
                    ip,
                    resource: "fornecedores",
                    duration,
                });

                return reply.status(500).send({
                    success: false,
                    message: "Erro ao listar fornecedores"
                });
            }
        }
    );
};