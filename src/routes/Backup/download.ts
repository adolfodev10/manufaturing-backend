import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const DownloadBackup = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/backups/:id/download", {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
        },
    },
        async (req, reply) => {
            const { id } = req.params;

            try {
                const backup = await prisma.backups.findUnique({
                    where: { id },
                });

                if (!backup) {
                    return reply.status(404).send({ error: "Backup não encontrado" });
                }

                // Como não temos arquivo real, vamos gerar um conteúdo fictício
                const content = `Backup fictício: ${backup.name}\nCriado em: ${backup.created_at}\nTabelas: ${backup.tables?.toString().split(',').join(', ')}`;
                
                return reply
                    .header('Content-Disposition', `attachment; filename="${backup.filename}"`)
                    .header('Content-Type', 'application/octet-stream')
                    .send(content);

            } catch (error) {
                console.error("Erro ao fazer download:", error);
                return reply.status(500).send({ error: "Erro ao fazer download" });
            }
        }
    );
};