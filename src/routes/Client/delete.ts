import { FastifyInstance } from "fastify";
import z from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const DeleteClient = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete('/client/delete/:id', {
        schema: {
            params: z.object({
                id: z.string().nonempty("O campo id é obrigatório."),
            }),
        },
    },
        async (req, res) => {
            const startTime = Date.now();
            const { id } = req.params;
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            const user = (req as any).user?.email || 'sistema';
            const userId = (req as any).user?.id;

            try {
                const client = await prisma.clients.findUnique({
                    where: { id_client: id },
                });

                if (!client) {
                    const duration = Date.now() - startTime;
                    
                    // LOG DE AVISO
                    await logger.warning({
                        action: "Deletar Cliente",
                        user,
                        user_id: userId,
                        details: `Tentativa de deletar cliente não encontrado. ID: ${id}`,
                        ip,
                        resource: "clients",
                        resource_id: id,
                        duration,
                    });

                    return res.status(404).send({ message: 'Cliente não encontrado' });
                }

                await prisma.clients.delete({
                    where: {
                        id_client: id,
                    },
                });

                const duration = Date.now() - startTime;

                // LOG DE SUCESSO
                await logger.success({
                    action: "Deletar Cliente",
                    user,
                    user_id: userId,
                    details: `Cliente ${client.name} deletado com sucesso. ID: ${id}`,
                    ip,
                    resource: "clients",
                    resource_id: id,
                    duration,
                });

                return res.status(200).send({ message: "Cliente Eliminado com sucesso" });
                
            } catch (error: any) {
                const duration = Date.now() - startTime;

                // LOG DE ERRO
                await logger.error({
                    action: "Deletar Cliente",
                    user,
                    user_id: userId,
                    details: `Erro ao deletar cliente ID ${id}: ${error.message}`,
                    ip,
                    resource: "clients",
                    resource_id: id,
                    duration,
                });

                console.error("Erro ao deletar cliente:", error);
                return res.status(500).send({ error: "Erro interno do servidor" });
            }
        }
    );
};