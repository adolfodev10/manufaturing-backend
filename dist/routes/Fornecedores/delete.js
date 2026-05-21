"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFornecedor = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const DeleteFornecedor = async (app) => {
    app.withTypeProvider().delete("/fornecedor/delete/:id", {
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
            // Verificar se fornecedor existe
            const fornecedor = await prismaclient_1.prisma.fornecedores.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            compras: true,
                        }
                    }
                }
            });
            if (!fornecedor) {
                return reply.status(404).send({
                    success: false,
                    message: "Fornecedor não encontrado"
                });
            }
            // Verificar se o fornecedor tem compras ou produtos associados
            if (fornecedor._count.compras > 0) {
                return reply.status(400).send({
                    success: false,
                    message: "Não é possível excluir o fornecedor pois ele possui compras ou produtos associados. Considere inativá-lo em vez de excluir.",
                    hasCompras: fornecedor._count.compras > 0,
                });
            }
            await prismaclient_1.prisma.fornecedores.delete({
                where: { id },
            });
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Deletar Fornecedor",
                user,
                user_id: userId,
                details: `Fornecedor ${fornecedor.nome} deletado com sucesso`,
                ip,
                resource: "fornecedores",
                resource_id: id,
                duration,
            });
            return reply.status(200).send({
                success: true,
                message: "Fornecedor deletado com sucesso",
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Deletar Fornecedor",
                user,
                user_id: userId,
                details: `Erro ao deletar fornecedor: ${error.message}`,
                ip,
                resource: "fornecedores",
                resource_id: id,
                duration,
            });
            return reply.status(500).send({
                success: false,
                message: "Erro ao deletar fornecedor"
            });
        }
    });
};
exports.DeleteFornecedor = DeleteFornecedor;
