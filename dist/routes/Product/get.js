"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfitByMonth = exports.GetAllProductTheVenda = exports.GetAllProduct = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const GetAllProduct = async (app) => {
    app.withTypeProvider().get('/product/getAll', {}, async (req, reply) => {
        const startTime = Date.now();
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            const products = await prismaclient_1.prisma.products.findMany({
                orderBy: {
                    name_product: 'asc',
                },
            });
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Listar Produtos",
                user,
                user_id: userId,
                details: `Listagem de produtos realizada. Total: ${products.length} produto(s)`,
                ip,
                resource: "products",
                duration,
            });
            return reply.status(200).send(products);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
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
exports.GetAllProduct = GetAllProduct;
const GetAllProductTheVenda = async (app) => {
    app.withTypeProvider().get('/product/getAllProductTheVenda', {}, async (req, reply) => {
        const startTime = Date.now();
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            const products = await prismaclient_1.prisma.products.findMany({
                where: {
                    estado: "NAO_VENDIDO"
                },
                orderBy: {
                    name_product: 'asc',
                },
            });
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Listar Produtos Disponíveis",
                user,
                user_id: userId,
                details: `Listagem de produtos disponíveis para venda. Total: ${products.length} produto(s)`,
                ip,
                resource: "products",
                duration,
            });
            return reply.status(200).send(products);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
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
exports.GetAllProductTheVenda = GetAllProductTheVenda;
const GetProfitByMonth = async (app) => {
    app.get('/product/getProfitByMonth', async (req, res) => {
        const now = new Date();
        const fiveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 4, 1);
        const result = await prismaclient_1.prisma.products.findMany({
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
