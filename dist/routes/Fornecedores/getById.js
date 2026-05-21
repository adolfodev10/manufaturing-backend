"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFornecedorById = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const GetFornecedorById = async (app) => {
    app.withTypeProvider().get("/fornecedor/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid("ID inválido"),
            }),
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { id } = req.params;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            const fornecedor = await prismaclient_1.prisma.fornecedores.findUnique({
                where: { id },
                include: {
                    compras: {
                        take: 10,
                        orderBy: { data_pedido: "desc" },
                    },
                },
            });
            if (!fornecedor) {
                return reply.status(404).send({
                    success: false,
                    message: "Fornecedor não encontrado"
                });
            }
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Buscar Fornecedor",
                user,
                user_id: userId,
                details: `Fornecedor ${fornecedor.nome} encontrado`,
                ip,
                resource: "fornecedores",
                resource_id: id,
                duration,
            });
            return reply.status(200).send({
                success: true,
                data: fornecedor,
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Buscar Fornecedor",
                user,
                user_id: userId,
                details: `Erro ao buscar fornecedor: ${error.message}`,
                ip,
                resource: "fornecedores",
                resource_id: id,
                duration,
            });
            return reply.status(500).send({
                success: false,
                message: "Erro ao buscar fornecedor"
            });
        }
    });
};
exports.GetFornecedorById = GetFornecedorById;
