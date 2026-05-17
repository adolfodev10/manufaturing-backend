import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const GetAllProduct = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/product/getAll', {},
        async (req, reply) => {
            const startTime = Date.now();
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                const products = await prisma.products.findMany({
                    orderBy: {
                        name_product: 'asc',
                    },
                });

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Listar Produtos",
                    user,
                    user_id: userId,
                    details: `Listagem de produtos realizada. Total: ${products.length} produto(s)`,
                    ip,
                    resource: "products",
                    duration,
                });

                return reply.status(200).send(products);

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Listar Produtos",
                    user,
                    user_id: userId,
                    details: `Erro ao listar produtos: ${error.message}`,
                    ip,
                    resource: "products",
                    duration,
                });

                console.error("Erro ao listar produtos:", error);
                
                return reply.status(500).send({ 
                    error: "Erro ao listar produtos",
                    message: error.message 
                });
            }
        });
};


export const GetAllProductTheVenda = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/product/getAllProductTheVenda', {},
        async (req, reply) => {
            const startTime = Date.now();
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                const products = await prisma.products.findMany({
                    where: {
                        estado: "NAO_VENDIDO"
                    },
                    orderBy: {
                        name_product: 'asc',
                    },
                });

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Listar Produtos Disponíveis",
                    user,
                    user_id: userId,
                    details: `Listagem de produtos disponíveis para venda. Total: ${products.length} produto(s)`,
                    ip,
                    resource: "products",
                    duration,
                });

                return reply.status(200).send(products);

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Listar Produtos Disponíveis",
                    user,
                    user_id: userId,
                    details: `Erro ao listar produtos disponíveis: ${error.message}`,
                    ip,
                    resource: "products",
                    duration,
                });

                console.error("Erro ao listar produtos disponíveis:", error);
                
                return reply.status(500).send({ 
                    error: "Erro ao listar produtos",
                    message: error.message 
                });
            }
        });
};


export const GetProfitByMonth = async (app: FastifyInstance) => {
    app.get('/product/getProfitByMonth', async (req, res) => {
        const now = new Date();
        const fiveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 4, 1)
        const result = await prisma.products.findMany({
            where: {
                estado: "NAO_VENDIDO",
                updated_at: {
                    gte: fiveMonthsAgo,
                },
            },
            select: {
                price: true,
                updated_at: true,
                totalLucro: true,
            }
        });
        const produtosVendidos: Record<string, number> = {};

        for (const item of result) {
            const date = new Date(item.updated_at);

            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

            if (!produtosVendidos[month]) {
                produtosVendidos[month] = 0;
            }
            produtosVendidos[month] += Number(item.price);
        }
        const formatted = Object.entries(produtosVendidos).map(([month, totalLucro]) => ({
            month,
            totalLucro,
        }))
            .sort((a, b) => a.month.localeCompare(b.month));
        return res.send(formatted);
    });
}
