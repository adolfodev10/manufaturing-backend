"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteDivida = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const DeleteDivida = async (app) => {
    app.withTypeProvider().delete('/divida/delete/:id', {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().nonempty("O campo id é obrigatório."),
            }),
        },
    }, async (req, res) => {
        const startTime = Date.now();
        const { id } = req.params;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            const divida = await prismaclient_1.prisma.dividas.findUnique({
                where: { id_divida: id },
                include: {
                    clients: {
                        select: {
                            name: true,
                            nif: true,
                        }
                    }
                }
            });
            if (!divida) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Eliminar Dívida",
                    user,
                    user_id: userId,
                    details: `Tentativa de eliminar dívida inexistente. ID: ${id}`,
                    ip,
                    resource: "dividas",
                    resource_id: id,
                    duration,
                });
                return res.status(404).send({ message: 'Dívida não encontrada' });
            }
            // Guardar informações antes de eliminar para o log
            const dividaInfo = {
                id: divida.id_divida,
                cliente: divida.client?.name || "N/A",
                nif: divida.client?.nif || "N/A",
                valor: divida.price,
                estado: divida.approval,
                produto: divida.product_id || "N/A",
                data: divida.date,
                criado_em: divida.created_at,
            };
            await prismaclient_1.prisma.dividas.delete({
                where: {
                    id_divida: id,
                },
            });
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Eliminar Dívida",
                user,
                user_id: userId,
                details: `Dívida eliminada com sucesso. ` +
                    `ID: ${dividaInfo.id} | ` +
                    `Cliente: ${dividaInfo.cliente} (NIF: ${dividaInfo.nif}) | ` +
                    `Valor: ${Number(dividaInfo.valor).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })} | ` +
                    `Estado: ${dividaInfo.estado === 'NAO_PAGAS' ? 'Pendente' : 'Paga'} | ` +
                    `Produto: ${dividaInfo.produto} | ` +
                    `Data: ${new Date(dividaInfo.data).toISOString()}`,
                ip,
                resource: "dividas",
                resource_id: id,
                duration,
            });
            return res.status(200).send({ message: "Dívida eliminada com sucesso" });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Eliminar Dívida",
                user,
                user_id: userId,
                details: `Erro ao eliminar dívida ID ${id}: ${error.message}`,
                ip,
                resource: "dividas",
                resource_id: id,
                duration,
            });
            console.error("Erro ao eliminar dívida:", error);
            return res.status(500).send({
                error: "Erro ao eliminar dívida",
                message: error.message
            });
        }
    });
};
exports.DeleteDivida = DeleteDivida;
