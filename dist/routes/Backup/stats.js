"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBackupStats = void 0;
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const GetBackupStats = async (app) => {
    app.withTypeProvider().get("/backups/stats", {}, async (req, reply) => {
        const startTime = Date.now();
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            const [total_backups, completed, failed] = await Promise.all([
                prismaclient_1.prisma.backups.count(),
                prismaclient_1.prisma.backups.count({ where: { status: "completed" } }),
                prismaclient_1.prisma.backups.count({ where: { status: "failed" } }),
            ]);
            const backups = await prismaclient_1.prisma.backups.findMany({
                select: {
                    size: true,
                    duration: true,
                },
            });
            const total_size = backups.reduce((acc, b) => acc + Number(b.size), 0);
            const avg_duration = backups.length > 0
                ? backups.reduce((acc, b) => acc + (b.duration || 0), 0) / backups.length
                : 0;
            const last_backup = await prismaclient_1.prisma.backups.findFirst({
                where: { status: "completed" },
                orderBy: { created_at: 'desc' },
            });
            const success_rate = total_backups > 0
                ? Math.round((completed / total_backups) * 100)
                : 0;
            const stats = {
                total_backups,
                total_size,
                last_backup: last_backup?.created_at || null,
                average_duration: Math.round(avg_duration),
                success_rate,
                storage_used: total_size,
                storage_available: 1073741824 * 10, // 10 GB fictício
                tables_count: 8, // fictício
            };
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Listar Estatísticas Backup",
                user,
                user_id: userId,
                details: `Estatísticas de backup consultadas. ` +
                    `Total: ${total_backups} | Completos: ${completed} | Falhas: ${failed} | ` +
                    `Taxa de sucesso: ${success_rate}% | Tamanho total: ${formatBytes(total_size)}`,
                ip,
                resource: "backups",
                duration,
            });
            return reply.status(200).send(stats);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Listar Estatísticas Backup",
                user,
                user_id: userId,
                details: `Erro ao buscar estatísticas de backup: ${error.message}`,
                ip,
                resource: "backups",
                duration,
            });
            console.error("Erro ao buscar estatísticas:", error);
            return reply.status(500).send({ error: "Erro ao buscar estatísticas" });
        }
    });
};
exports.GetBackupStats = GetBackupStats;
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
