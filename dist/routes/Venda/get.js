"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfitByMonth = exports.GetAllVenda = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const zod_1 = require("zod");
const GetAllVenda = async (app) => {
    app.withTypeProvider().get("/venda/getAll", {}, async (request, reply) => {
        const vendas = await prismaclient_1.prisma.venda.findMany();
        return reply.status(200).send(vendas);
    });
};
exports.GetAllVenda = GetAllVenda;
const GetProfitByMonth = async (app) => {
    app.withTypeProvider().get('/venda/getProfitByMonth', {
        schema: {
            response: {
                200: zod_1.z.array(zod_1.z.object({
                    mes: zod_1.z.string(),
                    totalLucro: zod_1.z.number(),
                }))
            }
        }
    }, async (request, reply) => {
        const produtosVendidos = await prismaclient_1.prisma.products.findMany({
            where: {
                status: "NAO_VENDIDO",
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
        const lucroPorMes = {};
        for (const produto of produtosVendidos) {
            if (!produto.updated_at)
                continue;
            const date = new Date(produto.updated_at);
            if (isNaN(date.getTime()))
                continue;
            const mes = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const preco = parseFloat(produto.price || "0");
            const quantidade = parseInt(produto.quantity || "0");
            const lucro = preco * quantidade;
            if (!lucroPorMes[mes])
                lucroPorMes[mes] = 0;
            lucroPorMes[mes] += lucro;
        }
        const resultado = Object.entries(lucroPorMes).map(([mes, totalLucro]) => ({
            mes,
            totalLucro,
        }));
        return reply.status(200).send(resultado);
    });
};
exports.GetProfitByMonth = GetProfitByMonth;
