import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { createInvoiceSchema } from "../../modules/validations/invoices/create-invoice-schema";
import { logger } from "../../modules/services/logs/logger";

export const CreateInvoice = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post("/invoice/create", {
        schema: {
            body: createInvoiceSchema
        },
    },
        async (req, reply) => {
            const startTime = Date.now();
            const { id_invoice, client_id, product_id = "", price, date } = req.body;
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                // Verificar se o cliente existe
                const clientExists = await prisma.clients.findUnique({
                    where: { id_client: client_id },
                    select: { id_client: true, name: true }
                });

                if (!clientExists) {
                    const duration = Date.now() - startTime;

                    await logger.warning({
                        action: "Criar Dívida",
                        user,
                        user_id: userId,
                        details: `Tentativa de criar dívida com cliente inexistente. Cliente ID: ${client_id}`,
                        ip,
                        resource: "invoices",
                        duration,
                    });

                    return reply.status(404).send({ 
                        error: "Cliente não encontrado" 
                    });
                }

                // Verificar se já existe dívida com mesmo ID
                const existingInvoice = await prisma.invoices.findUnique({
                    where: { id_invoice }
                });

                if (existingInvoice) {
                    const duration = Date.now() - startTime;

                    await logger.warning({
                        action: "Criar Dívida",
                        user,
                        user_id: userId,
                        details: `Tentativa de criar dívida com ID duplicado. ID: ${id_invoice}`,
                        ip,
                        resource: "invoices",
                        resource_id: id_invoice,
                        duration,
                    });

                    return reply.status(409).send({ 
                        error: "Já existe uma dívida com este ID" 
                    });
                }

                const data: any = {
                    id_invoice,
                    client_id,
                    price,
                    date: date || new Date(),
                    approval: 'NAO_PAGAS',
                    updated_at: new Date(),
                    created_at: new Date(),
                };
                
                if (product_id) {
                    data.product_id = product_id;
                }
                
                const invoice = await prisma.invoices.create({ data });

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Criar Dívida",
                    user,
                    user_id: userId,
                    details: `Dívida registada com sucesso. ` +
                             `ID: ${id_invoice} | ` +
                             `Cliente: ${clientExists.name} (${client_id}) | ` +
                             `Valor: ${price.toLocaleString()} | ` +
                             `Produto: ${product_id || 'Não especificado'} | ` +
                             `Estado: Pendente (NAO_PAGAS)`,
                    ip,
                    resource: "invoices",
                    resource_id: id_invoice,
                    duration,
                });

                return reply.status(201).send({ invoice });

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Criar Dívida",
                    user,
                    user_id: userId,
                    details: `Erro ao registar dívida ID ${id_invoice}: ${error.message}`,
                    ip,
                    resource: "invoices",
                    resource_id: id_invoice,
                    duration,
                });

                console.error("Erro ao criar dívida:", error);
                
                return reply.status(500).send({ 
                    error: "Erro ao registar dívida",
                    message: error.message 
                });
            }
        }
    );
};