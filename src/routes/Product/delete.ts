import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";

export const DeleteProduct = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete("/product/delete/:id_product", {
        schema: {
            params: z.object({
                id_product: z.string().nonempty("O Campo id é obriigatório."),
            }),
        },
    }, async (req, reply) => {
        const { id_product } = req.params;

        const product = await prisma.products.findUnique({
            where: {
                id_product,
            },
        });

        if (!product) {
            return reply.status(404).send({ message: "Produto não encontrado" });
        }
        await prisma.products.delete({
            where: {
                id_product,
            },
        });

        return reply.status(200).send({ message: "Produto apagado com sucesso" });
    })
}