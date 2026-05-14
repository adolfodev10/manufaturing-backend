import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { createVendaSchema } from "../../modules/validations/venda/create-venda";
import { logger } from "../../modules/services/logs/logger";
import { randomUUID } from "crypto";
import z from "zod";

export const CreateVenda = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post('/venda/create', {
        schema: {
            body: createVendaSchema,
            params: z.object({}),
        },
    },
        async (req, res) => {

            const startTime = Date.now();
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            
            const authenticatedUser = (req as any).user;

            if (!authenticatedUser) {
                return res.status(401).send({ message: "Usuário não autenticado" });
            }
            const {id_user} = req.body as any;

            const userId = authenticatedUser.id_user || authenticatedUser.sub;
            const userName = authenticatedUser.name || authenticatedUser.email || "sistema";

            console.log("🐛🐛🐛 Usuário Autenticado: ", {userId, userName});

            try {
                const {
                    name_product,
                    category,
                    estado,
                    date_venda,
                    methodPayment,
                    price,
                    date_validate,
                    quantity,
                    created_at,
                    updated_at,
                    client_name,
                    client_nif,
                    payment_details
                } = req.body;

                const venda = await prisma.venda.create({
                    data: {
                        name_product: name_product ?? "",
                        category: category ?? "",
                        estado: estado ?? "VENDIDO",
                        methodPayment,
                        price: String(price ?? "0"),
                        date_validate: new Date(date_validate),
                        quantity: quantity ?? "0",
                        date_venda: date_venda ? new Date(date_venda) : new Date(),
                        created_at: new Date(created_at || Date.now()),
                        updated_at: new Date(updated_at || Date.now()),
                        id: randomUUID(),

                        payment_details: payment_details ?? {},

                        user_id: userId

                        
                    },
                });

                const duration = Date.now() - startTime;

                logger.logSync({
                    level: "SUCCESS",
                    action: "Criar Venda",
                    user:  userName,
                    details: `Venda criada por ${userName}: ${name_product} - Qtd: ${quantity} - Preço: ${price}`,
                    ip,
                    resource: "vendas",
                    resource_id: venda.id,
                    new_value: JSON.stringify({ 
                        name_product,
                         category,
                          methodPayment,
                           price,
                            quantity,
                            date_venda,
                            operator: userName,
                            client: client_name
                             }),
                    duration,
                });

                return res.status(201).send({
                    ...venda,
                        message: `Venda registrada com sucesso por ${userName}`,
                });

            } catch (error) {
                const duration = Date.now() - startTime;

                logger.logSync({
                    level: "ERROR",
                    action: "Criar Venda",
                    user: userName,
                    details: `Erro ao criar venda: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
                    ip,
                    resource: "vendas",
                    duration,
                    old_value: JSON.stringify(req.body), // 👈 String, não Object
                });

                console.error("Erro ao criar venda:", error);
                return res.status(500).send({
                    message: "Erro interno ao criar venda",
                    error: error instanceof Error ? error.message : error,
                });
            }
        }
    );
};