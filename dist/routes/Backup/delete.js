"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteBackup = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const logger_1 = require("../../modules/services/logs/logger");
const DeleteBackup = async (app) => {
    app.withTypeProvider().delete("/backups/:id", {
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
                    action: "Eliminar Backup",
                    user,
                    user_id: userId,
                    details: `Tentativa de eliminar backup inexistente. ID: ${id}`,
                    ip,
                    resource: "backups",
                    duration,
                });
                return reply.status(404).send({ error: "Backup não encontrado" });
            }
            // Guardar informações antes de deletar para o log
            const backupInfo = {
                name: backup.name,
                filename: backup.filename,
                size: Number(backup.size),
                type: backup.type,
                created_at: backup.created_at,
            };
            await prismaclient_1.prisma.backups.delete({
                where: { id },
            });
            const duration = Date.now() - startTime;
            await logger_1.logger.success({
                action: "Eliminar Backup",
                user,
                user_id: userId,
                details: `Backup eliminado: "${backupInfo.name}" | ` +
                    `Arquivo: ${backupInfo.filename} | ` +
                    `Tamanho: ${formatBytes(backupInfo.size)} | ` +
                    `Tipo: ${backupInfo.type} | ` +
                    `Criado em: ${new Date(backupInfo.created_at).toISOString()}`,
                ip,
                resource: "backups",
                duration,
            });
            return reply.status(200).send({
                message: "Backup eliminado com sucesso"
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await logger_1.logger.error({
                action: "Eliminar Backup",
                user,
                user_id: userId,
                details: `Erro ao eliminar backup ID ${id}: ${error.message}`,
                ip,
                resource: "backups",
                duration,
            });
            console.error("Erro ao eliminar backup:", error);
            return reply.status(500).send({
                error: "Erro ao eliminar backup",
                message: error.message
            });
        }
    });
};
exports.DeleteBackup = DeleteBackup;
// Função auxiliar para formatar bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
