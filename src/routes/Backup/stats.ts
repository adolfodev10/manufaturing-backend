import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";

export const GetBackupStats = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/backups/stats", {},
        async (req, reply) => {
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
                const avg_duration = backups.reduce((acc, b) => acc + (b.duration || 0), 0) / (backups.length || 1);

                const last_backup = await prisma.backups.findFirst({
                    where: { status: "completed" },
                    orderBy: { created_at: 'desc' },
                });

                const stats = {
                    total_backups,
                    total_size,
                    last_backup: last_backup?.created_at || null,
                    average_duration: Math.round(avg_duration),
                    success_rate: total_backups > 0 ? Math.round((completed / total_backups) * 100) : 0,
                    storage_used: total_size,
                    storage_available: 1073741824 * 10, // 10 GB fictício
                    tables_count: 8, // fictício
                };

                return reply.status(200).send(stats);

            } catch (error) {
                console.error("Erro ao buscar estatísticas:", error);
                return reply.status(500).send({ error: "Erro ao buscar estatísticas" });
            }
        }
    );
};