import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { createVendaSchema } from "../../modules/validations/venda/create-venda";

export const CreateVenda = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post("/venda/create", {
        schema: {
            body: createVendaSchema,
            params: z.object({}),
        },
    },
        async (req, res) => {

            const startTime = Date.now();
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = req.authenticatedUser?.name || "sistema";
            const userId = req.authenticatedUser?.id_user;

            if (!userId) {
                return res.status(401).send({ error: "Usuario autenticado nao encontrado" });
            }

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
                        user_id: userId,
                    },
                });

                const duration = Date.now() - startTime;

                logger.success({
                    action: "Criar Venda",
                    user,
                    details: `Venda criada: ${name_product} - Qtd: ${quantity} - Preco: ${price}`,
                    ip,
                    resource: "vendas",
                    resource_id: venda.id,
                    new_value: JSON.stringify({ name_product, category, methodPayment, price, quantity, date_venda }),
                    duration,
                });

                return res.status(201).send(venda);

            } catch (error) {
                const duration = Date.now() - startTime;

                logger.error({
                    action: "Criar Venda",
                    user,
                    details: `Erro ao criar venda: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
                    ip,
                    resource: "vendas",
                    duration,
                    old_value: JSON.stringify(req.body),
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
