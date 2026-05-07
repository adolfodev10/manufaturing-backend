import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { addProductSchema } from "../../modules/validations/product/add-product";
import { prisma } from "../../lib/prismaclient";
import { randomUUID } from "crypto";

export const AddProductInStock = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().post('/product/add', {
        schema: {
            body: addProductSchema
        },
    },
        async (req, reply) => {
            const { name_product, price, quantity, date_validate, category, user_id } = req.body;
            const addProduct = await prisma.products.create({
                data: {
                    name_product: name_product ?? "",
                    category,
                    date_validate: date_validate ?? "",
                    price,
                    quantity,
                    id_product:randomUUID(),
                    updated_at: new Date(),
                }
            })
            return reply.status(200).send({ addProduct });
        })
}