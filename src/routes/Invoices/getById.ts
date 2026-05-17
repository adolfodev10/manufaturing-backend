import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const GetInvoicesByClientId = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get("/invoice/client/:client_id", {
        schema: {
            params: z.object({
                client_id: z.string(),
            })
        }
    },
        async (req, reply) => {
            const startTime = Date.now();
            const { client_id } = req.params;
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                // Verificar se o cliente existe primeiro
                const client = await prisma.clients.findUnique({
                    where: { id_client: client_id },
                    select: { id_client: true, name: true, nif: true }
                });

                if (!client) {
                    const duration = Date.now() - startTime;

                    await logger.warning({
                        action: "Listar Dívidas por Cliente",
                        user,
                        user_id: userId,
                        details: `Tentativa de listar dívidas de cliente inexistente. Client ID: ${client_id}`,
                        ip,
                        resource: "invoices",
                        duration,
                    });

                    return reply.status(404).send({ 
                        message: "Cliente não encontrado" 
                    });
                }

                const invoices = await prisma.invoices.findMany({
                    where: {
                        client_id: client_id, // 👈 CORRIGIDO: usar client_id direto
                    },
                    include: {
                        products: {
                            select: {
                                name_product: true,
                                price: true,
                            }
                        }
                    },
                    orderBy: {
                        date: 'desc',
                    },
                });

                // Estatísticas do cliente
                const totalDividas = invoices.length;
                const totalPendentes = invoices.filter(i => i.approval === 'NAO_PAGAS').length;
                const totalPagas = invoices.filter(i => i.approval === 'PAGAS').length;
                const valorPendente = invoices
                    .filter(i => i.approval === 'NAO_PAGAS')
                    .reduce((sum, i) => sum + Number(i.price), 0);
                const valorTotal = invoices.reduce((sum, i) => sum + Number(i.price), 0);

                const duration = Date.now() - startTime;

                if (invoices.length === 0) {
                    await logger.success({
                        action: "Listar Dívidas por Cliente",
                        user,
                        user_id: userId,
                        details: `Cliente "${client.name}" (NIF: ${client.nif || 'N/A'}) não possui dívidas. Client ID: ${client_id}`,
                        ip,
                        resource: "invoices",
                        duration,
                    });

                    return reply.status(200).send({ 
                        message: "Cliente sem dívidas",
                        cliente: {
                            id: client.id_client,
                            nome: client.name,
                            nif: client.nif,
                        },
                        invoices: [],
                        resumo: {
                            total: 0,
                            pendentes: 0,
                            pagas: 0,
                            valor_pendente: 0,
                            valor_total: 0,
                        }
                    });
                }

                await logger.success({
                    action: "Listar Dívidas por Cliente",
                    user,
                    user_id: userId,
                    details: `Dívidas do cliente "${client.name}" (NIF: ${client.nif || 'N/A'}) listadas. ` +
                             `Total: ${totalDividas} | Pendentes: ${totalPendentes} | Pagas: ${totalPagas} | ` +
                             `Valor pendente: ${valorPendente.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}`,
                    ip,
                    resource: "invoices",
                    duration,
                });

                return reply.status(200).send({
                    cliente: {
                        id: client.id_client,
                        nome: client.name,
                        nif: client.nif,
                    },
                    invoices,
                    resumo: {
                        total: totalDividas,
                        pendentes: totalPendentes,
                        pagas: totalPagas,
                        valor_pendente: valorPendente,
                        valor_total: valorTotal,
                    }
                });

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Listar Dívidas por Cliente",
                    user,
                    user_id: userId,
                    details: `Erro ao listar dívidas do cliente ID ${client_id}: ${error.message}`,
                    ip,
                    resource: "invoices",
                    duration,
                });

                console.error("Erro ao listar dívidas por cliente:", error);
                
                return reply.status(500).send({ 
                    error: "Erro ao listar dívidas",
                    message: error.message 
                });
            }
        }
    );
};