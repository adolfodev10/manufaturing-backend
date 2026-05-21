"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFaturaByNumero = exports.GetFaturaById = exports.GetAllFaturas = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const zod_1 = require("zod");
const logger_1 = require("../../modules/services/logs/logger");
const GetAllFaturas = async (app) => {
    app.withTypeProvider().get("/fatura/getAll", {
        schema: {
            querystring: zod_1.z.object({
                page: zod_1.z.coerce.number().int().min(1).optional().default(1),
                limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(20),
                status: zod_1.z.string().optional(),
                operador: zod_1.z.string().optional(),
                search: zod_1.z.string().optional(),
            }),
        },
    }, async (request, reply) => {
        const startTime = Date.now();
        const { page, limit, status, operador, search } = request.query;
        const ip = request.ip || request.socket.remoteAddress || "unknown";
        const user = request.user?.email || "sistema";
        const userId = request.user?.id;
        try {
            const skip = (page - 1) * limit;
            const where = {};
            if (status) {
                where.status = status;
            }
            if (operador) {
                where.operador = operador;
            }
            if (search) {
                where.OR = [
                    { numero: { contains: search } },
                    { clienteNome: { contains: search } },
                    { clienteNIF: { contains: search } },
                ];
            }
            const [faturas, total] = await Promise.all([
                prismaclient_1.prisma.faturas.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { dataEmissao: "desc" },
                    include: {
                        itens: true,
                    },
                }),
                prismaclient_1.prisma.faturas.count({ where }),
            ]);
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Listar Faturas",
                user,
                user_id: userId,
                details: `Listagem de faturas realizada. Total: ${total}`,
                ip,
                resource: "faturas",
                duration,
            });
            return reply.status(200).send({
                success: true,
                data: faturas,
                total,
                page,
                limit,
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Listar Faturas",
                user,
                user_id: userId,
                details: `Erro ao listar faturas: ${error.message}`,
                ip,
                resource: "faturas",
                duration,
            });
            return reply.status(500).send({
                success: false,
                message: "Erro ao listar faturas",
            });
        }
    });
};
exports.GetAllFaturas = GetAllFaturas;
const GetFaturaById = async (app) => {
    app.withTypeProvider().get("/fatura/:id", {
        schema: {
            params: zod_1.z.object({
                id: zod_1.z.string(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const user = request.user?.email || "sistema";
        try {
            const fatura = await prismaclient_1.prisma.faturas.findUnique({
                where: { id_fatura: id },
                include: {
                    itens: true,
                },
            });
            if (!fatura) {
                return reply.status(404).send({
                    success: false,
                    message: "Fatura não encontrada",
                });
            }
            return reply.status(200).send({
                success: true,
                data: fatura,
            });
        }
        catch (error) {
            return reply.status(500).send({
                success: false,
                message: "Erro ao buscar fatura",
            });
        }
    });
};
exports.GetFaturaById = GetFaturaById;
const GetFaturaByNumero = async (app) => {
    app.withTypeProvider().get("/fatura/numero/:numero", {
        schema: {
            params: zod_1.z.object({
                numero: zod_1.z.string(),
            }),
        },
    }, async (request, reply) => {
        const { numero } = request.params;
        try {
            const fatura = await prismaclient_1.prisma.faturas.findUnique({
                where: { numero },
                include: {
                    itens: true,
                },
            });
            if (!fatura) {
                return reply.status(404).send({
                    success: false,
                    message: "Fatura não encontrada",
                });
            }
            return reply.status(200).send({
                success: true,
                data: fatura,
            });
        }
        catch (error) {
            return reply.status(500).send({
                success: false,
                message: "Erro ao buscar fatura",
            });
        }
    });
};
exports.GetFaturaByNumero = GetFaturaByNumero;
