import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const DownloadBackup = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/backups/:id/download", {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
        },
    },
        async (req, reply) => {
            const startTime = Date.now();
            const { id } = req.params;
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                const backup = await prisma.backups.findUnique({
                    where: { id },
                });

                if (!backup) {
                    const duration = Date.now() - startTime;

                    await logger.warning({
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

                await logger.success({
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

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
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
        }
    );
};

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}