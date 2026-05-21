"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetClient = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const GetClient = async (app) => {
    app.withTypeProvider().get("/client/getAll", {}, async (req, res) => {
        const startTime = Date.now();
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            const clients = await prismaclient_1.prisma.clients.findMany({
                select: {
                    id_client: true,
                    name: true,
                    telefone: true,
                    nif: true,
                    created_at: true,
                    updated_at: true,
                },
                orderBy: {
                    name: 'asc',
                },
            });
            // Contar total de faturas por cliente
            const clientsWithStats = await Promise.all(clients.map(async (client) => {
                const totalFaturas = await prismaclient_1.prisma.dividas.count({
                    where: { client_id: client.id_client }
                });
                return {
                    id_client: client.id_client,
                    name: client.name,
                    telefone: client.telefone,
                    nif: client.nif,
                    criado_em: client.created_at,
                    atualizado_em: client.updated_at,
                    total_faturas: totalFaturas,
                };
            }));
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Listar Clientes",
                user,
                user_id: userId,
                details: `Listagem de clientes realizada. Total: ${clients.length} cliente(s)`,
                ip,
                resource: "clients",
                duration,
            });
            return res.status(200).send(clientsWithStats);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Listar Clientes",
                user,
                user_id: userId,
                details: `Erro ao listar clientes: ${error.message}`,
                ip,
                resource: "clients",
                duration,
            });
            console.error("Erro ao listar clientes:", error);
            return res.status(500).send({
                error: "Erro ao listar clientes",
                message: error.message
            });
        }
    });
};
exports.GetClient = GetClient;
