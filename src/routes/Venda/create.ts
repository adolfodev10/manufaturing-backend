import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prismaclient";
import { createVendaSchema } from "../../modules/validations/venda/create-venda";
import { logger } from "../../modules/services/logs/logger";
import { randomUUID } from "crypto";

export const CreateVenda = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post('/venda/create', {
        schema: {
            body: createVendaSchema
        },
    },
        async (req, res) => {

            const startTime = Date.now();
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            const user = (req as any).user?.name || 'sistema';
            const userId = (req as any).user?.id;

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
                    updated_at
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
                        created_at: new Date(created_at),
                        updated_at: new Date(updated_at),
                        id: randomUUID(),
                        user_id: userId || "4265c1f5-4d66-11f1-927f-d481d7a48bc8", // 👈 FK obrigatória
                    },
                });

                const duration = Date.now() - startTime;

                logger.logSync({
                    level: "SUCCESS",
                    action: "Criar Venda",
                    user,
                    user_id: userId,
                    details: `Venda criada: ${name_product} - Qtd: ${quantity} - Preço: ${price}`,
                    ip,
                    resource: "vendas",
                    resource_id: venda.id,
                    new_value: JSON.stringify({ name_product, category, methodPayment, price, quantity, date_venda }),
                    duration,
                });

                return res.status(201).send(venda);

            } catch (error) {
                const duration = Date.now() - startTime;

                logger.logSync({
                    level: "ERROR",
                    action: "Criar Venda",
                    user,
                    user_id: userId,
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