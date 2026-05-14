import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { z } from "zod";
import { logger } from "../../modules/services/logs/logger";

export const GetAllVenda = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/venda/getAll", {
        schema: {
            querystring: z.object({
                page: z.coerce.number().int().min(1).optional().default(1),
                limit: z.coerce.number().int().min(1).max(100).optional().default(10),
                
            })
        }
    },
        async (request, reply) => {
            const startTime = Date.now();
            const { page, limit, search, status, tipo } = request.query as any;
            const ip = request.ip || request.socket.remoteAddress || "unknown";
            const user = (request as any).user?.email || "sistema";
            const userId = (request as any).user?.id;


            try {
                const skip = (page - 1) * limit;

                const where: any = {};

                if (status) {
                    where.status = status;
                }

                if (tipo) {
                    where.tipo = tipo;
                }

                const [vendas, total] = await Promise.all([
                    prisma.venda.findMany({
                        where,
                        skip,
                        take: limit,
                        orderBy: { name_product: "asc" },
                        include: {
                            user: true
                        }
                    }),
                    prisma.venda.count({ where })
                ]);

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Listar Vendas",
                    user,
                    user_id: userId,
                    details: `Listagem de vendas realizada. Total: ${total}`,
                    ip,
                    resource: "vendas",
                    duration,
                });
                return reply.status(200).send(vendas);
            } catch (error) {
                const duration = Date.now() - startTime;
                await logger.error({
                    action: "Listar Vendas",
                    user,
                    user_id: userId,
                    details: `Erro ao listar vendas: ${(error as Error).message}`,
                    ip,
                    resource: "vendas",
                    duration,
                });

                return reply.status(500).send({
                    success: false,
                    message: "Erro ao listar vendas"
                });
            }
        });
}

export const GetProfitByMonth = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/venda/getProfitByMonth', {
        schema: {
            response: {
                200: z.array(
                    z.object({
                        mes: z.string(),
                        totalLucro: z.number(),
                    })
                )
            }
        }
    },
        async (request, reply) => {
            const produtosVendidos = await prisma.products.findMany({
                where: {
                    estado: "NAO_VENDIDO",
                    updated_at: {
                        not: undefined,
                    },
                },
                select: {
                    price: true,
                    quantity: true,
                    updated_at: true,
                },
            });

            const lucroPorMes: Record<string, number> = {};

            for (const produto of produtosVendidos) {
                if (!produto.updated_at) continue;

                const date = new Date(produto.updated_at);

                if (isNaN(date.getTime())) continue;
                const mes = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                const preco = parseFloat(produto.price || "0");
                const quantidade = parseInt(produto.quantity || "0");
                const lucro = preco * quantidade;

                if (!lucroPorMes[mes]) lucroPorMes[mes] = 0;
                lucroPorMes[mes] += lucro;
            }
            const resultado = Object.entries(lucroPorMes).map(([mes, totalLucro]) => ({
                mes,
                totalLucro,
            }));

            return reply.status(200).send(resultado);
        }
    );
}
