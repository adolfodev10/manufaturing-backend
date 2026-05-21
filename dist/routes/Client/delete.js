"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteClient = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const DeleteClient = async (app) => {
    app.withTypeProvider().delete('/client/delete/:id', {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().nonempty("O campo id é obrigatório."),
            }),
        },
    }, async (req, res) => {
        const startTime = Date.now();
        const { id } = req.params;
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const user = req.user?.email || 'sistema';
        const userId = req.user?.id;
        try {
            const client = await prismaclient_1.prisma.clients.findUnique({
                where: { id_client: id },
            });
            if (!client) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Eliminar Cliente",
                    user,
                    user_id: userId,
                    details: `Tentativa de eliminar cliente inexistente. ID: ${id}`,
                    ip,
                    resource: "clients",
                    resource_id: id,
                    duration,
                });
                return res.status(404).send({ message: 'Cliente não encontrado' });
            }
            // Guardar informações antes de deletar para o log
            const clientInfo = {
                nome: client.name,
                nif: client.nif,
                telefone: client.telefone,
                criado_em: client.created_at,
            };
            // Verificar se o cliente tem faturas associadas
            const faturasCount = await prismaclient_1.prisma.dividas.count({
                where: { client_id: id }
            });
            await prismaclient_1.prisma.clients.delete({
                where: {
                    id_client: id,
                },
            });
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Eliminar Cliente",
                user,
                user_id: userId,
                details: `Cliente eliminado com sucesso. ` +
                    `Nome: "${clientInfo.nome}" | ` +
                    `NIF: ${clientInfo.nif || 'Não informado'} | ` +
                    `Telefone: ${clientInfo.telefone || 'Não informado'} | ` +
                    `Criado em: ${new Date(clientInfo.criado_em).toISOString()} | ` +
                    `Faturas associadas: ${faturasCount}`,
                ip,
                resource: "clients",
                resource_id: id,
                duration,
            });
            return res.status(200).send({
                message: "Cliente eliminado com sucesso",
                faturas_afetadas: faturasCount
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Eliminar Cliente",
                user,
                user_id: userId,
                details: `Erro ao eliminar cliente ID ${id}: ${error.message}`,
                ip,
                resource: "clients",
                resource_id: id,
                duration,
            });
            console.error("Erro ao eliminar cliente:", error);
            return res.status(500).send({
                error: "Erro interno do servidor",
                message: error.message
            });
        }
    });
};
exports.DeleteClient = DeleteClient;
