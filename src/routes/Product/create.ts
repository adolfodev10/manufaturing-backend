import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createProductSchema } from "../../modules/validations/product/create-product";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { randomUUID } from "crypto";

export const CreateProduct = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post('/product/create', {
        schema: {
            body: createProductSchema
        },
    },
        async (request, reply) => {
            const startTime = Date.now();
            const { name, price, category, quantity, date_validate } = request.body;
            const ip = request.ip || request.socket.remoteAddress || "unknown";
            const user = (request as any).user?.email || "sistema";
            const userId = (request as any).user?.id;

            try {
                // Verificar se já existe produto com o mesmo nome
                const productExists = await prisma.products.findFirst({
                    where: {
                        name_product: name,
                        estado: { not: "VENDIDO" }
                    }
                });

                if (productExists) {
                    const duration = Date.now() - startTime;

                    await logger.warning({
                        action: "Criar Produto",
                        user,
                        user_id: userId,
                        details: `Tentativa de criar produto duplicado: "${name}". Produto existente ID: ${productExists.id_product}`,
                        ip,
                        resource: "products",
                        resource_id: productExists.id_product,
                        duration,
                    });

                    return reply.status(409).send({ 
                        message: "Já existe um produto com este nome",
                        productExists 
                    });
                }

                const product = await prisma.products.create({
                    data: {
                        id_product: randomUUID(),
                        name_product: name ?? "",
                        price,
                        category: category ?? "Sem categoria",
                        date_validate: date_validate ?? "",
                        quantity: quantity ?? "0",
                        updated_at: new Date(),
                        created_at: new Date(),
                        estado: "NAO_VENDIDO",
                    }
                });

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Criar Produto",
                    user,
                    user_id: userId,
                    details: `Produto criado com sucesso. ` +
                             `ID: ${product.id_product} | ` +
                             `Nome: "${product.name_product}" | ` +
                             `Categoria: ${product.category} | ` +
                             `Preço: ${Number(product.price).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })} | ` +
                             `Quantidade: ${product.quantity} | ` +
                             `Validade: ${product.date_validate || 'Não definida'}`,
                    ip,
                    resource: "products",
                    resource_id: product.id_product,
                    duration,
                });

                return reply.status(201).send({ 
                    message: "Produto criado com sucesso",
                    product 
                });

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Criar Produto",
                    user,
                    user_id: userId,
                    details: `Erro ao criar produto "${name}": ${error.message}`,
                    ip,
                    resource: "products",
                    duration,
                });

                console.error("Erro ao criar produto:", error);
                
                return reply.status(500).send({ 
                    error: "Erro ao criar produto",
                    message: error.message 
                });
            }
        });
};