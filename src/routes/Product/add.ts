import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { addProductSchema } from "../../modules/validations/product/add-product";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";
import { randomUUID } from "crypto";

export const AddProductInStock = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post('/product/add', {
        schema: {
            body: addProductSchema
        },
    },
        async (req, reply) => {
            const startTime = Date.now();
            const { name_product, price, quantity, date_validate, category, user_id } = req.body;
            const ip = req.ip || req.socket.remoteAddress || "unknown";
            const user = (req as any).user?.email || "sistema";
            const userId = (req as any).user?.id;

            try {
                // Verificar se já existe produto com mesmo nome (opcional)
                const existingProduct = await prisma.products.findFirst({
                    where: { 
                        name_product,
                        estado: { not: "VENDIDO" }
                    }
                });

                if (existingProduct) {
                    const duration = Date.now() - startTime;

                    await logger.warning({
                        action: "Adicionar Produto",
                        user,
                        user_id: userId,
                        details: `Tentativa de adicionar produto com nome duplicado: "${name_product}". Produto existente ID: ${existingProduct.id_product}`,
                        ip,
                        resource: "products",
                        duration,
                    });

                    return reply.status(409).send({ 
                        message: "Já existe um produto com este nome em stock",
                        produto_existente: existingProduct.id_product
                    });
                }

                const addProduct = await prisma.products.create({
                    data: {
                        name_product: name_product ?? "",
                        category: category ?? "Sem categoria",
                        date_validate: date_validate ?? "",
                        price,
                        quantity,
                        updated_at: new Date(),
                        created_at: new Date(),
                        estado: "NAO_VENDIDO",
                        id_product:randomUUID(),
                    }
                });

                const duration = Date.now() - startTime;

                await logger.success({
                    action: "Adicionar Produto",
                    user,
                    user_id: userId,
                    details: `Produto adicionado ao stock com sucesso. ` +
                             `ID: ${addProduct.id_product} | ` +
                             `Nome: "${addProduct.name_product}" | ` +
                             `Categoria: ${addProduct.category} | ` +
                             `Preço: ${Number(addProduct.price).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })} | ` +
                             `Quantidade: ${addProduct.quantity} | ` +
                             `Validade: ${addProduct.date_validate || 'Não definida'}`,
                    ip,
                    resource: "products",
                    resource_id: addProduct.id_product,
                    duration,
                });

                return reply.status(201).send({ 
                    message: "Produto adicionado com sucesso",
                    product: addProduct 
                });

            } catch (error: any) {
                const duration = Date.now() - startTime;

                await logger.error({
                    action: "Adicionar Produto",
                    user,
                    user_id: userId,
                    details: `Erro ao adicionar produto "${name_product}": ${error.message}`,
                    ip,
                    resource: "products",
                    duration,
                });

                console.error("Erro ao adicionar produto:", error);
                
                return reply.status(500).send({ 
                    error: "Erro ao adicionar produto",
                    message: error.message 
                });
            }
        });
};