import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const DeleteBackup = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete("/backups/:id", {
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

                await prisma.backups.delete({
                    where: { id },
                });

                const duration = Date.now() - startTime;

                await logger.success({
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

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
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
        }
    );
};

// Função auxiliar para formatar bytes
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}