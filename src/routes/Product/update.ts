import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";
import { logger } from "../../modules/services/logs/logger";

export const EditProduct = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().put('/product/edit/:id_product', {
        schema: {
            params: z.object({
                id_product: z.string().uuid(),
            }),
            body: z.object({
                name_product: z.string().optional(),
                category: z.string().optional(),
                price: z.string().optional(),
                quantity: z.string().optional(),
                date_validate: z.string().optional(),
            }),
        },
    }, async (req, reply) => {
        const startTime = Date.now();
        const { id_product } = req.params;
        const { name_product, category, price, quantity, date_validate } = req.body;
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const user = (req as any).user?.email || "sistema";
        const userId = (req as any).user?.id;

        try {
            if (!id_product) {
                const duration = Date.now() - startTime;

                await logger.warning({
                    action: "Editar Produto",
                    user,
                    user_id: userId,
                    details: "Tentativa de editar produto sem ID",
                    ip,
                    resource: "products",
                    duration,
                });

                return reply.status(400).send({ message: "O campo id é obrigatório" });
            }

            const productExists = await prisma.products.findUnique({
                where: { id_product },
            });

            if (!productExists) {
                const duration = Date.now() - startTime;

                await logger.warning({
                    action: "Editar Produto",
                    user,
                    user_id: userId,
                    details: `Produto não encontrado para edição. ID: ${id_product}`,
                    ip,
                    resource: "products",
                    resource_id: id_product,
                    duration,
                });

                return reply.status(404).send({ message: "Produto não encontrado" });
            }

            // Montar lista de alterações
            const alteracoes: string[] = [];

            if (name_product && productExists.name_product !== name_product) {
                alteracoes.push(`Nome: "${productExists.name_product}" → "${name_product}"`);
            }
            if (category && productExists.category !== category) {
                alteracoes.push(`Categoria: "${productExists.category}" → "${category}"`);
            }
            if (price && productExists.price !== price) {
                alteracoes.push(`Preço: ${Number(productExists.price).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })} → ${Number(price).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}`);
            }
            if (quantity && productExists.quantity !== quantity) {
                alteracoes.push(`Quantidade: ${productExists.quantity} → ${quantity}`);
            }
            if (date_validate && productExists.date_validate !== date_validate) {
                alteracoes.push(`Validade: ${productExists.date_validate} → ${date_validate}`);
            }

            const product = await prisma.products.update({
                where: { id_product },
                data: {
                    name_product: name_product || productExists.name_product,
                    category: category || productExists.category,
                    price: price || productExists.price,
                    quantity: quantity || productExists.quantity,
                    date_validate: date_validate || productExists.date_validate,
                    updated_at: new Date(),
                },
            });

            const duration = Date.now() - startTime;

            // Se quantidade for 0 ou menos, eliminar o produto
            if (Number(product.quantity) <= 0) {
                // Guardar no histórico de expirados antes de eliminar
                await prisma.produtosExpirados.create({
                    data: {
                        id_product: product.id_product,
                        name_product: product.name_product,
                        category: product.category,
                        price: product.price,
                        quantity: product.quantity,
                        date_validate: product.date_validate,
                        date_expired: new Date(),
                        motivo: "Quantidade zerada na edição",
                        deleted_by: user,
                    }
                });

                await prisma.products.delete({
                    where: { id_product },
                });

                await logger.success({
                    action: "Eliminar Produto",
                    user,
                    user_id: userId,
                    details: `Produto eliminado automaticamente (quantidade zerada). ` +
                             `ID: ${id_product} | Nome: "${productExists.name_product}"`,
                    ip,
                    resource: "products",
                    resource_id: id_product,
                    duration,
                });

                return reply.status(200).send({ 
                    message: "Produto eliminado (quantidade zerada)",
                    product: productExists.name_product
                });
            }

            await logger.success({
                action: "Editar Produto",
                user,
                user_id: userId,
                details: `Produto atualizado com sucesso. ` +
                         `ID: ${id_product} | ` +
                         (alteracoes.length > 0 
                            ? `Alterações: ${alteracoes.join('; ')}` 
                            : 'Nenhuma alteração detectada'),
                ip,
                resource: "products",
                resource_id: id_product,
                duration,
            });

            return reply.status(200).send(product);

        } catch (error: any) {
            const duration = Date.now() - startTime;

            await logger.error({
                action: "Editar Produto",
                user,
                user_id: userId,
                details: `Erro ao editar produto ID ${id_product}: ${error.message}`,
                ip,
                resource: "products",
                resource_id: id_product,
                duration,
            });

            console.error("Erro ao editar produto:", error);
            
            return reply.status(500).send({ 
                error: "Erro ao editar produto",
                message: error.message 
            });
        }
    });
};