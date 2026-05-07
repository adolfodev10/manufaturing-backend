import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";

export const DeleteBackup = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete("/backups/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
        },
    },
        async (req, reply) => {
            const { id } = req.params;
            const user = (req as any).user?.email || 'sistema';

            try {
                const backup = await prisma.backups.findUnique({
                    where: { id },
                });

                if (!backup) {
                    return reply.status(404).send({ error: "Backup não encontrado" });
                }

                await prisma.backups.delete({
                    where: { id },
                });

                return reply.status(200).send({ 
                    message: "Backup deletado com sucesso" 
                });

            } catch (error) {
                console.error("Erro ao deletar backup:", error);
                return reply.status(500).send({ error: "Erro ao deletar backup" });
            }
        }
    );
};