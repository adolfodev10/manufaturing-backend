import { FastifyInstance } from "fastify";
import z from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const DeleteInvoice = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete('/invoice/delete/:id', {
        schema: {
            params: z.object({
                id: z.string().nonempty("O campo id é obrigatório."),
            }),
        },
    },
        async (req, res) => {
            const startTime = Date.now();
            const { id } = req.params;
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                const invoice = await prisma.invoices.findUnique({
                    where: { id_invoice: id },
                    include: {
                        clients: {
                            select: {
                                name: true,
                                nif: true,
                            }
                        }
                    }
                });

                if (!invoice) {
                    const duration = Date.now() - startTime;

                    await logger.warning({
                        action: "Eliminar Dívida",
                        user,
                        user_id: userId,
                        details: `Tentativa de eliminar dívida inexistente. ID: ${id}`,
                        ip,
                        resource: "invoices",
                        resource_id: id,
                        duration,
                    });

                    return res.status(404).send({ message: 'Dívida não encontrada' });
                }

                // Guardar informações antes de eliminar para o log
                const invoiceInfo = {
                    id: invoice.id_invoice,
                    cliente: (invoice as any).client?.name || "N/A",
                    nif: (invoice as any).client?.nif || "N/A",
                    valor: invoice.price,
                    estado: invoice.approval,
                    produto: invoice.product_id || "N/A",
                    data: invoice.date,
                    criado_em: invoice.created_at,
                };

                await prisma.invoices.delete({
                    where: {
                        id_invoice: id,
                    },
                });

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Eliminar Dívida",
                    user,
                    user_id: userId,
                    details: `Dívida eliminada com sucesso. ` +
                             `ID: ${invoiceInfo.id} | ` +
                             `Cliente: ${invoiceInfo.cliente} (NIF: ${invoiceInfo.nif}) | ` +
                             `Valor: ${Number(invoiceInfo.valor).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })} | ` +
                             `Estado: ${invoiceInfo.estado === 'NAO_PAGAS' ? 'Pendente' : 'Paga'} | ` +
                             `Produto: ${invoiceInfo.produto} | ` +
                             `Data: ${new Date(invoiceInfo.data).toISOString()}`,
                    ip,
                    resource: "invoices",
                    resource_id: id,
                    duration,
                });

                return res.status(200).send({ message: "Dívida eliminada com sucesso" });

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Eliminar Dívida",
                    user,
                    user_id: userId,
                    details: `Erro ao eliminar dívida ID ${id}: ${error.message}`,
                    ip,
                    resource: "invoices",
                    resource_id: id,
                    duration,
                });

                console.error("Erro ao eliminar dívida:", error);
                
                return res.status(500).send({ 
                    error: "Erro ao eliminar dívida",
                    message: error.message 
                });
            }
        }
    );
};