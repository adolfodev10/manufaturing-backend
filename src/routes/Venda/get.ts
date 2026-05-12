import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { z } from "zod";

export const GetAllVenda = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/venda/getAll", {},
        async (request, reply) => {
            const vendas = await prisma.venda.findMany({
                select: {
                    user: true
                }
            });
            return reply.status(200).send(vendas);
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
