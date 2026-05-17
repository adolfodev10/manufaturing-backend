import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const GetBackups = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/backups", {},
        async (req, reply) => {
            const startTime = Date.now();
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                const backups = await prisma.backups.findMany({
                    orderBy: {
                        created_at: 'desc'
                    }
                });

                // Converter BigInt para Number
                const formattedBackups = backups.map(backup => ({
                    ...backup,
                    size: Number(backup.size)
                }));

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Listar Backups",
                    user,
                    user_id: userId,
                    details: `Listagem de backups realizada. Total: ${backups.length} backup(s)`,
                    ip,
                    resource: "backups",
                    duration,
                });

                return reply.status(200).send(formattedBackups);

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
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
        }
    );
};