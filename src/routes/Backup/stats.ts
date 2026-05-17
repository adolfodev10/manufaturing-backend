import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const GetBackupStats = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/backups/stats", {},
        async (req, reply) => {
            const startTime = Date.now();
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                const [total_backups, completed, failed] = await Promise.all([
                    prisma.backups.count(),
                    prisma.backups.count({ where: { status: "completed" } }),
                    prisma.backups.count({ where: { status: "failed" } }),
                ]);

                const backups = await prisma.backups.findMany({
                    select: {
                        size: true,
                        duration: true,
                    },
                });

                const total_size = backups.reduce((acc, b) => acc + Number(b.size), 0);
                const avg_duration = backups.length > 0 
                    ? backups.reduce((acc, b) => acc + (b.duration || 0), 0) / backups.length 
                    : 0;

                const last_backup = await prisma.backups.findFirst({
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

                await logger.success({
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

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
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