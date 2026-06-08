import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { logger } from "../../modules/services/logs/logger";

export const UpdateNotification = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().put("/notification/update/:id", {
        schema: {
            params: z.object({
                id: z.string(),
            }),
            body: z.object({
                client_id: z.string(),
                price: z.string(),
                date: z.string(),
                approval: z.enum(['PAGAS', 'NAO_PAGAS']),
            }),
        }
    },
        async (req, reply) => {
            const startTime = Date.now();
            const { id } = req.params;
            const { client_id, price, date, approval } = req.body;
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                // Verificar se a dívida existe
                const existingDivida = await prisma.dividas.findUnique({
                    where: { id_divida: id },
                    include: {
                        clients: {
                            select: { name: true, nif: true }
                        }
                    }
                });

                if (!existingDivida) {
                    const duration = Date.now() - startTime;

                    await logger.warning({
                        action: "Atualizar Dívida",
                        user,
                        user_id: userId,
                        details: `Tentativa de atualizar dívida inexistente. ID: ${id}`,
                        ip,
                        resource: "dividas",
                        resource_id: id,
                        duration,
                    });

                    return reply.status(404).send({ 
                        message: "Dívida não encontrada" 
                    });
                }

                // Verificar se o cliente existe (se foi alterado)
                if (client_id !== existingDivida.client_id) {
                    const clientExists = await prisma.clients.findUnique({
                        where: { id_client: client_id },
                        select: { id_client: true, name: true }
                    });

                    if (!clientExists) {
                        const duration = Date.now() - startTime;

                        await logger.warning({
                            action: "Atualizar Dívida",
                            user,
                            user_id: userId,
                            details: `Tentativa de atualizar dívida com cliente inexistente. Client ID: ${client_id}`,
                            ip,
                            resource: "dividas",
                            resource_id: id,
                            duration,
                        });

                        return reply.status(404).send({ 
                            message: "Cliente não encontrado" 
                        });
                    }
                }

                // Montar lista de alterações para o log
                const alteracoes: string[] = [];
                const clienteNome = (existingDivida as any).clients?.name || "N/A";
                const clienteNif = (existingDivida as any).clients?.nif || "N/A";

                if (existingDivida.client_id !== client_id) {
                    alteracoes.push(`Cliente alterado: ${existingDivida.client_id} → ${client_id}`);
                }

                if (Number(existingDivida.price) !== Number(price)) {
                    alteracoes.push(`Valor: ${Number(existingDivida.price).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })} → ${Number(price).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}`);
                }

                if (existingDivida.date?.toISOString() !== new Date(date).toISOString()) {
                    alteracoes.push(`Data: ${existingDivida.date?.toISOString()} → ${new Date(date).toISOString()}`);
                }

                if (existingDivida.approval !== approval) {
                    const estadoAntigo = existingDivida.approval === 'NAO_PAGAS' ? 'Pendente' : 'Paga';
                    const estadoNovo = approval === 'NAO_PAGAS' ? 'Pendente' : 'Paga';
                    alteracoes.push(`Estado: ${estadoAntigo} → ${estadoNovo}`);
                }

                const divida = await prisma.dividas.update({
                    where: {
                        id_divida: id,
                    },
                    data: {
                        client_id,
                        price: price,
                        date: new Date(date),
                        approval,
                        updated_at: new Date(),
                    }
                });

                const duration = Date.now() - startTime;

                // LOG ESPECIAL quando a dívida é paga
                if (existingDivida.approval === 'NAO_PAGAS' && approval === 'PAGAS') {
                    await logger.success({
                        action: "Pagamento de Dívida",
                        user,
                        user_id: userId,
                        details: `💸 Dívida PAGA! ` +
                                 `ID: ${id} | ` +
                                 `Cliente: ${clienteNome} (NIF: ${clienteNif}) | ` +
                                 `Valor pago: ${Number(price).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })} | ` +
                                 `Data: ${new Date(date).toISOString()}`,
                        ip,
                        resource: "dividas",
                        resource_id: id,
                        duration,
                    });
                } else {
                    await logger.success({
                        action: "Atualizar Dívida",
                        user,
                        user_id: userId,
                        details: `Dívida atualizada com sucesso. ` +
                                 `ID: ${id} | ` +
                                 `Cliente: ${clienteNome} (NIF: ${clienteNif}) | ` +
                                 (alteracoes.length > 0 
                                    ? `Alterações: ${alteracoes.join('; ')}` 
                                    : 'Nenhuma alteração detectada'),
                        ip,
                        resource: "dividas",
                        resource_id: id,
                        duration,
                    });
                }

                return reply.status(200).send(divida);

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Atualizar Dívida",
                    user,
                    user_id: userId,
                    details: `Erro ao atualizar dívida ID ${id}: ${error.message}`,
                    ip,
                    resource: "dividas",
                    resource_id: id,
                    duration,
                });

                console.error("Erro ao atualizar dívida:", error);
                
                return reply.status(500).send({ 
                    error: "Erro ao atualizar dívida",
                    message: error.message 
                });
            }
        }
    );
};