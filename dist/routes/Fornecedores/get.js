"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllFornecedores = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const zod_1 = __importDefault(require("zod"));
const GetAllFornecedores = async (app) => {
    app.withTypeProvider().get("/fornecedores", {
        schema: {
            querystring: zod_1.default.object({
                page: zod_1.default.coerce.number().int().min(1).optional().default(1),
                limit: zod_1.default.coerce.number().int().min(1).max(100).optional().default(10),
                search: zod_1.default.string().optional(),
            }),
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { page, limit, search, status, tipo } = req.query;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            const skip = (page - 1) * limit;
            // Construir filtros
            const where = {};
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
                prismaclient_1.prisma.fornecedores.findMany({
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
                prismaclient_1.prisma.fornecedores.count({ where })
            ]);
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Listar Fornecedores",
                user,
                user_id: userId,
                details: `Erro ao listar fornecedores: ${error.message}`,
                ip,
                resource: "fornecedores",
                duration,
            });
            return reply.status(500).send({
                success: false,
                message: "Erro ao listar fornecedores"
            });
        }
    });
};
exports.GetAllFornecedores = GetAllFornecedores;
