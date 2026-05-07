import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";

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
                date_validate: z.string(),
            }),
        },
    }, async (req, reply) => {
        const { id_product } = req.params;
        const { name_product, category, price, quantity, date_validate } = req.body;
        if (!id_product) {
            return reply.status(400).send({ message: "O campoo id é obrigatorio" });
        }

        const productExists = await prisma.products.findUnique({
            where: {
                id_product,
            },
        });

        if (!productExists) {
            return reply.status(404).send({ message: "Produto nao encontrado" });
        }

        const product = await prisma.products.update({
            where: {
                id_product,
            },
            data: {
                name_product,
                category,
                price: price || productExists.price,
                quantity: quantity || productExists.quantity,
                date_validate,
            },
        });
        if (Number(product.quantity) <= 0) {
            await prisma.products.delete({
                where: {
                    id_product,
                },
            });
            return reply.status(200).send({ message: "Produto apagado com sucesso" });
        }
        return reply.status(200).send(product);

    });
}