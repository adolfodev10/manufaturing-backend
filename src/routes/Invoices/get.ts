import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const GetAllInvoice = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().get('/invoice/getAll', {},
        async (req, res) => {
            const startTime = Date.now();
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                const invoices = await prisma.invoices.findMany({
                    include: {
                        clients: {
                            select: {
                                name: true,
                                nif: true,
                                telefone: true,
                            }
                        },
                        products: {
                            select: {
                                name_product: true,
                                price: true,
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'desc',
                    },
                });

                // Estatísticas rápidas
                const totalDividas = invoices.length;
                const totalPendentes = invoices.filter(i => i.approval === 'NAO_PAGAS').length;
                const totalPagas = invoices.filter(i => i.approval === 'PAGAS').length;
                const valorTotalPendente = invoices
                    .filter(i => i.approval === 'NAO_PAGAS')
                    .reduce((sum, i) => sum + Number(i.price), 0);

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Listar Dívidas",
                    user,
                    user_id: userId,
                    details: `Listagem de dívidas realizada. ` +
                             `Total: ${totalDividas} | ` +
                             `Pendentes: ${totalPendentes} | ` +
                             `Pagas: ${totalPagas} | ` +
                             `Valor pendente: ${valorTotalPendente.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}`,
                    ip,
                    resource: "invoices",
                    duration,
                });

                return res.status(200).send({ 
                    invoices,
                    resumo: {
                        total: totalDividas,
                        pendentes: totalPendentes,
                        pagas: totalPagas,
                        valor_pendente: valorTotalPendente,
                    }
                });

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Listar Dívidas",
                    user,
                    user_id: userId,
                    details: `Erro ao listar dívidas: ${error.message}`,
                    ip,
                    resource: "invoices",
                    duration,
                });

                console.error("Erro ao listar dívidas:", error);
                
                return res.status(500).send({ 
                    error: "Erro ao listar dívidas",
                    message: error.message 
                });
            }
        });
};