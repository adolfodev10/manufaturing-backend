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
                    
                    await logger.warning({
                        action: "Eliminar Cliente",
                        user,
                        user_id: userId,
                        details: `Tentativa de eliminar cliente inexistente. ID: ${id}`,
                        ip,
                        resource: "clients",
                        resource_id: id,
                        duration,
                    });

                    return res.status(404).send({ message: 'Cliente não encontrado' });
                }

                // Guardar informações antes de deletar para o log
                const clientInfo = {
                    nome: client.name,
                    nif: client.nif,
                    telefone: client.telefone,
                    criado_em: client.created_at,
                };

                // Verificar se o cliente tem faturas associadas
                const faturasCount = await prisma.dividas.count({
                    where: { client_id: id }
                });

                await prisma.clients.delete({
                    where: {
                        id_client: id,
                    },
                });

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Eliminar Cliente",
                    user,
                    user_id: userId,
                    details: `Cliente eliminado com sucesso. ` +
                             `Nome: "${clientInfo.nome}" | ` +
                             `NIF: ${clientInfo.nif || 'Não informado'} | ` +
                             `Telefone: ${clientInfo.telefone || 'Não informado'} | ` +
                             `Criado em: ${new Date(clientInfo.criado_em).toISOString()} | ` +
                             `Faturas associadas: ${faturasCount}`,
                    ip,
                    resource: "clients",
                    resource_id: id,
                    duration,
                });

                return res.status(200).send({ 
                    message: "Cliente eliminado com sucesso",
                    faturas_afetadas: faturasCount
                });
                
            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Eliminar Cliente",
                    user,
                    user_id: userId,
                    details: `Erro ao eliminar cliente ID ${id}: ${error.message}`,
                    ip,
                    resource: "clients",
                    resource_id: id,
                    duration,
                });

                console.error("Erro ao eliminar cliente:", error);
                return res.status(500).send({ 
                    error: "Erro interno do servidor",
                    message: error.message 
                });
            }
        }
    );
};