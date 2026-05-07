import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";

export const EditStock = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().put('/stock/edit/:id_estoque', {
        schema: {
            params: z.object({
                id_estoque: z.string().uuid(),
            }),
            body: z.object({
                name: z.string().optional(),
                category: z.string().optional(),
                price: z.string().optional(),
                quantity: z.string().optional(),
                date_validate: z.string(),
            }),
        },
    }, async (req, reply) => {
        const { id_estoque } = req.params;
        const { name, category, price, quantity, date_validate } = req.body;
        if (!id_estoque) {
            return reply.status(400).send({ message: "O campo id é obrigatório" });
        }
        const stockExists = await prisma.estoque.findUnique({
            where: {
                id_estoque,
            },
        });

        if (!stockExists) {
            return reply.status(404).send({ message: "Produto não encontrado" });
        }
        const stock = await prisma.estoque.update({
            where: {
                id_estoque,
            },
            data: {
                name,
                category,
                price: price || stockExists.price,
                quantity: quantity || stockExists.quantity,
                date_validate,
            },
        });

        if (Number(stock.quantity) <= 0) {
            await prisma.estoque.delete({
                where: {
                    id_estoque,
                },
            });
            return reply.status(200).send({ message: "Produto apagado com sucesso" });
        }
        return reply.status(200).send(stock);
    });
}