"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadBackup = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const DownloadBackup = async (app) => {
    app.withTypeProvider().get("/backups/:id/download", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid(),
            }),
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { id } = req.params;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            const backup = await prismaclient_1.prisma.backups.findUnique({
                where: { id },
            });
            if (!backup) {
                const duration = Date.now() - startTime;
                await logger_1.logger.warning({
                    action: "Download Backup",
                    user,
                    user_id: userId,
                    details: `Tentativa de download de backup inexistente. ID: ${id}`,
                    ip,
                    resource: "backups",
                    duration,
                });
                return reply.status(404).send({ error: "Backup não encontrado" });
            }
            // Como não temos arquivo real, vamos gerar um conteúdo fictício
            const content = `Backup: ${backup.name}\nCriado em: ${backup.created_at}\nTabelas: ${backup.tables?.toString().split(',').join(', ')}`;
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Download Backup",
                user,
                user_id: userId,
                details: `Download do backup: "${backup.name}" | Arquivo: ${backup.filename} | Tamanho: ${formatBytes(Number(backup.size))}`,
                ip,
                resource: "backups",
                duration,
            });
            return reply
                .header('Content-Disposition', `attachment; filename="${backup.filename}"`)
                .header('Content-Type', 'application/octet-stream')
                .send(content);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Download Backup",
                user,
                user_id: userId,
                details: `Erro ao fazer download do backup ID ${id}: ${error.message}`,
                ip,
                resource: "backups",
                duration,
            });
            console.error("Erro ao fazer download:", error);
            return reply.status(500).send({ error: "Erro ao fazer download" });
        }
    });
};
exports.DownloadBackup = DownloadBackup;
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
