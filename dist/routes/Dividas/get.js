"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllDivida = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const GetAllDivida = async (app) => {
    app.withTypeProvider().get('/divida/getAll', {}, async (req, res) => {
        const startTime = Date.now();
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            const dividas = await prismaclient_1.prisma.dividas.findMany({
                include: {
                    clients: {
                        select: {
                            name: true,
                            nif: true,
                            telefone: true,
                        }
                    },
                    products: {
                        select: {
                            name_product: true,
                            price: true,
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc',
                },
            });
            // Estatísticas rápidas
            const totalDividas = dividas.length;
            const totalPendentes = dividas.filter(d => d.approval === 'NAO_PAGAS').length;
            const totalPagas = dividas.filter(d => d.approval === 'PAGAS').length;
            const valorTotalPendente = dividas
                .filter(d => d.approval === 'NAO_PAGAS')
                .reduce((sum, d) => sum + Number(d.price), 0);
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Listar Dívidas",
                user,
                user_id: userId,
                details: `Listagem de dívidas realizada. ` +
                    `Total: ${totalDividas} | ` +
                    `Pendentes: ${totalPendentes} | ` +
                    `Pagas: ${totalPagas} | ` +
                    `Valor pendente: ${valorTotalPendente.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}`,
                ip,
                resource: "dividas",
                duration,
            });
            return res.status(200).send({
                dividas,
                resumo: {
                    total: totalDividas,
                    pendentes: totalPendentes,
                    pagas: totalPagas,
                    valor_pendente: valorTotalPendente,
                }
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Listar Dívidas",
                user,
                user_id: userId,
                details: `Erro ao listar dívidas: ${error.message}`,
                ip,
                resource: "dividas",
                duration,
            });
            console.error("Erro ao listar dívidas:", error);
            return res.status(500).send({
                error: "Erro ao listar dívidas",
                message: error.message
            });
        }
    });
};
exports.GetAllDivida = GetAllDivida;
