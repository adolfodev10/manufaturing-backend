"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfitByMonth = exports.GetAllProductTheVenda = exports.GetAllProduct = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const GetAllProduct = async (app) => {
    app.withTypeProvider().get('/product/getAll', {}, async (req, reply) => {
        const products = await prismaclient_1.prisma.products.findMany({});
        return reply.status(200).send(products);
    });
};
exports.GetAllProduct = GetAllProduct;
const GetAllProductTheVenda = async (app) => {
    app.withTypeProvider().get('/product/getAllProductTheVenda', {}, async (req, reply) => {
        const products = await prismaclient_1.prisma.products.findMany({
            where: {
                status: "NAO_VENDIDO"
            }
        });
        return reply.status(200).send(products);
    });
};
exports.GetAllProductTheVenda = GetAllProductTheVenda;
const GetProfitByMonth = async (app) => {
    app.get('/product/getProfitByMonth', async (req, res) => {
        const now = new Date();
        const fiveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 4, 1);
        const result = await prismaclient_1.prisma.products.findMany({
            where: {
                status: "NAO_VENDIDO",
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
        const produtosVendidos = {};
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
};
exports.GetProfitByMonth = GetProfitByMonth;
