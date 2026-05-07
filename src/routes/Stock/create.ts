import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createProductSchema } from "../../modules/validations/product/create-product";
import { prisma } from "../../lib/prismaclient";
import { randomUUID } from "crypto";

export const CreateStockProduct = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post('/stock/create', {
        schema: {
            body: createProductSchema
        },
    },
        async (request, reply) => {
            const { name, price, category, quantity, date_validate } = request.body;
            const productExists = await prisma.estoque.findFirst({
                where: {
                    OR: [
                        {
                            name: name,
                        },
                    ],
                }
            })
            if (productExists) return reply.status(400).send({ error: "Product name already exists" })
            const products = await prisma.estoque.create({
                data: {
                    name: name ?? "",
                    price,
                    category: category,
                    date_validate: date_validate,
                    quantity: quantity,
                    updated_at: new Date(),
                    id_estoque: randomUUID(),
                }
            })
            return reply.code(201).send({ products });
        })
}