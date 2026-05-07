import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prismaclient";

export const deleteProduct = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().delete("/stock/delete/:id_estoque", {
        schema: {
            params: z.object({
                id_estoque: z.string().nonempty("O Campo id é obrigatório."),
            }),
        },
    }, async (req, reply) => {
        const { id_estoque } = req.params;

        const product = await prisma.estoque.findUnique({
            where: {
                id_estoque,
            },
        });

        if (!product) {
            return reply.status(404).send({ message: "Produto não encontrado" });
        }
        await prisma.estoque.delete({
            where: {
                id_estoque,
            },
        });

        return reply.status(200).send({ message: "Produto apagado com sucesso" });
    })
}