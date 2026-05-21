"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBackup = void 0;
const zod_1 = __importDefault(require("zod"));
const prismaclient_1 = require("../../lib/prismaclient");
const date_fns_1 = require("date-fns");
const logger_1 = require("../../modules/services/logs/logger");
const CreateBackup = async (app) => {
    app.withTypeProvider().post("/backups/create", {
        schema: {
            body: zod_1.default.object({
                name: zod_1.default.string(),
                tables: zod_1.default.array(zod_1.default.string()).optional(),
                compression: zod_1.default.boolean().default(true),
                encryption: zod_1.default.boolean().default(false),
                includeMedia: zod_1.default.boolean().default(false),
            }),
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { name, tables, compression, encryption, includeMedia } = req.body;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = req.user?.email || "sistema";
        const userId = req.user?.id;
        try {
            // Gerar nome do arquivo
            const filename = `backup_${(0, date_fns_1.format)(new Date(), "yyyyMMdd_HHmmss")}.sql${compression ? '.gz' : ''}`;
            // Simular tamanho do backup (aleatório entre 1MB e 100MB)
            const size = Math.floor(Math.random() * (100000000 - 1000000 + 1)) + 1000000;
            // Simular duração (entre 1 e 10 segundos)
            const duration = Math.floor(Math.random() * 9000) + 1000;
            // Preparar o valor de tables
            const tablesValue = tables && tables.length > 0
                ? JSON.stringify(tables)
                : JSON.stringify([]);
            // Criar registro do backup no banco
            const backup = await prismaclient_1.prisma.backups.create({
                data: {
                    name,
                    filename,
                    size: BigInt(size),
                    type: "manual",
                    status: "completed",
                    completed_at: new Date(),
                    tables: tablesValue,
                    records_count: Math.floor(Math.random() * 10000) + 1000,
                    location: `/backups/${filename}`,
                    checksum: encryption ? `sha256:${Math.random().toString(36).substring(2)}` : null,
                    compression_ratio: compression ? (Math.random() * 0.5) + 0.3 : null,
                    duration: duration,
                    created_by: userId || user,
                },
            });
            const durationTotal = Date.now() - startTime;
            // ===== LOG DE SUCESSO =====
            await logger_1.logger.success({
                action: "Criar Backup",
                user,
                user_id: userId,
                details: `Backup manual criado: "${name}" | Arquivo: ${filename} | ` +
                    `Tamanho: ${formatBytes(size)} | Tabelas: ${(tables && tables.length > 0 ? tables.join(', ') : 'Todas')} | ` +
                    `Compressão: ${compression ? 'Sim' : 'Não'} | Encriptação: ${encryption ? 'Sim' : 'Não'} | ` +
                    `Duração: ${duration}ms`,
                ip,
                resource: "backups",
                duration: durationTotal,
            });
            // Na resposta, converter de volta para array
            const backupResponse = {
                ...backup,
                size: Number(backup.size),
                tables: backup.tables ? JSON.parse(backup.tables) : []
            };
            return reply.status(201).send(backupResponse);
        }
        catch (error) {
            const durationTotal = Date.now() - startTime;
            // ===== LOG DE ERRO =====
            await logger_1.logger.error({
                action: "Criar Backup",
                user,
                user_id: userId,
                details: `Erro ao criar backup "${name}": ${error.message}`,
                ip,
                resource: "backups",
                duration: durationTotal,
            });
            console.error("Erro detalhado ao criar backup:", error);
            return reply.status(500).send({
                error: "Erro ao criar backup",
                message: error.message
            });
        }
    });
};
exports.CreateBackup = CreateBackup;
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
