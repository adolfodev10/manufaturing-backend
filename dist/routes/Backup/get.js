"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBackups = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const GetBackups = async (app) => {
    app.withTypeProvider().get("/backups", {}, async (req, reply) => {
        const startTime = Date.now();
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            const backups = await prismaclient_1.prisma.backups.findMany({
                orderBy: {
                    created_at: 'desc'
                }
            });
            // Converter BigInt para Number
            const formattedBackups = backups.map((backup) => ({
                ...backup,
                size: Number(backup.size)
            }));
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Listar Backups",
                user,
                user_id: userId,
                details: `Listagem de backups realizada. Total: ${backups.length} backup(s)`,
                ip,
                resource: "backups",
                duration,
            });
            return reply.status(200).send(formattedBackups);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Listar Backups",
                user,
                user_id: userId,
                details: `Erro ao listar backups: ${error.message}`,
                ip,
                resource: "backups",
                duration,
            });
            console.error("Erro ao buscar backups:", error);
            return reply.status(500).send({ error: "Erro ao buscar backups" });
        }
    });
};
exports.GetBackups = GetBackups;
