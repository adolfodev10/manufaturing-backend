import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { createDividaSchema } from "../../modules/validations/dividas/create-divida-schema";

export const CreateDivida = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post("/divida/create", {
        schema: {
            body: createDividaSchema
        },
    },
        async (req, reply) => {
            const startTime = Date.now();
            const { id_divida, client_id, product_id = "", price, date } = req.body;
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
                        resource: "dividas",
                        duration,
                    });

                    return reply.status(404).send({ 
                        error: "Cliente não encontrado" 
                    });
                }

                // Verificar se já existe dívida com mesmo ID
                const existingDivida = await prisma.dividas.findUnique({
                    where: { id_divida }
                });

                if (existingDivida) {
                    const duration = Date.now() - startTime;

                    await logger.warning({
                        action: "Criar Dívida",
                        user,
                        user_id: userId,
                        details: `Tentativa de criar dívida com ID duplicado. ID: ${id_divida}`,
                        ip,
                        resource: "dividas",
                        resource_id: id_divida,
                        duration,
                    });

                    return reply.status(409).send({ 
                        error: "Já existe uma dívida com este ID" 
                    });
                }

                const data: any = {
                    id_divida,
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
                
                const divida = await prisma.dividas.create({ data });

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Criar Dívida",
                    user,
                    user_id: userId,
                    details: `Dívida registada com sucesso. ` +
                             `ID: ${id_divida} | ` +
                             `Cliente: ${clientExists.name} (${client_id}) | ` +
                             `Valor: ${price.toLocaleString()} | ` +
                             `Produto: ${product_id || 'Não especificado'} | ` +
                             `Estado: Pendente (NAO_PAGAS)`,
                    ip,
                    resource: "dividas",
                    resource_id: id_divida,
                    duration,
                });

                return reply.status(201).send({ divida });

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Criar Dívida",
                    user,
                    user_id: userId,
                    details: `Erro ao registar dívida ID ${id_divida}: ${error.message}`,
                    ip,
                    resource: "dividas",
                    resource_id: id_divida,
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