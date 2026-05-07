import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { prisma } from "../../lib/prismaclient"

export const GetAllProduct = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/product/getAll', {},
        async (req, reply) => {
            const products = await prisma.products.findMany({});
            return reply.status(200).send(products);
        });
}


export const GetAllProductTheVenda = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/product/getAllProductTheVenda', {},
        async (req, reply) => {
            const products = await prisma.products.findMany({
                where: {
                    estado: "NAO_VENDIDO"
                }
            });
            return reply.status(200).send(products);
        });
}

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
