"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDivida = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const UpdateDivida = async (app) => {
    app.withTypeProvider().put("/divida/update/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
            body: zod_1.default.object({
                client_id: zod_1.default.string(),
                price: zod_1.default.string(),
                date: zod_1.default.string(),
                approval: zod_1.default.enum(['PAGAS', 'NAO_PAGAS']),
            }),
        }
    }, async (req, reply) => {
        const startTime = Date.now();
        const { id } = req.params;
        const { client_id, price, date, approval } = req.body;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            // Verificar se a dívida existe
            const existingDivida = await prismaclient_1.prisma.dividas.findUnique({
                where: { id_divida: id },
                include: {
                    clients: {
                        select: { name: true, nif: true }
                    }
                }
            });
            if (!existingDivida) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Atualizar Dívida",
                    user,
                    user_id: userId,
                    details: `Tentativa de atualizar dívida inexistente. ID: ${id}`,
                    ip,
                    resource: "dividas",
                    resource_id: id,
                    duration,
                });
                return reply.status(404).send({
                    message: "Dívida não encontrada"
                });
            }
            // Verificar se o cliente existe (se foi alterado)
            if (client_id !== existingDivida.client_id) {
                const clientExists = await prismaclient_1.prisma.clients.findUnique({
                    where: { id_client: client_id },
                    select: { id_client: true, name: true }
                });
                if (!clientExists) {
                    const duration = Date.now() - startTime;
                    await logger_1.logger.warning({
                        action: "Atualizar Dívida",
                        user,
                        user_id: userId,
                        details: `Tentativa de atualizar dívida com cliente inexistente. Client ID: ${client_id}`,
                        ip,
                        resource: "dividas",
                        resource_id: id,
                        duration,
                    });
                    return reply.status(404).send({
                        message: "Cliente não encontrado"
                    });
                }
            }
            // Montar lista de alterações para o log
            const alteracoes = [];
            const clienteNome = existingDivida.clients?.name || "N/A";
            const clienteNif = existingDivida.clients?.nif || "N/A";
            if (existingDivida.client_id !== client_id) {
                alteracoes.push(`Cliente alterado: ${existingDivida.client_id} → ${client_id}`);
            }
            if (Number(existingDivida.price) !== Number(price)) {
                alteracoes.push(`Valor: ${Number(existingDivida.price).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })} → ${Number(price).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}`);
            }
            if (existingDivida.date?.toISOString() !== new Date(date).toISOString()) {
                alteracoes.push(`Data: ${existingDivida.date?.toISOString()} → ${new Date(date).toISOString()}`);
            }
            if (existingDivida.approval !== approval) {
                const estadoAntigo = existingDivida.approval === 'NAO_PAGAS' ? 'Pendente' : 'Paga';
                const estadoNovo = approval === 'NAO_PAGAS' ? 'Pendente' : 'Paga';
                alteracoes.push(`Estado: ${estadoAntigo} → ${estadoNovo}`);
            }
            const divida = await prismaclient_1.prisma.dividas.update({
                where: {
                    id_divida: id,
                },
                data: {
                    client_id,
                    price: price,
                    date: new Date(date),
                    approval,
                    updated_at: new Date(),
                }
            });
            const duration = Date.now() - startTime;
            // LOG ESPECIAL quando a dívida é paga
            if (existingDivida.approval === 'NAO_PAGAS' && approval === 'PAGAS') {
                await logger_1.logger.success({
                    action: "Pagamento de Dívida",
                    user,
                    user_id: userId,
                    details: `💸 Dívida PAGA! ` +
                        `ID: ${id} | ` +
                        `Cliente: ${clienteNome} (NIF: ${clienteNif}) | ` +
                        `Valor pago: ${Number(price).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })} | ` +
                        `Data: ${new Date(date).toISOString()}`,
                    ip,
                    resource: "dividas",
                    resource_id: id,
                    duration,
                });
            }
            else {
                await logger_1.logger.success({
                    action: "Atualizar Dívida",
                    user,
                    user_id: userId,
                    details: `Dívida atualizada com sucesso. ` +
                        `ID: ${id} | ` +
                        `Cliente: ${clienteNome} (NIF: ${clienteNif}) | ` +
                        (alteracoes.length > 0
                            ? `Alterações: ${alteracoes.join('; ')}`
                            : 'Nenhuma alteração detectada'),
                    ip,
                    resource: "dividas",
                    resource_id: id,
                    duration,
                });
            }
            return reply.status(200).send(divida);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Atualizar Dívida",
                user,
                user_id: userId,
                details: `Erro ao atualizar dívida ID ${id}: ${error.message}`,
                ip,
                resource: "dividas",
                resource_id: id,
                duration,
            });
            console.error("Erro ao atualizar dívida:", error);
            return reply.status(500).send({
                error: "Erro ao atualizar dívida",
                message: error.message
            });
        }
    });
};
exports.UpdateDivida = UpdateDivida;
