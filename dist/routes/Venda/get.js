"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfitByMonth = exports.GetAllVenda = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const zod_1 = require("zod");
const logger_1 = require("../../modules/services/logs/logger");
const GetAllVenda = async (app) => {
    app.withTypeProvider().get("/venda/getAll", {
        schema: {
            querystring: zod_1.z.object({
                page: zod_1.z.coerce.number().int().min(1).optional().default(1),
                limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(10),
            })
        }
    }, async (request, reply) => {
        const startTime = Date.now();
        const { page, limit, search, status, tipo } = request.query;
        const ip = request.ip || request.socket.remoteAddress || "unknown";
        const user = request.user?.email || "sistema";
        const userId = request.user?.id;
        try {
            const skip = (page - 1) * limit;
            const where = {};
            if (status) {
                where.status = status;
            }
            if (tipo) {
                where.tipo = tipo;
            }
            const [vendas, total] = await Promise.all([
                prismaclient_1.prisma.venda.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { name_product: "asc" },
                    include: {
                        user: true
                    }
                }),
                prismaclient_1.prisma.venda.count({ where })
            ]);
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Listar Vendas",
                user,
                user_id: userId,
                details: `Listagem de vendas realizada. Total: ${total}`,
                ip,
                resource: "vendas",
                duration,
            });
            return reply.status(200).send(vendas);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Listar Vendas",
                user,
                user_id: userId,
                details: `Erro ao listar vendas: ${error.message}`,
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
